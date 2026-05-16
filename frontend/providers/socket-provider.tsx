"use client";

import React, { createContext, useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAppStore } from "../stores/useAppStore";
import { TileData } from "../types/grid";
import { toast } from "sonner";
import { useSound } from "../hooks/use-sound";

interface SocketContextValue {
    socket: Socket | null;
}

export const SocketContext = createContext<SocketContextValue>({ socket: null });

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const { playSound } = useSound();

    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
        console.log("🔌 Socket URL:", url);

        // Try to recover userId from localStorage for persistence
        const savedUserId = typeof window !== 'undefined' ? localStorage.getItem('grid-user-id') : null;

        const socketInstance = io(url, {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            query: savedUserId ? { userId: savedUserId } : {},
        });

        socketRef.current = socketInstance;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSocket(socketInstance);

        const setConnectionStatus = useAppStore.getState().setConnectionStatus;
        const setLatency = useAppStore.getState().setLatency;

        setConnectionStatus("connecting");

        socketInstance.on("connect", () => {
            setConnectionStatus("connected");
            socketInstance.emit("grid:request_sync");
        });

        socketInstance.on("disconnect", () => {
            setConnectionStatus("disconnected");
        });

        socketInstance.on("connect_error", (error) => {
            console.error("❌ Socket Connection Error:", {
                message: error.message,
                description: (error as any).description,
                url: url
            });
            setConnectionStatus("disconnected");
            toast.error("Connection Error", {
                description: `Failed to connect to backend. Reason: ${error.message}`,
                id: "socket-error"
            });
        });

        // Session listener
        socketInstance.on("session", ({ userId, ownedTilesCount }: { userId: string, ownedTilesCount?: number }) => {
            const setCurrentUser = useAppStore.getState().setCurrentUser;

            // Persist the ID for future sessions
            localStorage.setItem('grid-user-id', userId);

            // Try to load saved profile
            const savedProfile = localStorage.getItem(`grid-profile`);
            if (savedProfile) {
                try {
                    const profile = JSON.parse(savedProfile);
                    setCurrentUser({
                        id: userId,
                        name: profile.username,
                        color: profile.color,
                        ownedTilesCount: ownedTilesCount,
                        joinedAt: profile.joinedAt || new Date().toISOString()
                    });
                    // Sync with server
                    socketInstance.emit("user:update", profile);
                } catch (e) {
                    console.error("Failed to parse saved profile", e);
                }
            } else {
                setCurrentUser({
                    id: userId,
                    name: `User-${userId.slice(0, 4)}`,
                    color: "#3b82f6",
                    ownedTilesCount: ownedTilesCount,
                    joinedAt: new Date().toISOString()
                });
                // Initialize joinedAt in localStorage
                localStorage.setItem(`grid-profile`, JSON.stringify({
                    username: `User-${userId.slice(0, 4)}`,
                    color: "#3b82f6",
                    joinedAt: new Date().toISOString()
                }));
            }
        });

        // User sync listener (from server after updates)
        socketInstance.on("user:sync", (data: { id: string, username: string, color: string, ownedTilesCount?: number }) => {
            const setCurrentUser = useAppStore.getState().setCurrentUser;
            const joinedAt = useAppStore.getState().currentUser?.joinedAt || new Date().toISOString();
            setCurrentUser({
                id: data.id,
                name: data.username,
                color: data.color,
                ownedTilesCount: data.ownedTilesCount,
                joinedAt: joinedAt
            });

            // Persist profile to localStorage (shared across sessions)
            localStorage.setItem(`grid-profile`, JSON.stringify({
                username: data.username,
                color: data.color,
                joinedAt: joinedAt
            }));
        });

        // Grid sync listener
        socketInstance.on("grid:sync", (data: { tiles: Record<string, TileData>, rows: number, cols: number }) => {
            useAppStore.getState().setGrid(data.tiles, data.rows, data.cols);
        });

        socketInstance.on("tile:update", (data: TileData) => {
            const { processTileUpdate } = useAppStore.getState();
            processTileUpdate(data);
        });

        socketInstance.on("tile:error", (data: { id: string, message: string, originalStatus: TileData["status"] }) => {
            useAppStore.getState().rollbackTile(data.id, data.originalStatus);
            toast.error("Action Failed", {
                description: data.message
            });
            playSound('error');
        });

        // Presence listeners
        socketInstance.on("presence:update", (data: { count: number, users: Array<{ id: string, username: string, color: string }> }) => {
            const { presences, removePresence, updatePresence } = useAppStore.getState();

            // Remove users that are no longer online
            const currentIds = Object.keys(presences);
            const newIds = data.users.map(u => u.id);
            currentIds.forEach(id => {
                if (!newIds.includes(id)) removePresence(id);
            });

            // Add or update online users
            data.users.forEach(user => {
                updatePresence(user.id, {
                    userId: user.id,
                    username: user.username,
                    color: user.color,
                    tilesOwned: (user as any).tilesOwned || 0,
                    isOnline: true,
                    lastSeen: new Date()
                });
            });
        });

        socketInstance.on("presence:remove", (userId: string) => {
            useAppStore.getState().removePresence(userId);
        });

        // Leaderboard listener
        socketInstance.on("leaderboard:update", (data: any) => {
            const mappedData = data.leaderboard.map((entry: any) => ({
                userId: entry.userId,
                name: entry.username,
                tilesOwned: entry.tileCount,
                color: entry.color,
            }));
            useAppStore.getState().setLeaderboard(mappedData);
        });

        // Activity listener
        socketInstance.on("activity:new", (data: any) => {
            useAppStore.getState().addActivity(data);
        });

        // Ping tracking for latency
        let pingInterval: NodeJS.Timeout;
        socketInstance.on("connect", () => {
            pingInterval = setInterval(() => {
                const start = Date.now();
                socketInstance.volatile.emit("ping", () => {
                    const latency = Date.now() - start;
                    setLatency(latency);
                });
            }, 5000);
        });

        return () => {
            clearInterval(pingInterval);
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
}
