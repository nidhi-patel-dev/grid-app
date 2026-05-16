"use client";

import React from "react";
import { cn } from "../../lib/utils";

interface UserAvatarProps {
    name?: string;
    color?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function UserAvatar({ 
    name = "Anonymous", 
    color = "#3b82f6", 
    size = "md",
    className 
}: UserAvatarProps) {
    const initial = name[0]?.toUpperCase() || "?";
    
    const sizeClasses = {
        sm: "h-7 w-7 text-[10px]",
        md: "h-8 w-8 text-[10px]",
        lg: "h-10 w-10 text-sm",
    };

    return (
        <div
            className={cn(
                "rounded-full flex items-center justify-center font-bold text-white shadow-sm shrink-0",
                sizeClasses[size],
                className
            )}
            style={{ backgroundColor: color }}
        >
            {initial}
        </div>
    );
}
