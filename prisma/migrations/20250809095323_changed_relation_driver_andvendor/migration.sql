-- DropForeignKey
ALTER TABLE "Driver" DROP CONSTRAINT "Driver_vendorId_fkey";

-- AlterTable
ALTER TABLE "Driver" ALTER COLUMN "vendorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
