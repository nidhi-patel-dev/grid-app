"use client";

import React from "react";
import { useAppStore } from "../../stores/useAppStore";
import { motion, AnimatePresence } from "framer-motion";
import { UserAvatar } from "../common/user-avatar";

export function ActivityFeed() {
    const activities = useAppStore((state) => state.activities);

    return (
        <div className="flex flex-col gap-1">
            <AnimatePresence initial={false} mode="popLayout">
                {activities.length > 0 ? (
                    activities.map((activity, i) => {
                        // Deterministic values based on ID to avoid Math.random in render
                        const idHash = activity.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        const pixelCount = (idHash % 8) + 1;
                        const patternCount = (idHash % 4) + 1;

                        return (
                            <motion.div
                                key={activity.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-3 p-3 transition-colors hover:bg-white/5 rounded-xl group"
                            >
                                <UserAvatar 
                                    name={activity.username} 
                                    color={activity.userColor} 
                                    size="md" 
                                />
                                
                                <div className="flex flex-1 flex-col gap-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-white truncate">
                                            {activity.username === "You" ? "Alex (You)" : activity.username}
                                        </span>
                                        <span className="text-[10px] font-medium text-zinc-500 whitespace-nowrap">
                                            {i === 0 ? "just now" : `${i * 10}s ago`}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-medium text-zinc-400">
                                        captured {pixelCount} pixels
                                    </p>
                                    
                                    {/* Visual Pixel Pattern */}
                                    <div className="mt-1 flex gap-0.5">
                                        {Array.from({ length: patternCount }).map((_, p) => (
                                            <div 
                                                key={p} 
                                                className="h-3 w-3 rounded-[1px]" 
                                                style={{ backgroundColor: activity.userColor || "#3b82f6" }} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">No activity</p>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
