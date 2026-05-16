"use client";

import React, { useState, useEffect } from "react";
import { Check, User, Palette } from "lucide-react";
import { useAppStore } from "../../stores/useAppStore";
import { useSocket } from "../../hooks/use-socket";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Modal } from "../common/modal";
import { UserAvatar } from "../common/user-avatar";

const PRESET_COLORS = [
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#10b981", // Green
    "#f59e0b", // Amber
    "#8b5cf6", // Violet
    "#ec4899", // Pink
    "#06b6d4", // Cyan
    "#f97316", // Orange
    "#14b8a6", // Teal
    "#a855f7", // Purple
];

export function ProfileModal() {
    const isOpen = useAppStore((state) => state.isProfileModalOpen);
    const setOpen = useAppStore((state) => state.setProfileModalOpen);
    const currentUser = useAppStore((state) => state.currentUser);
    const socket = useSocket();

    const [name, setName] = useState("");
    const [color, setColor] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name);
            setColor(currentUser.color);
        }
    }, [currentUser, isOpen]);

    const handleSave = () => {
        if (!name.trim()) {
            toast.error("Username is required");
            return;
        }
        if (name.length < 3) {
            toast.error("Username must be at least 3 characters");
            return;
        }

        setIsSaving(true);
        if (socket) {
            socket.emit("user:update", { username: name, color });
            setTimeout(() => {
                setIsSaving(false);
                setOpen(false);
                toast.success("Profile updated!");
            }, 500);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => setOpen(false)}
            title="Edit Profile"
            description="Customize your presence on the grid"
            icon={<User size={20} />}
            footer={
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="flex-1 rounded-xl"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 rounded-xl"
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Name Input */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                        Username
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500 focus:border-primary focus:outline-none transition-colors font-bold text-sm"
                        placeholder="Enter your name"
                        maxLength={20}
                    />
                </div>

                {/* Color Picker */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                        Theme Color
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                        {PRESET_COLORS.map((c) => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                className={cn(
                                    "group relative flex aspect-square items-center justify-center rounded-xl transition-all hover:scale-110 shadow-lg",
                                    color === c ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-105" : "opacity-80 hover:opacity-100"
                                )}
                                style={{ backgroundColor: c }}
                            >
                                {color === c && (
                                    <Check size={16} className="text-white drop-shadow-md" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preview */}
                <div className="rounded-xl border border-white/5 bg-white/5 p-4 flex items-center gap-4 shadow-inner">
                    <UserAvatar 
                        name={name} 
                        color={color} 
                        size="lg" 
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{name || "Anonymous"}</span>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Avatar Preview</span>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
