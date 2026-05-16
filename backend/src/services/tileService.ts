import prisma from '../lib/prisma.js';
import { GRID_ROWS, GRID_COLS } from '../lib/constants.js';
import { TileData, GridState } from '../lib/validation.js';

export class TileService {
  /**
   * Fetches the current grid state and formats it for the frontend.
   */
  async getGridState(): Promise<GridState> {
    const tiles = await prisma.tile.findMany({
      include: { owner: true },
    });
    const tilesMap: Record<string, TileData> = {};

    // Initialize all tiles as unclaimed first to ensure a complete grid
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        const id = `${x}-${y}`;
        tilesMap[id] = { id, x, y, status: 'unclaimed' };
      }
    }

    // Overlay claimed tiles from the database
    tiles.forEach((tile) => {
      const id = `${tile.x}-${tile.y}`;
      if (tilesMap[id] && tile.ownerId) {
        tilesMap[id] = {
          ...tilesMap[id],
          status: 'claimed',
          ownerId: tile.ownerId,
          ownerName: tile.owner?.username,
          color: tile.owner?.color,
        };
      }
    });

    return {
      tiles: tilesMap,
      rows: GRID_ROWS,
      cols: GRID_COLS,
    };
  }
}

export const tileService = new TileService();
