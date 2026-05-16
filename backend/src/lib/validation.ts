import { z } from 'zod';

// Schema for tile:claim event payload
export const tileClaimSchema = z.object({
  id: z.string().min(1, 'Tile ID is required'),
});

// Type inference from schema
export type TileClaimPayload = z.infer<typeof tileClaimSchema>;

// Environment variables schema
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  CORS_ORIGIN: z.string().default('*'),
});

export type Env = z.infer<typeof envSchema>;

// User validation schema
export const userSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username contains invalid characters'),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a valid 6-digit hex code'),
});

export type UserPayload = z.infer<typeof userSchema>;

// Shared Interfaces
export interface TileData {
  id: string;
  x: number;
  y: number;
  status: 'unclaimed' | 'claimed' | 'claiming';
  ownerId?: string | null;
  ownerName?: string;
  color?: string;
}

export interface GridState {
  tiles: Record<string, TileData>;
  rows: number;
  cols: number;
}
