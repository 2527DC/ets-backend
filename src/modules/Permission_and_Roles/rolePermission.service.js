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

    // 1️⃣ Get role permissions along with module and its parent
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        module: {
          include: {
            parent: true, // get parent module if it exists
          },
        },
      },
    });

    if (!rolePermissions || rolePermissions.length === 0) {
      throw new Error("No role permissions found for this company");
    }

    // 2️⃣ Build map of modules -> children
    const moduleMap = new Map();

    rolePermissions.forEach((rp) => {
      const mod = rp.module;

      if (!mod.parentId) {
        // Parent module
        if (!moduleMap.has(mod.key)) {
          moduleMap.set(mod.key, {
            id: mod.key,
            canRead: rp.canRead,
            canWrite: rp.canWrite,
            canDelete: rp.canDelete,
            children: [],
          });
        }
      } else {
        // Child module
        const parent = mod.parent;
        if (!parent) return; // safety check

        let parentEntry = moduleMap.get(parent.key);
        if (!parentEntry) {
          // If parent not yet added, add it with default perms
          parentEntry = {
            id: parent.key,
            canRead: true,
            canWrite: true,
            canDelete: true,
            children: [],
          };
          moduleMap.set(parent.key, parentEntry);
        }

        parentEntry.children.push({
          id: mod.key,
          canRead: rp.canRead,
          canWrite: rp.canWrite,
          canDelete: rp.canDelete,
        });
      }
    });

    // 3️⃣ Convert map to array
    const allowedModules = Array.from(moduleMap.values());

    return allowedModules;
  } catch (err) {
    console.error("getPermissionsFromToken error:", err);
    throw new Error("Failed to get permissions: " + err.message);
  }
};
