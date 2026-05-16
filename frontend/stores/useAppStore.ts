import { create } from "zustand";
import { TileData } from "../types/grid";
import { createGridSlice, GridSlice } from "./slices/gridSlice";
import { createUserSlice, UserSlice } from "./slices/userSlice";
import { createSocketSlice, SocketSlice } from "./slices/socketSlice";
import { createLeaderboardSlice, LeaderboardSlice } from "./slices/leaderboardSlice";
import { createPresenceSlice, PresenceSlice } from "./slices/presenceSlice";
import { createSettingsSlice, SettingsSlice } from "./slices/settingsSlice";
import { createActivitySlice, ActivitySlice } from "./slices/activitySlice";

export type AppState = GridSlice & UserSlice & SocketSlice & LeaderboardSlice & PresenceSlice & SettingsSlice & ActivitySlice & {
    processTileUpdate: (data: TileData) => void;
};

export const useAppStore = create<AppState>()((...a) => ({
    ...createGridSlice(...a),
    ...createUserSlice(...a),
    ...createSocketSlice(...a),
    ...createLeaderboardSlice(...a),
    ...createPresenceSlice(...a),
    ...createSettingsSlice(...a),
    ...createActivitySlice(...a),
    processTileUpdate: (data) => {
        const state = a[1](); // get() is the second argument
        const currentTile = state.tiles[data.id];
        
        const prevOwnerId = currentTile?.status === "claimed" ? currentTile.ownerId : null;
        const newOwnerId = data.status === "claimed" ? data.ownerId : null;
        
        state.updateTile(data.id, data);

        if (prevOwnerId !== newOwnerId) {
            if (prevOwnerId) {
                if (prevOwnerId === state.currentUser?.id) {
                    state.setCurrentUser({
                        ...state.currentUser,
                        ownedTilesCount: Math.max(0, (state.currentUser.ownedTilesCount || 0) - 1)
                    });
                }
                if (state.presences[prevOwnerId]) {
                    state.updatePresence(prevOwnerId, {
                        tilesOwned: Math.max(0, (state.presences[prevOwnerId].tilesOwned || 0) - 1)
                    });
                }
            }
            
            if (newOwnerId) {
                if (newOwnerId === state.currentUser?.id) {
                    state.setCurrentUser({
                        ...state.currentUser,
                        ownedTilesCount: (state.currentUser.ownedTilesCount || 0) + 1
                    });
                }
                if (state.presences[newOwnerId]) {
                    state.updatePresence(newOwnerId, {
                        tilesOwned: (state.presences[newOwnerId].tilesOwned || 0) + 1
                    });
                }
            }
        }
    }
}));
