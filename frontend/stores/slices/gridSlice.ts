import { StateCreator } from "zustand";
import { TileData } from "../../types/grid";

export interface GridSlice {
    tiles: Record<string, TileData>;
    tileIds: string[];
    rows: number;
    cols: number;
    isLoading: boolean;
    claimedCount: number;
    selectedTileId: string | null;
    initializeGrid: (rows: number, cols: number) => void;
    setGrid: (tiles: Record<string, TileData>, rows: number, cols: number) => void;
    setLoading: (loading: boolean) => void;
    handleTileClick: (id: string) => void;
    updateTile: (id: string, data: Partial<TileData>) => void;
    rollbackTile: (id: string, originalStatus: TileData["status"]) => void;
    setSelectedTileId: (id: string | null) => void;
}

export const createGridSlice: StateCreator<GridSlice> = (set, get) => ({
    tiles: {},
    tileIds: [],
    rows: 0,
    cols: 0,
    isLoading: true,
    claimedCount: 0,
    selectedTileId: null,
    initializeGrid: (rows, cols) => {
        set({ isLoading: true });
        const tiles: Record<string, TileData> = {};
        const tileIds: string[] = [];
        const claimedCount = 0;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const id = `${x}-${y}`;
                tiles[id] = { id, x, y, status: "unclaimed" };
                tileIds.push(id);
            }
        }
        set({ tiles, tileIds, rows, cols, isLoading: false, claimedCount });
    },
    setGrid: (tiles, rows, cols) => {
        const tileIds = Object.keys(tiles);
        const claimedCount = Object.values(tiles).filter(t => t.status === "claimed").length;
        set({ tiles, tileIds, rows, cols, isLoading: false, claimedCount });
    },
    setLoading: (loading) => {
        set({ isLoading: loading });
    },
    handleTileClick: (id: string) => {
        const { tiles } = get();
        const tile = tiles[id];

        if (!tile || tile.status === "claiming") return;

        if (tile.status === "claimed") {
            const currentSelected = get().selectedTileId;
            set({ selectedTileId: currentSelected === id ? null : id });
            return;
        }

        // Optimistic update to claiming
        set((state) => ({
            selectedTileId: null,
            tiles: {
                ...state.tiles,
                [id]: { ...state.tiles[id], status: "claiming" }
            }
        }));
    },
    setSelectedTileId: (id) => set({ selectedTileId: id }),
    updateTile: (id, data) => {
        set((state) => {
            const currentTile = state.tiles[id];
            if (!currentTile) return state;

            let newClaimedCount = state.claimedCount;
            if (currentTile.status !== "claimed" && data.status === "claimed") {
                newClaimedCount++;
            } else if (currentTile.status === "claimed" && data.status && data.status !== "claimed") {
                newClaimedCount--;
            }

            return {
                claimedCount: newClaimedCount,
                tiles: {
                    ...state.tiles,
                    [id]: { ...currentTile, ...data }
                }
            };
        });
    },
    rollbackTile: (id, originalStatus) => {
        set((state) => {
            const currentTile = state.tiles[id];
            if (!currentTile) return state;

            let newClaimedCount = state.claimedCount;
            if (currentTile.status === "claimed" && originalStatus !== "claimed") {
                newClaimedCount--;
            } else if (currentTile.status !== "claimed" && originalStatus === "claimed") {
                newClaimedCount++;
            }

            return {
                claimedCount: newClaimedCount,
                tiles: {
                    ...state.tiles,
                    [id]: { ...state.tiles[id], status: originalStatus }
                }
            };
        });
    }
});
