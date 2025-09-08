/*
  Warnings:

  - You are about to drop the column `type` on the `vendors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."vendor_users" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'STANDARD';

-- AlterTable
ALTER TABLE "public"."vendors" DROP COLUMN "type";
