/*
  Warnings:

  - You are about to drop the `AdminPermission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AdminPermission" DROP CONSTRAINT "AdminPermission_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "AdminPermission" DROP CONSTRAINT "AdminPermission_userId_fkey";

-- DropTable
DROP TABLE "AdminPermission";
