/*
  Warnings:

  - The `phone` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `ntg` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ntg" TEXT NOT NULL,
DROP COLUMN "phone",
ADD COLUMN     "phone" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
