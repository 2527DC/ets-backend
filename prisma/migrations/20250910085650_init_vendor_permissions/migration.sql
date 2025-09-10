/*
  Warnings:

  - You are about to drop the column `vendorId` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `permissions` on the `vendor_roles` table. All the data in the column will be lost.
  - You are about to drop the column `vendorRoleId` on the `vendor_users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."roles" DROP CONSTRAINT "roles_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."vendor_users" DROP CONSTRAINT "vendor_users_roleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."vendor_users" DROP CONSTRAINT "vendor_users_vendorRoleId_fkey";

-- AlterTable
ALTER TABLE "public"."roles" DROP COLUMN "vendorId";

-- AlterTable
ALTER TABLE "public"."vendor_roles" DROP COLUMN "permissions";

-- AlterTable
ALTER TABLE "public"."vendor_users" DROP COLUMN "vendorRoleId";

-- CreateTable
CREATE TABLE "public"."vendor_permissions" (
    "id" SERIAL NOT NULL,
    "vendorRoleId" INTEGER NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "canRead" BOOLEAN NOT NULL DEFAULT false,
    "canWrite" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_permissions_vendorRoleId_moduleId_key" ON "public"."vendor_permissions"("vendorRoleId", "moduleId");

-- AddForeignKey
ALTER TABLE "public"."vendor_users" ADD CONSTRAINT "vendor_users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."vendor_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vendor_permissions" ADD CONSTRAINT "vendor_permissions_vendorRoleId_fkey" FOREIGN KEY ("vendorRoleId") REFERENCES "public"."vendor_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vendor_permissions" ADD CONSTRAINT "vendor_permissions_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
