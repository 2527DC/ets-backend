import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

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

export const getPermissionsFromToken = async (token) => {
  try {
    // 1️⃣ Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET);

    const companyId = decoded?.companyId;
    const roleName = decoded?.role;

    if (!companyId || !roleName) {
      throw new Error('Invalid token payload: missing companyId or role');
    }

    // 2️⃣ Find role by companyId + name
    const role = await prisma.role.findFirst({
      where: {
        companyId,
        name: roleName,
      },
      include: {
        rolePermissions: {
          include: {
            module: true,  // include module info
          },
        },
      },
    });

    if (!role) {
      throw new Error('Role not found for this company');
    }

    return role;

  } catch (err) {
    console.error('getPermissionsFromToken error:', err);
    throw new Error('Failed to get permissions: ' + err.message);
  }
};
