import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export const createRolePermissionWithChildren = async ({ roleId, moduleId, canRead, canWrite, canDelete }) => {
  // Create parent module permission
  const createdPermissions = [];

  const parentPermission = await prisma.rolePermission.create({
    data: { roleId, moduleId, canRead, canWrite, canDelete }
  });
  createdPermissions.push(parentPermission);

  // Find child modules
  const childModules = await prisma.module.findMany({
    where: { parentId: moduleId }
  });

  for (const child of childModules) {
    const childPermission = await prisma.rolePermission.create({
      data: {
        roleId,
        moduleId: child.id,
        canRead,
        canWrite,
        canDelete
      }
    });
    createdPermissions.push(childPermission);
  }

  return createdPermissions; // return all created permissions
};

export const getAllRolePermissions = () => prisma.rolePermission.findMany({ include: { module: true, role: true } });
export const updateRolePermission = (id, data) => prisma.rolePermission.update({ where: { id }, data });
export const deleteRolePermission = (id) => prisma.rolePermission.delete({ where: { id } });

// export const getRolePermissionsByRoleId = async (roleId) => {
//   const permissions = await prisma.rolePermission.findMany({
//     where: { roleId },
//     include: {
//       module: true
//     }
//   });

//   const allowedModules = permissions.map(p => ({
//     key: p.module.key,
//     canRead: p.canRead,
//     canWrite: p.canWrite,
//     canDelete: p.canDelete
//   }));

//   return { allowedModules };
// };

export const getRolePermissionsByRoleId = async (roleId) => {
  const permissions = await prisma.rolePermission.findMany({
    where: { roleId },
    select: {
      canRead: true,
      canWrite: true,
      canDelete: true,
      module: {
        select: { key: true }
      }
    }
  });

  return {
    allowedModules: permissions.map(p => ({
      id: p.module.key,
      canRead: p.canRead,
      canWrite: p.canWrite,
      canDelete: p.canDelete
    }))
  };
};
