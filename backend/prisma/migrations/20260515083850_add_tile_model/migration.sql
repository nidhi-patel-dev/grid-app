-- CreateTable
CREATE TABLE "Tile" (
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "ownerId" TEXT,
    "claimedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tile_pkey" PRIMARY KEY ("x","y")
);

-- AddForeignKey
ALTER TABLE "Tile" ADD CONSTRAINT "Tile_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
