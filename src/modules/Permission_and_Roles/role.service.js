import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createRole = async ({ name, companyId }) => {
  return await prisma.role.create({ data: { name, companyId } });
};



export const getAllRoles = async (companyId) => {
  console.log(`Fetching all roles with permissions for company ${companyId}`);
  
  try {
    const roles = await prisma.role.findMany({
      where: { companyId },   // ✅ Filter by company
      include: { 
        rolePermissions: {
          include: {
            module: true
          }
        }
      }
    });
    return roles;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};

  
export const getCompanyRoles = async (companyId) => {

  
  if (!companyId) throw new Error("companyId is required");
  return prisma.role.findMany({
    where: { companyId },
  });
};

export const getRoleUsers = async (roleId) => {
  return prisma.role.findUnique({
    where: { id: roleId },
    include: {
      users: {
        select: {
          userId: true,
          name: true,
          email: true,
          phone:true
        },
      },
    },
  }).then(role => role?.users || []);
};



export const assignUsersToRole = async (roleId, userIds) => {
  // Update all given users with this roleId
  await prisma.user.updateMany({
    where: { userId: { in: userIds } },
    data: { roleId },
  });

  // Return updated users (only safe fields)
  return prisma.user.findMany({
    where: { userId: { in: userIds } },
    select: {
      id: true,
      userId: true,   // you have userId field (unique string)
      name: true,
      email: true,
      phone: true,
      roleId: true,
    },
  });
};

export const getRoleById = async (id) => prisma.role.findUnique({ where: { id }, include: { rolePermissions: true } });
export const updateRole = async (id, data) => prisma.role.update({ where: { id }, data });
export const deleteRole = async (id) => prisma.role.delete({ where: { id } });
