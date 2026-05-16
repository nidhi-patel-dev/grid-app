import prisma from '../lib/prisma.js';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  color: string;
  tileCount: number;
}

export interface LeaderboardResult {
  leaderboard: LeaderboardEntry[];
  timestamp: string;
}

/**
 * LeaderboardService - Handles leaderboard calculations and queries
 * Optimized for performance with Prisma aggregation
 */
export class LeaderboardService {
  private static readonly TOP_N = 10; // Show top 10 users

  /**
   * Get the current leaderboard with rankings
   * @returns Leaderboard data with top users by tile count
   */
  async getLeaderboard(): Promise<LeaderboardResult> {
    const users = await prisma.user.findMany({
      where: {
        tiles: {
          some: {
            ownerId: {
              not: null,
            },
          },
        },
      },
      orderBy: {
        tiles: {
          _count: 'desc',
        },
      },
      take: LeaderboardService.TOP_N,
      select: {
        id: true,
        username: true,
        color: true,
        _count: {
          select: {
            tiles: true,
          },
        },
      },
    });

    const leaderboard: LeaderboardEntry[] = users.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      username: user.username,
      color: user.color,
      tileCount: user._count.tiles,
    }));

    return {
      leaderboard,
      timestamp: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const leaderboardService = new LeaderboardService();
