"use client";

import { useAppStore } from "../../stores/useAppStore";
import { useShallow } from "zustand/react/shallow";
import { Hexagon, Trophy, HelpCircle, Volume2, VolumeX } from "lucide-react";
import { UserAvatar } from "../common/user-avatar";
import { cn } from "../../lib/utils";
import { useState, useEffect } from "react";

export function AppHeader() {
    const onlineCount = useAppStore(
        useShallow((state) => Object.keys(state.presences).length)
    );
    const { currentUser, isSoundEnabled, setSoundEnabled, setProfileModalOpen, setLeaderboardModalOpen, setHelpModalOpen } = useAppStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="z-50 border-b border-white/5 bg-[#0d0f1a] shadow-lg">
            <div className="flex h-16 items-center justify-between px-6">
                {/* Logo Section */}
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-lg shadow-primary/5">
                        <Hexagon size={24} fill="currentColor" fillOpacity={0.2} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                            Pixel Realm
                        </h1>
                        <p className="text-[10px] font-medium text-zinc-500 hidden sm:block">
                            Claim pixels. Build territory.
                        </p>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3 sm:gap-6">
                    {/* Online Status */}
                    <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-2 sm:px-3 py-1.5 shadow-inner">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                        <span className="text-xs font-bold text-zinc-300 hidden sm:inline">
                            {onlineCount} online
                        </span>
                    </div>

                    {/* Sound Toggle */}
                    <button
                        onClick={() => setSoundEnabled(!isSoundEnabled)}
                        className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-xl border transition-all shadow-sm",
                            isSoundEnabled
                                ? "border-white/5 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                                : "border-white/10 bg-black/40 text-zinc-600 hover:bg-black/60 hover:text-zinc-400 shadow-inner"
                        )}
                        title={mounted ? (isSoundEnabled ? "Mute Sounds" : "Unmute Sounds") : "Mute Sounds"}
                    >
                        {mounted ? (isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />) : <Volume2 size={18} />}
                    </button>

                    {/* Leaderboard Button */}
                    <button
                        onClick={() => setLeaderboardModalOpen(true)}
                        className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-2 sm:px-4 sm:py-2 text-xs font-bold text-zinc-300 transition-all hover:bg-white/10 hover:text-white hover:border-white/10 shadow-sm"
                    >
                        <Trophy size={14} className="text-amber-500" />
                        <span className="hidden sm:inline">Leaderboard</span>
                    </button>

                    {/* Help icon */}
                    <button
                        onClick={() => setHelpModalOpen(true)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-zinc-400 transition-all hover:bg-white/10 hover:text-white shadow-sm"
                    >
                        <HelpCircle size={18} />
                    </button>

                    {/* User Profile */}
                    <button
                        onClick={() => setProfileModalOpen(true)}
                        className="flex items-center gap-3 rounded-full sm:rounded-2xl border border-white/10 bg-white/5 p-1 sm:p-1.5 sm:pl-4 transition-all hover:bg-white/10 group shadow-lg"
                    >
                        <div className="hidden sm:flex flex-col items-end pr-1">
                            <span className="text-xs font-bold text-white leading-none">
                                {currentUser?.name || "Alex"}
                            </span>
                            <span className="text-[10px] font-medium text-zinc-500 mt-1">
                                {currentUser?.ownedTilesCount ?? "0"} pixels
                            </span>
                        </div>
                        <UserAvatar
                            name={currentUser?.name}
                            color={currentUser?.color}
                            size="lg"
                            className="transform group-hover:scale-105 transition-transform"
                        />
                    </button>
                </div>
            </div>
        </header>
    );
}