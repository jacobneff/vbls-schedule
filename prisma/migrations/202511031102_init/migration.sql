-- CreateEnum
CREATE TYPE "ShiftType" AS ENUM ('REG', 'REL', 'AS', 'FM', 'MR_AS', 'OFF');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GUARD', 'SUPERVISOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "Zone" AS ENUM ('CROATAN', 'RESORT_SOUTH', 'RESORT_MIDDLE', 'RESORT_NORTH', 'FIFTY_SEVENTH');

-- CreateEnum
CREATE TYPE "AssignStatus" AS ENUM ('SCHEDULED', 'CHECKED_IN', 'LATE', 'NO_SHOW', 'CANCELLED', 'SWAPPED');

-- CreateEnum
CREATE TYPE "AvailabilitySource" AS ENUM ('IN_APP', 'PASTE', 'ADMIN_EDIT');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "yearsAtVBLS" INTEGER NOT NULL,
    "isRookie" BOOLEAN NOT NULL DEFAULT false,
    "alwaysOff" TEXT[],
    "guardPrefs" JSONB,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stand" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "label" TEXT NOT NULL,
    "zone" "Zone" NOT NULL,
    "supportsAS" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Stand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPlan" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "asPattern" TEXT NOT NULL,
    "overscheduleTarget" INTEGER NOT NULL DEFAULT 0,
    "hotspotFlags" JSONB,

    CONSTRAINT "DailyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "shift" "ShiftType" NOT NULL,
    "status" "AssignStatus" NOT NULL DEFAULT 'SCHEDULED',
    "isExtra" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "checkinLat" DOUBLE PRECISION,
    "checkinLng" DOUBLE PRECISION,
    "checkinMethod" TEXT,
    "userId" INTEGER NOT NULL,
    "standId" INTEGER,
    "dailyPlanId" INTEGER,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "request" "ShiftType",
    "source" "AvailabilitySource" NOT NULL,
    "notes" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityChange" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "availabilityId" INTEGER NOT NULL,
    "diff" JSONB NOT NULL,
    "actorId" INTEGER,

    CONSTRAINT "AvailabilityChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "TradeStatus" NOT NULL,
    "reason" TEXT,
    "fromAssignId" INTEGER NOT NULL,
    "toAssignId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "decidedById" INTEGER,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Stand_label_key" ON "Stand"("label");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPlan_date_key" ON "DailyPlan"("date");

-- CreateIndex
CREATE INDEX "Assignment_date_shift_idx" ON "Assignment"("date", "shift");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_date_userId_shift_key" ON "Assignment"("date", "userId", "shift");

-- CreateIndex
CREATE INDEX "Availability_date_idx" ON "Availability"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Availability_userId_date_key" ON "Availability"("userId", "date");

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_standId_fkey" FOREIGN KEY ("standId") REFERENCES "Stand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_dailyPlanId_fkey" FOREIGN KEY ("dailyPlanId") REFERENCES "DailyPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityChange" ADD CONSTRAINT "AvailabilityChange_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityChange" ADD CONSTRAINT "AvailabilityChange_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "Availability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityChange" ADD CONSTRAINT "AvailabilityChange_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_fromAssignId_fkey" FOREIGN KEY ("fromAssignId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_toAssignId_fkey" FOREIGN KEY ("toAssignId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

