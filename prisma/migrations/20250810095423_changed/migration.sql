/*
  Warnings:

  - Added the required column `capacity` to the `VehicleType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fuel` to the `VehicleType` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID');

-- AlterTable
ALTER TABLE "VehicleType" ADD COLUMN     "capacity" INTEGER NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "fuel" "FuelType" NOT NULL;
