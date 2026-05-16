import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getTitle = (count: number) => {
    if (count >= 1000) return "Grid Dominator";
    if (count >= 500) return "Pixel Master";
    if (count >= 100) return "Tile Veteran";
    if (count >= 10) return "Active Painter";
    return "Pixel Newbie";
};

export const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return date.toLocaleDateString();
};
