import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createAdminPermission = async ({ userId, moduleId, canRead, canWrite, canDelete }) => {
  return prisma.adminPermission.create({ data: { userId, moduleId, canRead, canWrite, canDelete } });
};

export const getAllAdminPermissions = () => prisma.adminPermission.findMany({ include: { module: true, user: true } });
export const updateAdminPermission = (id, data) => prisma.adminPermission.update({ where: { id }, data });
export const deleteAdminPermission = (id) => prisma.adminPermission.delete({ where: { id } });
