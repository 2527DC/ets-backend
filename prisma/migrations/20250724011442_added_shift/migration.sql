-- CreateEnum
CREATE TYPE "ShiftType" AS ENUM ('LOGIN', 'LOGOUT');

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('LOGIN', 'LOGOUT', 'ADHOC');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'ASSIGNED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "additionalInfo" JSONB;

-- CreateTable
CREATE TABLE "ShiftCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShiftCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" SERIAL NOT NULL,
    "shiftType" "ShiftType" NOT NULL,
    "hour" INTEGER NOT NULL,
    "minute" INTEGER NOT NULL,
    "shiftCategoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "dropAddress" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "bookingType" "BookingType" NOT NULL,
    "isAdhoc" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShiftCategory_name_key" ON "ShiftCategory"("name");

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_shiftCategoryId_fkey" FOREIGN KEY ("shiftCategoryId") REFERENCES "ShiftCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
