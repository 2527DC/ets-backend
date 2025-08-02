import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createRole = async ({ name, companyId }) => {
  return await prisma.role.create({ data: { name, companyId } });
};

export const getAllRoles = async () => {
  
  console.log(" the methos in service for  all role" );
  
  
  prisma.role.findMany({ include: { rolePermissions: true } });}
  
export const getCompanyRoles = async (companyId) => {
  console.log(" the methos in service for company role" );
  
  if (!companyId) throw new Error("companyId is required");
  return prisma.role.findMany({
    where: { companyId },
  });
};

export const getRoleById = async (id) => prisma.role.findUnique({ where: { id }, include: { rolePermissions: true } });
export const updateRole = async (id, data) => prisma.role.update({ where: { id }, data });
export const deleteRole = async (id) => prisma.role.delete({ where: { id } });
