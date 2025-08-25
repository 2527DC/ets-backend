/*
  Warnings:

  - Added the required column `companyId` to the `VehicleType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VehicleType" ADD COLUMN     "companyId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "VehicleType" ADD CONSTRAINT "VehicleType_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
