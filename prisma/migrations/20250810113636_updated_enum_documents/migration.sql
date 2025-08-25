-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocumentType" ADD VALUE 'RC_CARD';
ALTER TYPE "DocumentType" ADD VALUE 'INSURANCE';
ALTER TYPE "DocumentType" ADD VALUE 'PERMIT';
ALTER TYPE "DocumentType" ADD VALUE 'POLLUTION';
ALTER TYPE "DocumentType" ADD VALUE 'FITNESS';
ALTER TYPE "DocumentType" ADD VALUE 'TAX_RECEIPT';
