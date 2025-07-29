/*
  Warnings:

  - Added the required column `companyId` to the `Shift` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `ShiftCategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ShiftCategory_name_key";

-- AlterTable
ALTER TABLE "Shift" ADD COLUMN     "companyId" INTEGER NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ShiftCategory" ADD COLUMN     "companyId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ShiftCategory" ADD CONSTRAINT "ShiftCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
