"use client";

import React from "react";
import { useAppStore } from "../../stores/useAppStore";
import { MousePointerClick, Hexagon, Trophy, HelpCircle } from "lucide-react";
import { Modal } from "../common/modal";

export function HelpModal() {
    const isOpen = useAppStore((state) => state.isHelpModalOpen);
    const setOpen = useAppStore((state) => state.setHelpModalOpen);

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => setOpen(false)}
            title="How to Play"
            description="Master the art of grid conquest"
            icon={<HelpCircle size={20} />}
        >
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20 shadow-lg shadow-blue-500/5">
                        <MousePointerClick size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white mb-1">Claim Pixels</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                            Click on any empty pixel on the grid to claim it with your color. You can only claim one pixel per second.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20 shadow-lg shadow-emerald-500/5">
                        <Hexagon size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white mb-1">Build Territory</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                            Work together or compete with others in real-time. Once a pixel is claimed, it cannot be taken by anyone else.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20 shadow-lg shadow-amber-500/5">
                        <Trophy size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white mb-1">Climb the Ranks</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                            The more pixels you own, the higher your rank. Earn special titles as you dominate the grid!
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
