/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHERS');

-- CreateEnum
CREATE TYPE "SpecialNeeds" AS ENUM ('PREGNENT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gender" "Gender",
ADD COLUMN     "specialNeed" "SpecialNeeds",
ADD COLUMN     "specialNeedEnd" TIMESTAMP(3),
ADD COLUMN     "specialNeedStart" TIMESTAMP(3),
ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");
