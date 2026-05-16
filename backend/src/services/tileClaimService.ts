import prisma from '../lib/prisma.js';
import { GRID_ROWS, GRID_COLS } from '../lib/constants.js';

export interface TileClaimRequest {
  userId: string;
  tileId: string;
}

export interface TileClaimResult {
  success: boolean;
  tile?: {
    id: string;
    x: number;
    y: number;
    status: 'claimed';
    ownerId: string;
    ownerName?: string;
    color?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface TileCoordinates {
  x: number;
  y: number;
}

/**
 * TileClaimService - Isolated business logic for tile claiming
 * Handles validation, ownership checks, and claim processing
 */
export class TileClaimService {
  /**
   * Validates tile coordinates
   * @param tileId - Tile ID in format "x-y"
   * @returns Validated coordinates or throws error
   */
  private validateTileCoordinates(tileId: string): TileCoordinates {
    const parts = tileId.split('-');
    if (parts.length !== 2) {
      throw new Error('INVALID_TILE_FORMAT');
    }

    const x = parseInt(parts[0], 10);
    const y = parseInt(parts[1], 10);

    if (isNaN(x) || isNaN(y)) {
      throw new Error('INVALID_COORDINATES');
    }

    if (x < 0 || x >= GRID_COLS) {
      throw new Error('COORDINATES_OUT_OF_BOUNDS');
    }

    if (y < 0 || y >= GRID_ROWS) {
      throw new Error('COORDINATES_OUT_OF_BOUNDS');
    }

    return { x, y };
  }

  /**
   * Processes the tile claim using atomic update
   * @param coordinates - Tile coordinates
   * @param userId - User claiming the tile
   * @returns Claimed tile data or null if tile was already claimed
   */
  private async processClaim(
    coordinates: TileCoordinates,
    userId: string,
  ): Promise<{
    success: boolean;
    tile?: {
      id: string;
      x: number;
      y: number;
      status: 'claimed';
      ownerId: string;
      ownerName?: string;
      color?: string;
    };
  }> {
    const tile = await prisma.tile.upsert({
      where: {
        x_y: {
          x: coordinates.x,
          y: coordinates.y,
        },
      },
      update: {
        ownerId: userId,
        claimedAt: new Date(),
      },
      create: {
        x: coordinates.x,
        y: coordinates.y,
        ownerId: userId,
        claimedAt: new Date(),
      },
      include: {
        owner: true,
      },
    });

    if (!tile.ownerId) {
      return { success: false };
    }

    return {
      success: true,
      tile: {
        id: `${coordinates.x}-${coordinates.y}`,
        x: coordinates.x,
        y: coordinates.y,
        status: 'claimed' as const,
        ownerId: tile.ownerId,
        ownerName: tile.owner?.username,
        color: tile.owner?.color,
      },
    };
  }

  /**
   * Main method to claim a tile
   * Orchestrates validation and processing
   * @param request - Tile claim request
   * @returns Tile claim result
   */
  async claimTile(request: TileClaimRequest): Promise<TileClaimResult> {
    try {
      // Step 1: Validate tile coordinates
      const coordinates = this.validateTileCoordinates(request.tileId);

      // Step 2: Process claim atomically
      const result = await this.processClaim(coordinates, request.userId);

      if (!result.success) {
        return {
          success: false,
          error: {
            code: 'ALREADY_OWNED_BY_OTHER',
            message: 'This tile is already claimed by another user',
          },
        };
      }

      return {
        success: true,
        tile: result.tile,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'UNKNOWN_ERROR';

      const errorMessages: Record<string, string> = {
        INVALID_TILE_FORMAT: 'Invalid tile ID format. Expected format: "x-y"',
        INVALID_COORDINATES: 'Tile coordinates must be valid numbers',
        COORDINATES_OUT_OF_BOUNDS: `Tile coordinates must be between 0-${GRID_COLS - 1} for x and 0-${GRID_ROWS - 1} for y`,
        UNKNOWN_ERROR: 'An unexpected error occurred while claiming the tile',
      };

      return {
        success: false,
        error: {
          code: errorMessage,
          message: errorMessages[errorMessage] || errorMessages.UNKNOWN_ERROR,
        },
      };
    }
  }
}

export const tileClaimService = new TileClaimService();
