import { FastifyInstance } from 'fastify';
import { randomUUID as uuid } from 'crypto';
import {
  addSession,
  removeSession,
  getUserId,
  getUniqueUserIds,
} from './lib/sessionStore.js';
import prisma from './lib/prisma.js';
import { tileService } from './services/tileService.js';
import { tileClaimService } from './services/tileClaimService.js';
import { leaderboardService } from './services/leaderboardService.js';
import { userService } from './services/userService.js';
import { tileClaimSchema, userSchema } from './lib/validation.js';
import { DEBOUNCE_DELAY, RATE_LIMIT_MS } from './lib/constants.js';
import { Socket, Server as IOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import redis from './lib/redis.js';

export default function setupSocket(app: FastifyInstance) {
  const pubClient = redis;
  const subClient = redis.duplicate();
  subClient.on('error', (err) => {
    app.log.error({ err }, 'Redis SubClient Error');
  });

  // Generic debounced broadcast helper
  const timeouts = new Map<string, NodeJS.Timeout>();

  function broadcastDebounced(io: IOServer, event: string, task: () => Promise<void>) {
    if (timeouts.has(event)) {
      clearTimeout(timeouts.get(event)!);
    }

    const timeout = setTimeout(async () => {
      try {
        await task();
        timeouts.delete(event);
      } catch (err) {
        app.log.error({ err, event }, 'Debounced broadcast failed');
      }
    }, DEBOUNCE_DELAY);

    timeouts.set(event, timeout);
  }

  async function broadcastPresence(io: IOServer) {
    broadcastDebounced(io, 'presence:update', async () => {
      const uniqueUserIds = await getUniqueUserIds();
      const users = await prisma.user.findMany({
        where: { id: { in: Array.from(uniqueUserIds) } },
        select: {
          id: true,
          username: true,
          color: true,
          _count: { select: { tiles: true } },
        },
      });

      const mappedUsers = users.map((u) => ({
        id: u.id,
        username: u.username,
        color: u.color,
        tilesOwned: u._count.tiles,
      }));

      io.emit('presence:update', {
        count: uniqueUserIds.size,
        users: mappedUsers,
      });
    });
  }

  async function broadcastLeaderboard(io: IOServer) {
    broadcastDebounced(io, 'leaderboard:update', async () => {
      const leaderboard = await leaderboardService.getLeaderboard();
      io.emit('leaderboard:update', leaderboard);
    });
  }

  const RATE_LIMIT_PREFIX = 'ratelimit:';

  const io = new IOServer(app.server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.adapter(createAdapter(pubClient, subClient));

  io.on('connection', (socket: Socket) => {
    // Grid sync
    socket.on('grid:request_sync', async () => {
      try {
        const gridState = await tileService.getGridState();
        socket.emit('grid:sync', gridState);
      } catch (err) {
        app.log.error({ err }, 'Failed to fetch grid state');
      }
    });

    // Tile claim
    socket.on('tile:claim', async (data: unknown) => {
      let validatedUserId: string | null = null;
      try {
        const validationResult = tileClaimSchema.safeParse(data);
        if (!validationResult.success) {
          socket.emit('tile:error', { id: 'unknown', message: 'Invalid payload structure', originalStatus: 'unclaimed' });
          return;
        }

        validatedUserId = await getUserId(socket.id);
        app.log.info({ socketId: socket.id, validatedUserId }, 'Attempting to claim tile');

        if (!validatedUserId) {
          app.log.warn({ socketId: socket.id }, 'Invalid session for tile claim');
          socket.emit('tile:error', { id: validationResult.data.id, message: 'Invalid session', originalStatus: 'unclaimed' });
          return;
        }

        const rateLimitKey = `${RATE_LIMIT_PREFIX}${validatedUserId}`;
        const setSuccess = await redis.set(rateLimitKey, 'locked', 'PX', RATE_LIMIT_MS, 'NX');

        if (!setSuccess) {
          app.log.info({ userId: validatedUserId }, 'Rate limit hit for tile claim');
          socket.emit('tile:error', { id: validationResult.data.id, message: 'Please wait before claiming another tile', originalStatus: 'unclaimed' });
          return;
        }

        const result = await tileClaimService.claimTile({
          userId: validatedUserId,
          tileId: validationResult.data.id,
        });

        app.log.info({ userId: validatedUserId, tileId: validationResult.data.id, success: result.success }, 'Tile claim result');

        if (result.success && result.tile) {
          io.emit('tile:update', result.tile);

          const user = await userService.getUser(validatedUserId);
          io.emit('activity:new', {
            id: uuid(),
            type: 'claim',
            userId: validatedUserId,
            username: user?.username || 'Guest',
            userColor: user?.color || '#3b82f6',
            tileId: validationResult.data.id,
            timestamp: new Date(),
          });

          broadcastLeaderboard(io);
        } else if (result.error) {
          socket.emit('tile:error', { id: validationResult.data.id, message: result.error.message, originalStatus: 'unclaimed' });
        }
      } catch (err) {
        app.log.error({ err, userId: validatedUserId }, 'Tile claim failed');
        const parsed = tileClaimSchema.safeParse(data);
        socket.emit('tile:error', {
          id: parsed.success ? parsed.data.id : 'unknown',
          message: err instanceof Error ? err.message : 'Unknown error',
          originalStatus: 'unclaimed',
        });
      }
    });

    // Tile capture (from manual setup)
    socket.on('tile:capture', (data) => {
      app.log.info({ socketId: socket.id, data }, 'Tile captured');
      io.emit('tile:update', data);
    });

    // User profile updates
    socket.on('user:update', async (data: unknown) => {
      let validatedUserId: string | null = null;
      try {
        const validationResult = userSchema.safeParse(data);
        if (!validationResult.success) {
          socket.emit('user:error', { message: validationResult.error.issues[0].message });
          return;
        }

        validatedUserId = await getUserId(socket.id);
        if (!validatedUserId) {
          socket.emit('user:error', { message: 'Invalid session' });
          return;
        }

        const updatedUser = await userService.upsertUser(validatedUserId, validationResult.data);

        socket.emit('user:sync', {
          id: updatedUser.id,
          username: updatedUser.username,
          color: updatedUser.color,
          ownedTilesCount: (updatedUser as any)._count?.tiles || 0,
        });

        broadcastPresence(io);
        broadcastLeaderboard(io);
      } catch (err) {
        app.log.error({ err, userId: validatedUserId }, 'User update failed');
        socket.emit('user:error', { message: 'Failed to update profile' });
      }
    });

    // Leaderboard request
    socket.on('leaderboard:request', async () => {
      try {
        const leaderboard = await leaderboardService.getLeaderboard();
        socket.emit('leaderboard:sync', leaderboard);
      } catch (err) {
        app.log.error({ err }, 'Failed to fetch leaderboard');
      }
    });

    // Session setup
    (async () => {
      try {
        let userId = socket.handshake.query.userId as string;
        if (!userId || userId === 'null' || userId === 'undefined') userId = uuid();

        // 1. Ensure user exists in DB first (important for foreign keys)
        const user = await userService.upsertUser(userId, {});

        // 2. Map session in Redis
        await addSession(socket.id, userId);

        app.log.info({ socketId: socket.id, userId }, '🟢 Client connected and session mapped');

        // 3. Notify client
        socket.emit('session', { userId, ownedTilesCount: (user as any)?._count?.tiles || 0 });

        // 4. Update presence for everyone
        broadcastPresence(io);
      } catch (err) {
        app.log.error({ err, socketId: socket.id }, 'Error during session setup');
      }
    })();

    // Cleanup
    socket.on('disconnect', async () => {
      await removeSession(socket.id);
      broadcastPresence(io);
    });
  });
}
