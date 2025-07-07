import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createRole = async ({ name, companyId }) => {
  return await prisma.role.create({ data: { name, companyId } });
};

export const getAllRoles = async () => prisma.role.findMany({ include: { rolePermissions: true } });
export const getRoleById = async (id) => prisma.role.findUnique({ where: { id }, include: { rolePermissions: true } });
export const updateRole = async (id, data) => prisma.role.update({ where: { id }, data });
export const deleteRole = async (id) => prisma.role.delete({ where: { id } });
