/*
  Warnings:

  - You are about to drop the column `days` on the `Shift` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Shift" DROP COLUMN "days";

-- DropEnum
DROP TYPE "DayOfWeek";
