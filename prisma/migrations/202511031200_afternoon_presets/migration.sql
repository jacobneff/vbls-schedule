-- CreateEnum
CREATE TYPE "DayPresetType" AS ENUM ('WEEKDAY', 'WEEKEND', 'MEMORIAL_DAY', 'INDEPENDENCE_DAY', 'LABOR_DAY');

-- AlterTable
ALTER TABLE "Stand" ADD COLUMN     "neverSupportsAS" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AfternoonPreset" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "presetType" "DayPresetType" NOT NULL,

    CONSTRAINT "AfternoonPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AfternoonPresetEntry" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "standId" INTEGER NOT NULL,
    "presetId" INTEGER NOT NULL,

    CONSTRAINT "AfternoonPresetEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AfternoonPreset_presetType_key" ON "AfternoonPreset"("presetType");

-- CreateIndex
CREATE UNIQUE INDEX "AfternoonPresetEntry_standId_presetId_key" ON "AfternoonPresetEntry"("standId", "presetId");

-- AddForeignKey
ALTER TABLE "AfternoonPresetEntry" ADD CONSTRAINT "AfternoonPresetEntry_standId_fkey" FOREIGN KEY ("standId") REFERENCES "Stand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AfternoonPresetEntry" ADD CONSTRAINT "AfternoonPresetEntry_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "AfternoonPreset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
