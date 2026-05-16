import { redis } from './redis.js';
import { SESSION_EXPIRY } from './constants.js';

const SESSION_PREFIX = 'session:';

/** Add a session mapping socket ID -> user ID */
export async function addSession(socketId: string, userId: string) {
  await redis.set(`${SESSION_PREFIX}${socketId}`, userId, 'EX', SESSION_EXPIRY);
}

/** Remove a session by socket ID */
export async function removeSession(socketId: string) {
  await redis.del(`${SESSION_PREFIX}${socketId}`);
}

/** Get user ID for a socket */
export async function getUserId(socketId: string): Promise<string | null> {
  return await redis.get(`${SESSION_PREFIX}${socketId}`);
}

/** Get count of total active socket sessions */
export async function getTotalSessions(): Promise<number> {
  const keys = await redis.keys(`${SESSION_PREFIX}*`);
  return keys.length;
}

/** Get count of unique online users */
export async function getUniqueUserCount(): Promise<number> {
  const ids = await getUniqueUserIds();
  return ids.size;
}

/** Get unique online user IDs across all nodes */
export async function getUniqueUserIds(): Promise<Set<string>> {
  const userIds = new Set<string>();
  let cursor = '0';
  
  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `${SESSION_PREFIX}*`, 'COUNT', 100);
    cursor = nextCursor;
    
    if (keys.length > 0) {
      const values = await redis.mget(keys);
      values.forEach(id => {
        if (id) userIds.add(id);
      });
    }
  } while (cursor !== '0');
  
  return userIds;
}
