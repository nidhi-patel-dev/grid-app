"use client";

import { useAppStore } from "../../stores/useAppStore";
import { useShallow } from "zustand/react/shallow";
import { Trophy, Crown, Award, Medal } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Leaderboard() {
    const leaderboard = useAppStore(
        useShallow((state) => [...state.leaderboard].sort((a, b) => b.tilesOwned - a.tilesOwned))
    );

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Crown className="h-4 w-4 text-amber-400" />;
            case 1: return <Medal className="h-4 w-4 text-zinc-300" />;
            case 2: return <Award className="h-4 w-4 text-amber-600" />;
            default: return <span className="w-4 text-center text-xs text-zinc-500">{index + 1}</span>;
        }
    };

    return (
        <div className="space-y-3">
            {leaderboard.length > 0 ? (
                <AnimatePresence mode="popLayout">
                    {leaderboard.slice(0, 10).map((entry, index) => (
                        <motion.div 
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={entry.userId} 
                            className={cn(
                                "group flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-white/5",
                                index === 0 && "bg-amber-400/5"
                            )}
                        >
                        <div className="flex items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center">
                                {getRankIcon(index)}
                            </div>
                            <div className="flex flex-col">
                                <span 
                                    className="text-sm font-medium"
                                    style={{ color: entry.color }}
                                >
                                    {entry.name}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">
                                {entry.tilesOwned}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                                tiles
                            </span>
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Trophy className="mb-2 h-8 w-8 text-zinc-700" />
                    <p className="text-xs text-zinc-500">Waiting for players to claim tiles...</p>
                </div>
            )}
        </div>
    );
}
