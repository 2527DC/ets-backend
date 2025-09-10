/*
  Warnings:

  - Added the required column `vendorId` to the `roles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."vendor_users" DROP CONSTRAINT "vendor_users_roleId_fkey";

-- AlterTable
ALTER TABLE "public"."roles" ADD COLUMN     "vendorId" INTEGER ;

-- AlterTable
ALTER TABLE "public"."vendor_users" ADD COLUMN     "vendorRoleId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."roles" ADD CONSTRAINT "roles_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vendor_users" ADD CONSTRAINT "vendor_users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vendor_users" ADD CONSTRAINT "vendor_users_vendorRoleId_fkey" FOREIGN KEY ("vendorRoleId") REFERENCES "public"."vendor_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
