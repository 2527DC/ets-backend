-- DropForeignKey
ALTER TABLE "Route" DROP CONSTRAINT "Route_shiftId_fkey";

-- AlterTable
ALTER TABLE "Route" ALTER COLUMN "shiftId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE SET NULL ON UPDATE CASCADE;
