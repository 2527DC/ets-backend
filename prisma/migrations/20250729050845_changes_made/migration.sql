-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "driverId" INTEGER;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
