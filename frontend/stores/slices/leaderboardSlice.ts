import { StateCreator } from "zustand";

export interface LeaderboardEntry {
    userId: string;
    name: string;
    tilesOwned: number;
    color: string;
}

export interface LeaderboardSlice {
    leaderboard: LeaderboardEntry[];
    setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
}

export const createLeaderboardSlice: StateCreator<LeaderboardSlice> = (set) => ({
    leaderboard: [],
    setLeaderboard: (leaderboard) => set({ leaderboard })
});
