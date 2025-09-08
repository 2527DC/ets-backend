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

  return createdPermissions; 
};

export const getAllRolePermissions = () => prisma.rolePermission.findMany({ include: { module: true, role: true } });


export const updateRolePermissions = async (roleId, permissions) => {
  const permsArray = Array.isArray(permissions) ? permissions : [permissions];

  const updatedPermissions = await prisma.$transaction(
    permsArray.map((perm) =>
      prisma.rolePermission.upsert({
        where: {
          unique_role_module: {
            roleId,
            moduleId: perm.moduleId,
          },
        },
        update: {
          canRead: perm.canRead ?? undefined,
          canWrite: perm.canWrite ?? undefined,
          canDelete: perm.canDelete ?? undefined,
        },
        create: {
          roleId,
          moduleId: perm.moduleId,
          canRead: perm.canRead ?? false,
          canWrite: perm.canWrite ?? false,
          canDelete: perm.canDelete ?? false,
        },
      })
    )
  );

  // Map to a clean response structure
  return updatedPermissions.map((perm) => ({
    moduleId: perm.moduleId,
    canRead: perm.canRead,
    canWrite: perm.canWrite,
    canDelete: perm.canDelete,
  }));
};


export const deleteRolePermission = (id) => prisma.rolePermission.delete({ where: { id } });


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


export const getPermissionsFromToken = async (companyId, roleId) => {
  try {
    if (!companyId || !roleId) {
      throw new Error("Invalid token payload: missing companyId or role");
    }

    // 1️⃣ Get role permissions with modules
    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        roleId,
        module: {
          isActive: true, // ✅ only include active modules
        },
      },
      include: {
        module: true, // just get module info, no nesting
      },
    });

    if (!rolePermissions || rolePermissions.length === 0) {
      throw new Error("No role permissions found for this role");
    }

    // 2️⃣ Build flat array of modules with permissions
    const allowedModules = rolePermissions.map((rp) => ({
      moduleKey: rp.module.key,
      canRead: rp.canRead,
      canWrite: rp.canWrite,
      canDelete: rp.canDelete,  
      isRestricted :rp.module.isRestricted
    }));

    return allowedModules;
  } catch (err) {
    console.error("getPermissionsFromToken error:", err);
    throw new Error("Failed to get permissions: " + err.message);
  }
};
