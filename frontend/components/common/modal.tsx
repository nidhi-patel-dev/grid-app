"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    icon,
    footer,
    maxWidth = "md"
}: ModalProps) {
    const maxWidthClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className={cn(
                        "relative w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl flex flex-col",
                        maxWidthClasses[maxWidth]
                    )}
                >
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                        <div className="flex items-center gap-3">
                            {icon && (
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    {icon}
                                </div>
                            )}
                            <div>
                                <h2 className="text-lg font-bold text-white uppercase tracking-wider">{title}</h2>
                                {description && (
                                    <p className="text-xs text-zinc-500 font-medium mt-0.5">{description}</p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-full p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {children}
                    </div>

                    {footer ? (
                        <div className="p-6 border-t border-white/5 bg-zinc-900/50">
                            {footer}
                        </div>
                    ) : (
                        <div className="p-4 px-6 border-t border-white/5 bg-white/[0.02]">
                            <button
                                onClick={onClose}
                                className="w-full py-2.5 rounded-xl bg-white/10 text-sm font-bold text-white hover:bg-white/20 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
