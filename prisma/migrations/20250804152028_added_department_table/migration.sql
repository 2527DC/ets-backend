-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_companyId_fkey";

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
