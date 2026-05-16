"use client";

import { ActivityFeed } from "./activity-feed";

export function RightSidebar() {
    return (
        <div className="flex h-full flex-col overflow-hidden bg-[#0d0f1a]">
            {/* Activity Feed Section */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex items-center justify-between p-4 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Activity Feed</h3>
                </div>
                <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
                    <ActivityFeed />
                </div>
            </div>
        </div>
    );
}
