import { StateCreator } from "zustand";

export interface ActivityItem {
    id: string;
    type: "claim";
    userId: string;
    username: string;
    userColor?: string;
    tileId: string;
    timestamp: Date;
}

export interface ActivitySlice {
    activities: ActivityItem[];
    addActivity: (activity: ActivityItem) => void;
}

export const createActivitySlice: StateCreator<ActivitySlice> = (set) => ({
    activities: [],
    addActivity: (activity) => set((state) => ({
        activities: [activity, ...state.activities].slice(0, 50) // Keep last 50
    })),
});
