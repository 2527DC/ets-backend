/*
  Warnings:

  - Added the required column `companyId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduledTime` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "companyId" INTEGER NOT NULL,
ADD COLUMN     "scheduledTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "shiftId" INTEGER;

-- AlterTable
ALTER TABLE "Shift" ADD COLUMN     "days" "DayOfWeek"[];

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE SET NULL ON UPDATE CASCADE;
