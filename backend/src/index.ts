import Fastify, { FastifyInstance, FastifyError } from 'fastify';
import fastifyEnv from '@fastify/env';
import setupSocket from './socket.js';
import { envSchema, Env } from './lib/validation.js';
import prisma from './lib/prisma.js';
import redis from './lib/redis.js';
import { getTotalSessions, getUniqueUserCount } from './lib/sessionStore.js';

// Type augmentation for Fastify config
declare module 'fastify' {
  interface FastifyInstance {
    config: Env;
  }
}

const fastify: FastifyInstance = Fastify({
  logger: {
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
});

// Global Error Handler
fastify.setErrorHandler((error: FastifyError, _request, reply) => {
  fastify.log.error(error);
  reply.status(error.statusCode || 500).send({
    error: error.name || 'InternalServerError',
    message: error.message || 'An unexpected error occurred',
    statusCode: error.statusCode || 500,
  });
});

const start = async () => {
  try {
    // Environment handling
    await fastify.register(fastifyEnv, {
      schema: {
        type: 'object',
        required: ['DATABASE_URL'],
        properties: {
          PORT: { type: 'number', default: 3001 },
          HOST: { type: 'string', default: '0.0.0.0' },
          DATABASE_URL: { type: 'string' },
          NODE_ENV: { type: 'string', default: 'development' },
          CORS_ORIGIN: { type: 'string', default: '*' },
        },
      },
      dotenv: true,
    });

    // Validate with Zod as well for extra safety and better types
    envSchema.parse(fastify.config);

    // Initialize sockets
    setupSocket(fastify);

    // Deep Health Check Endpoint
    fastify.get('/health', async (_req, reply) => {
      const checks: Record<string, any> = {
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      };

      try {
        // 1. Check Database
        await prisma.$queryRaw`SELECT 1`;
        checks.database = 'UP';
      } catch (err) {
        checks.database = 'DOWN';
        checks.status = 'DEGRADED';
      }

      try {
        // 2. Check Redis
        const pong = await redis.ping();
        checks.redis = pong === 'PONG' ? 'UP' : 'DOWN';
        if (checks.redis === 'DOWN') checks.status = 'DEGRADED';
      } catch (err) {
        checks.redis = 'DOWN';
        checks.status = 'DEGRADED';
      }

      try {
        // 3. Collect Socket Metrics
        checks.sessions = {
          total: await getTotalSessions(),
          uniqueUsers: await getUniqueUserCount(),
        };
      } catch (err) {
        checks.sessions = 'ERROR';
      }

      return reply.code(checks.status === 'UP' ? 200 : 503).send(checks);
    });

    const { PORT, HOST } = fastify.config;

    await fastify.listen({ port: PORT, host: HOST });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    fastify.log.info(`Received ${signal}, shutting down...`);
    try {
      await fastify.close();
      await prisma.$disconnect();
      fastify.log.info('Server shut down gracefully');
      process.exit(0);
    } catch (err) {
      fastify.log.error(err as Error, 'Error during graceful shutdown');
      process.exit(1);
    }
  });
});

start();
