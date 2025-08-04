/*
  Warnings:

  - Added the required column `companyId` to the `Department` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "companyId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
