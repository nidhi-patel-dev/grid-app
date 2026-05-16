import { StateCreator } from "zustand";

export interface SettingsSlice {
    isSoundEnabled: boolean;
    isProfileModalOpen: boolean;
    isLeaderboardModalOpen: boolean;
    isHelpModalOpen: boolean;
    setSoundEnabled: (enabled: boolean) => void;
    setProfileModalOpen: (open: boolean) => void;
    setLeaderboardModalOpen: (open: boolean) => void;
    setHelpModalOpen: (open: boolean) => void;
}

export const createSettingsSlice: StateCreator<SettingsSlice> = (set) => ({
    isSoundEnabled: true,
    isProfileModalOpen: false,
    isLeaderboardModalOpen: false,
    isHelpModalOpen: false,
    setSoundEnabled: (enabled) => set({ isSoundEnabled: enabled }),
    setProfileModalOpen: (open) => set({ isProfileModalOpen: open }),
    setLeaderboardModalOpen: (open) => set({ isLeaderboardModalOpen: open }),
    setHelpModalOpen: (open) => set({ isHelpModalOpen: open }),
});
