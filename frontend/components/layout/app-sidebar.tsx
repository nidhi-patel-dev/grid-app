"use client";

import { useAppStore } from "../../stores/useAppStore";
import { useShallow } from "zustand/react/shallow";
import { Award, Clock } from "lucide-react";
import { UserAvatar } from "../common/user-avatar";
import { getTitle, getTimeAgo } from "../../lib/utils";

export function AppSidebar() {
    const presences = useAppStore(
        useShallow((state) => 
            Object.values(state.presences)
                .filter(p => p.isOnline && p.userId !== state.currentUser?.id)
                .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime())
        )
    );
    const currentUser = useAppStore((state) => state.currentUser);
    const currentUserPresence = useAppStore(state => currentUser ? state.presences[currentUser.id] : null);
    const leaderboard = useAppStore((state) => state.leaderboard);
    const setLeaderboardModalOpen = useAppStore((state) => state.setLeaderboardModalOpen);

    if (!currentUser) return null;
    const tilesOwned = currentUserPresence?.tilesOwned ?? currentUser.ownedTilesCount ?? 0;

    const userRankNum = leaderboard.findIndex(e => e.userId === currentUser?.id) + 1;
    const userRank = userRankNum > 0 ? `#${userRankNum}` : "Unranked";

    const userTitle = getTitle(tilesOwned);
    const joinedTime = getTimeAgo(currentUser?.joinedAt);

    return (
        <div className="flex h-full flex-col bg-[#0d0f1a] overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* YOUR INFO Section */}
                <div className="p-6 pb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4">Your Info</h3>
                    <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 border border-white/5 shadow-inner">
                        <UserAvatar 
                            name={currentUser.name} 
                            color={currentUser.color} 
                            size="lg" 
                        />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">{currentUser?.name || "Alex"}</h4>
                            <p className="text-xs font-medium mt-0.5" style={{ color: currentUser?.color }}>{userTitle}</p>
                        </div>
                        <div
                            className="h-3 w-3 shadow-sm"
                            style={{ backgroundColor: currentUser.color }}
                        />
                    </div>
                </div>

                {/* YOUR STATS Section */}
                <div className="px-6 py-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4">Your Stats</h3>
                    <div className="space-y-3 rounded-2xl bg-white/5 p-5 border border-white/5 shadow-inner">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Pixels Owned</span>
                            <span className="text-2xl font-black text-white mt-1">
                                {tilesOwned.toLocaleString()}
                            </span>
                        </div>

                        <div className="h-px w-full bg-white/5" />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Award size={14} className="text-zinc-500" />
                                <span className="text-xs font-medium text-zinc-400">Rank</span>
                            </div>
                            <span className="text-xs font-bold text-white">{userRank}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-zinc-500" />
                                <span className="text-xs font-medium text-zinc-400">Joined</span>
                            </div>
                            <span className="text-xs font-bold text-zinc-300">{joinedTime}</span>
                        </div>
                    </div>
                </div>

                {/* ONLINE PLAYERS Section */}
                <div className="px-6 py-4 flex-1 flex flex-col min-h-0">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4">
                        Online Players ({presences.length})
                    </h3>
                    <div className="space-y-1 overflow-y-auto pr-2 custom-scrollbar">
                        {presences.map((user, i) => (
                            <div
                                key={user.userId}
                                className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-white/5 group"
                            >
                                <span className="text-[10px] font-bold text-zinc-600 w-4">{i + 1}</span>
                                <UserAvatar 
                                    name={user.username} 
                                    color={user.color} 
                                    size="sm" 
                                />
                                <span className="text-xs font-bold text-zinc-300 flex-1 truncate group-hover:text-white transition-colors">
                                    {user.username || `Player_${user.userId.slice(0, 4)}`}
                                </span>
                                <span className="text-xs font-medium text-zinc-500">
                                    {(user.tilesOwned || 0).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Button */}
            <div className="p-6 pt-2 border-t border-white/5 bg-[#0d0f1a]">
                <button
                    onClick={() => setLeaderboardModalOpen(true)}
                    className="w-full py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-zinc-300 transition-all hover:bg-white/10 hover:text-white shadow-lg"
                >
                    View Full Leaderboard
                </button>
            </div>
        </div>
    );
}