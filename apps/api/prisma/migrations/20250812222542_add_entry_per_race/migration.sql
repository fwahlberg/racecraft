-- CreateTable
CREATE TABLE "public"."Entry" (
    "id" TEXT NOT NULL,
    "raceId" TEXT NOT NULL,
    "riderName" TEXT NOT NULL,
    "email" TEXT,
    "club" TEXT,
    "bcId" TEXT,
    "emergencyName" TEXT NOT NULL,
    "emergencyPhone" TEXT NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Entry_raceId_idx" ON "public"."Entry"("raceId");

-- CreateIndex
CREATE UNIQUE INDEX "unique_bc_id" ON "public"."Entry"("bcId");

-- AddForeignKey
ALTER TABLE "public"."Entry" ADD CONSTRAINT "Entry_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "public"."Race"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
