/*
  Warnings:

  - The values [INSURANCE,RC,POLLUTION] on the enum `DocumentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DocumentType_new" AS ENUM ('LICENSE', 'AADHAR', 'GOV_ID', 'BGV', 'POLICE_VERIFICATION', 'MEDICAL', 'TRAINING', 'EYE_TEST', 'UNDERTAKING');
ALTER TABLE "VehicleDocument" ALTER COLUMN "documentType" TYPE "DocumentType_new" USING ("documentType"::text::"DocumentType_new");
ALTER TABLE "DriverDocumnets" ALTER COLUMN "documentType" TYPE "DocumentType_new" USING ("documentType"::text::"DocumentType_new");
ALTER TYPE "DocumentType" RENAME TO "DocumentType_old";
ALTER TYPE "DocumentType_new" RENAME TO "DocumentType";
DROP TYPE "DocumentType_old";
COMMIT;
