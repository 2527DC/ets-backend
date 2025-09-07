/*
  Warnings:

  - You are about to drop the column `parentId` on the `modules` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."modules" DROP CONSTRAINT "modules_parentId_fkey";

-- AlterTable
ALTER TABLE "public"."modules" DROP COLUMN "parentId",
ADD COLUMN     "isRestricted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."roles" ADD COLUMN     "isAssignable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isSystemLevel" BOOLEAN NOT NULL DEFAULT false;
