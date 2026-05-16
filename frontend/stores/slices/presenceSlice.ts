import { StateCreator } from "zustand";

export interface UserPresence {
    userId: string;
    username?: string;
    color?: string;
    isOnline: boolean;
    lastSeen: Date;
    joinedAt: Date;
    cursor?: { x: number; y: number };
    tilesOwned?: number;
}

export interface PresenceSlice {
    presences: Record<string, UserPresence>;
    updatePresence: (userId: string, presence: Partial<UserPresence>) => void;
    removePresence: (userId: string) => void;
}

export const createPresenceSlice: StateCreator<PresenceSlice> = (set) => ({
    presences: {},
    updatePresence: (userId, presence) =>
        set((state) => ({
            presences: {
                ...state.presences,
                [userId]: {
                    ...(state.presences[userId] || { userId, isOnline: true, lastSeen: new Date(), joinedAt: new Date() }),
                    ...presence,
                },
            },
        })),
    removePresence: (userId) =>
        set((state) => {
            const newPresences = { ...state.presences };
            delete newPresences[userId];
            return { presences: newPresences };
        }),
});
