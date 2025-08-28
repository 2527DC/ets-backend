/*
  Warnings:

  - Made the column `phone` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
DELETE FROM "User" WHERE "phone" IS NULL;

ALTER TABLE "User" ALTER COLUMN "phone" SET NOT NULL;
