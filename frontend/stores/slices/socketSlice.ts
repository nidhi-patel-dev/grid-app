import { StateCreator } from "zustand";

export type ConnectionStatus = "disconnected" | "connecting" | "connected";

export interface SocketSlice {
    connectionStatus: ConnectionStatus;
    latency: number;
    setConnectionStatus: (status: ConnectionStatus) => void;
    setLatency: (latency: number) => void;
}

export const createSocketSlice: StateCreator<SocketSlice> = (set) => ({
    connectionStatus: "disconnected",
    latency: 0,
    setConnectionStatus: (status) => set({ connectionStatus: status }),
    setLatency: (latency) => set({ latency })
});
