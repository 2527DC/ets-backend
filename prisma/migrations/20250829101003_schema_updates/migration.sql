-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "CutoffType" AS ENUM ('BOOKING_CREATION', 'BOOKING_CANCELLATION', 'BOOKING_RESCHEDULE');

-- CreateTable
CREATE TABLE "UserWeekOff" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "daysOff" "DayOfWeek"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserWeekOff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CutoffWindow" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "cutoffType" "CutoffType" NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CutoffWindow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserWeekOff_userId_key" ON "UserWeekOff"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CutoffWindow_companyId_cutoffType_key" ON "CutoffWindow"("companyId", "cutoffType");

-- AddForeignKey
ALTER TABLE "UserWeekOff" ADD CONSTRAINT "UserWeekOff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CutoffWindow" ADD CONSTRAINT "CutoffWindow_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
