import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { useAppStore } from "../../stores/useAppStore";
import { useSocket } from "../../hooks/use-socket";
import { useSound } from "../../hooks/use-sound";
import { toast } from "sonner";

interface TileProps {
    id: string;
}

export const Tile = React.memo(({ id }: TileProps) => {
    // Subscribing specifically to this tile's data
    const data = useAppStore(state => state.tiles[id]);
    const handleTileClick = useAppStore(state => state.handleTileClick);
    const socket = useSocket();
    const { playSound } = useSound();

    if (!data) return null;

    const handleClick = () => {
        if (data.status === "claiming") return;

        if (data.status === "claimed") {
            handleTileClick(id);
            playSound('click');
            return;
        }

        // Cooldown check (1s)
        const lastActionTime = useAppStore.getState().lastActionTime;
        if (Date.now() - lastActionTime < 1000) {
            playSound('error');
            toast.error("Cooldown active", {
                description: "Please wait before claiming another tile",
                id: "cooldown-error"
            });
            return;
        }

        // Optimistic UI update
        handleTileClick(id);
        useAppStore.getState().setLastActionTime(Date.now());

        playSound('claim');

        // Emit socket event
        if (socket) {
            socket.emit("tile:claim", { id });
        }
    };

    const isSelected = useAppStore(state => state.selectedTileId === id);
    const ownerColor = useAppStore(state => {
        if (!data.ownerId) return data.color;
        if (state.currentUser?.id === data.ownerId) return state.currentUser.color;
        const presence = state.presences[data.ownerId];
        if (presence?.color) return presence.color;
        return data.color;
    });

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClick}
            className={cn(
                "relative cursor-pointer transition-all duration-300 aspect-square",
                data.status === "unclaimed" && "hover:bg-white/10 border border-white/[0.05]",
                data.status === "claiming" && "bg-white/20 pointer-events-none border border-white/20",
                isSelected && "ring-2 ring-white z-20"
            )}
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: data.status === "claimed" ? ownerColor : undefined,
                borderRadius: "1px",
                border: data.status === "claimed" ? "1px solid rgba(255,255,255,0.1)" : undefined
            }}
        >
            <AnimatePresence>
                {data.status === "claiming" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Subtle highlight for claimed tiles */}
            {data.status === "claimed" && (
                <div className="absolute inset-0 border border-white/10" />
            )}
        </motion.div>
    );
});

Tile.displayName = "Tile";
