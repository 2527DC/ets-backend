import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export const createRoleWithPermissions = async ({
  name,
  companyId,
  isAssignable,
  isSystemLevel,
  permissions,
}) => {
  return await prisma.$transaction(async (tx) => {
    // Create the role
    const role = await tx.role.create({
      data: {
        name,
        companyId,
        isAssignable,
        isSystemLevel,
      },
    });

    // If permissions are provided, resolve module IDs from moduleKey
    if (permissions.length > 0) {
      for (const perm of permissions) {
        const module = await tx.module.findUnique({
          where: { key: perm.moduleKey },
        });

        if (!module) {
          throw new Error(`Module with key '${perm.moduleKey}' not found`);
        }

        await tx.rolePermission.create({
          data: {
            roleId: role.id,
            moduleId: module.id,
            canRead: !!perm.canRead,
            canWrite: !!perm.canWrite,
            canDelete: !!perm.canDelete,
          },
        });
      }
    }

    // Return role with its permissions
    return await tx.role.findUnique({
      where: { id: role.id },
      include: { rolePermissions: { include: { module: true } } },
    });
  });
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




