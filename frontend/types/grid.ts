export type TileStatus = "unclaimed" | "claimed" | "claiming";

export interface TileData {
    id: string;
    x: number;
    y: number;
    status: TileStatus;
    ownerId?: string | null;
    ownerName?: string;
    color?: string;
}
