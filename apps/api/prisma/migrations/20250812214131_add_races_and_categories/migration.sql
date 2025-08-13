-- CreateTable
CREATE TABLE "public"."Race" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "startTime" TEXT,
    "laps" INTEGER,
    "capacity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Race_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RaceCategory" (
    "id" TEXT NOT NULL,
    "raceId" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "RaceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Race_eventId_idx" ON "public"."Race"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Race_eventId_name_key" ON "public"."Race"("eventId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "RaceCategory_raceId_gender_label_key" ON "public"."RaceCategory"("raceId", "gender", "label");

-- AddForeignKey
ALTER TABLE "public"."Race" ADD CONSTRAINT "Race_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RaceCategory" ADD CONSTRAINT "RaceCategory_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "public"."Race"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
