import { StateCreator } from "zustand";

export interface User {
    id: string;
    name: string;
    color: string;
    ownedTilesCount?: number;
    joinedAt?: string;
}

export interface UserSlice {
    currentUser: User | null;
    isOnline: boolean;
    lastActionTime: number;
    setCurrentUser: (user: User | null) => void;
    setOnlineStatus: (status: boolean) => void;
    setLastActionTime: (time: number) => void;
}

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
    currentUser: null,
    isOnline: false,
    lastActionTime: 0,
    setCurrentUser: (user) => set({ currentUser: user }),
    setOnlineStatus: (status) => set({ isOnline: status }),
    setLastActionTime: (time) => set({ lastActionTime: time }),
});
