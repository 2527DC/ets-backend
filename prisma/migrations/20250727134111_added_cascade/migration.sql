-- DropForeignKey
ALTER TABLE "DriverDocumnets" DROP CONSTRAINT "DriverDocumnets_driverId_fkey";

-- AddForeignKey
ALTER TABLE "DriverDocumnets" ADD CONSTRAINT "DriverDocumnets_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;
