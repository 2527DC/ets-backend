/*
  Warnings:

  - A unique constraint covering the columns `[licenseNo]` on the table `Driver` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `vendorId` to the `Driver` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_driverId_fkey";

-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "vendorId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Driver_licenseNo_key" ON "Driver"("licenseNo");

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
