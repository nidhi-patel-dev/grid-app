"use client";

import { useAppStore } from "../../stores/useAppStore";

export function AppFooter() {
    const user = useAppStore((state) => state.currentUser);

    return (
        <footer className="border-t border-white/10 bg-zinc-950">
            <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 text-xs sm:text-sm text-zinc-400">
                <span className="hidden sm:inline">
                    Real-time Shared Grid
                </span>

                <div className="flex items-center gap-2">
                    <div 
                        className="h-2 w-2 rounded-full" 
                        style={{ backgroundColor: user?.color || '#71717a' }} 
                    />
                    <span className="font-medium text-white truncate max-w-[120px]">
                        {user?.name || "Anonymous User"}
                    </span>
                </div>
            </div>
        </footer>
    );
}