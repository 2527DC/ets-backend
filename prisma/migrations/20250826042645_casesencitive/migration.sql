/*
  Warnings:

  - You are about to drop the column `vendorId` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `alternateMobileNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `landmark` on the `User` table. All the data in the column will be lost.
  - The `lat` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `lng` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `capacity` on the `VehicleType` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `VehicleType` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `VehicleType` table. All the data in the column will be lost.
  - You are about to drop the column `fuel` on the `VehicleType` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Vendor` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Driver" DROP CONSTRAINT "Driver_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleType" DROP CONSTRAINT "VehicleType_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_companyId_fkey";

-- DropIndex
DROP INDEX "Driver_licenseNo_key";

-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "vendorId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "alternateMobileNumber",
DROP COLUMN "landmark",
DROP COLUMN "lat",
ADD COLUMN     "lat" DOUBLE PRECISION,
DROP COLUMN "lng",
ADD COLUMN     "lng" DOUBLE PRECISION,
ALTER COLUMN "phone" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "VehicleType" DROP COLUMN "capacity",
DROP COLUMN "companyId",
DROP COLUMN "description",
DROP COLUMN "fuel";

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "address",
DROP COLUMN "companyId",
DROP COLUMN "email",
DROP COLUMN "isActive",
DROP COLUMN "phone";

-- DropEnum
DROP TYPE "FuelType";

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
