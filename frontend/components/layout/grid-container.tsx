"use client";
import React from "react";

import { useAppStore } from "../../stores/useAppStore";
import { Tile } from "./tile";
import { GridSkeleton } from "./grid-skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { TransformWrapper, TransformComponent, useControls, useTransformContext } from "react-zoom-pan-pinch";
import {
    ZoomIn,
    ZoomOut,
    Maximize,
    MousePointerClick,
    ChevronDown
} from "lucide-react";

function GridHeader() {
    const { zoomIn, zoomOut, resetTransform, setTransform } = useControls();
    const { state } = useTransformContext();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const zoomPercent = Math.round(state.scale * 100);

    const zoomLevels = [
        { label: "50%", scale: 0.5 },
        { label: "100%", scale: 1 },
        { label: "200%", scale: 2 },
        { label: "400%", scale: 4 },
        { label: "800%", scale: 8 },
    ];

    return (
        <div className="flex items-center justify-between px-6 py-4 bg-[#0d0f1a] border-b border-white/5 relative z-50">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span className="text-xs font-bold text-white">Real-time mode</span>
                </div>
                <span className="text-xs font-medium text-zinc-500">Every move you make is live</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <div
                        className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <span className="text-xs font-bold text-zinc-300">{zoomPercent}%</span>
                        <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </div>

                    <AnimatePresence>
                        {isMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full mt-2 right-0 w-32 bg-[#1a1c2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                                >
                                    {zoomLevels.map((level) => (
                                        <button
                                            key={level.label}
                                            className="w-full px-4 py-2 text-left text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                                            onClick={() => {
                                                setTransform(0, 0, level.scale);
                                                setIsMenuOpen(false);
                                            }}
                                        >
                                            {level.label}
                                        </button>
                                    ))}
                                    <button
                                        className="w-full px-4 py-2 text-left text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                                        onClick={() => {
                                            resetTransform();
                                            setIsMenuOpen(false);
                                        }}
                                    >
                                        Fit Screen
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                        onClick={() => zoomOut()}
                        title="Zoom Out"
                    >
                        <ZoomOut size={16} />
                    </button>
                    <button
                        className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                        onClick={() => zoomIn()}
                        title="Zoom In"
                    >
                        <ZoomIn size={16} />
                    </button>
                    <button
                        className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                        onClick={() => resetTransform()}
                        title="Reset View"
                    >
                        <Maximize size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function GridLegend() {
    const presences = useAppStore((state) => state.presences);
    const currentUser = useAppStore((state) => state.currentUser);

    const players = Object.entries(presences).map(([id, p]) => ({
        name: id === currentUser?.id ? `${p.username} (You)` : p.username,
        color: p.color,
    }));

    if (players.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-3 bg-[#0d0f1a] border-t border-white/5">
            {players.map((player, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: player.color }} />
                    <span className="text-xs font-bold text-zinc-400">{player.name}</span>
                </div>
            ))}
        </div>
    );
}

export function GridContainer() {
    const tileIds = useAppStore((state) => state.tileIds);
    const cols = useAppStore((state) => state.cols);
    const rows = useAppStore((state) => state.rows);
    const isLoading = useAppStore((state) => state.isLoading);
    const tiles = useAppStore((state) => state.tiles);
    const selectedTileId = useAppStore((state) => state.selectedTileId);
    const currentUser = useAppStore((state) => state.currentUser);

    if (isLoading || tileIds.length === 0) {
        return <GridSkeleton />;
    }

    return (
        <div className="flex h-full w-full flex-col overflow-hidden p-3 pt-4">
            <div className="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#0d0f1a] shadow-2xl ring-1 ring-white/5 m-3">
                <TransformWrapper
                    initialScale={1}
                    minScale={0.5}
                    maxScale={8}
                    centerOnInit={true}
                    wheel={{ disabled: true }}
                    pinch={{ disabled: true }}
                    doubleClick={{ disabled: true }}
                >
                    <GridHeader />

                    <div className="relative flex-1 overflow-hidden bg-[#0a0b14]">
                        <TransformComponent
                            wrapperStyle={{ width: "100%", height: "100%" }}
                            contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
                        >
                            <div
                                className="relative"
                                style={{ height: "100%", aspectRatio: "1 / 1", width: "100%" }}
                            >
                                <div
                                    className="grid h-full w-full"
                                    style={{
                                        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                                        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                                        gap: "1px"
                                    }}
                                >
                                    {tileIds.map((id) => (
                                        <Tile key={id} id={id} />
                                    ))}
                                </div>

                                {/* Interaction Tooltip */}
                                {selectedTileId && tiles[selectedTileId] && (() => {
                                    const tile = tiles[selectedTileId];
                                    const isNearTop = tile.y < 2;
                                    const isNearLeft = tile.x < 3;
                                    const isNearRight = tile.x > cols - 4;

                                    let leftPos = `${((tile.x + 0.5) / cols) * 100}%`;
                                    let translateX = "-50%";
                                    let triangleLeft = "left-1/2 -translate-x-1/2";

                                    if (isNearLeft) {
                                        leftPos = `${(tile.x / cols) * 100}%`;
                                        translateX = "0%";
                                        triangleLeft = "left-4";
                                    } else if (isNearRight) {
                                        leftPos = `${((tile.x + 1) / cols) * 100}%`;
                                        translateX = "-100%";
                                        triangleLeft = "right-4";
                                    }

                                    return (
                                        <div
                                            className="absolute z-[100] pointer-events-none"
                                            style={{
                                                left: leftPos,
                                                top: `${((tile.y + (isNearTop ? 1 : 0)) / rows) * 100}%`,
                                                transform: `translate(${translateX}, ${isNearTop ? "0%" : "-100%"})`,
                                                marginTop: isNearTop ? "4px" : "-4px"
                                            }}
                                        >
                                            <div className="bg-zinc-900 border-2 border-emerald-500 rounded-xl px-4 py-3 shadow-[0_0_30px_rgba(16,185,129,0.4)] text-center flex flex-col items-center gap-1 min-w-[160px] relative">
                                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                                                    {tile.ownerId === currentUser?.id
                                                        ? "Captured by you!"
                                                        : `Captured by ${tile.ownerName || "another user"}`}
                                                </span>
                                                <div className={`absolute w-3 h-3 bg-zinc-900 border-emerald-500 rotate-45 ${triangleLeft} ${isNearTop
                                                    ? "-top-1.5 border-l-2 border-t-2"
                                                    : "-bottom-1.5 border-r-2 border-b-2"
                                                    }`} />
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </TransformComponent>
                    </div >
                </TransformWrapper >

            </div >
            {/* Bottom Prompt - inside the card */}
            < div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10" >
                <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-zinc-900/80 backdrop-blur-md px-5 py-2.5 shadow-xl ring-1 ring-white/10">
                    <MousePointerClick size={14} className="text-zinc-400" />
                    <span className="text-[11px] font-bold text-zinc-300">Click on any empty pixel to claim it!</span>
                </div>
            </div >

            <GridLegend />
        </div >
    );
}