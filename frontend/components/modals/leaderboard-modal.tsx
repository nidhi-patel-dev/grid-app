"use client";

import React from "react";
import { Trophy } from "lucide-react";
import { useAppStore } from "../../stores/useAppStore";
import { Leaderboard } from "../layout/leaderboard";
import { Modal } from "../common/modal";

export function LeaderboardModal() {
    const isOpen = useAppStore((state) => state.isLeaderboardModalOpen);
    const setOpen = useAppStore((state) => state.setLeaderboardModalOpen);

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => setOpen(false)}
            title="Global Leaderboard"
            description="Top 10 players by pixels owned"
            icon={<Trophy size={20} className="text-amber-400" />}
            maxWidth="lg"
        >
            <Leaderboard />
        </Modal>
    );
}
