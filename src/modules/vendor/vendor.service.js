// src/modules/vendor/vendor.service.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();


export const createVendor = async (vendorData, adminUser = null, permissions = []) => {
  const { licenseNumber, gstNumber, phone, email, ...vendorDetails } = vendorData;

  // 1️⃣ Duplicate check
  const existingVendor = await prisma.vendor.findFirst({
    where: {
      OR: [
        licenseNumber ? { licenseNumber } : undefined,
        gstNumber ? { gstNumber } : undefined,
        phone ? { phone } : undefined,
        email ? { email } : undefined,
      ].filter(Boolean),
    },
  });

  if (existingVendor) {
    const field =
      existingVendor.licenseNumber === licenseNumber
        ? "licenseNumber"
        : existingVendor.gstNumber === gstNumber
        ? "gstNumber"
        : existingVendor.phone === phone
        ? "phone"
        : "email";
    const err = new Error(`Vendor with same ${field} already exists`);
    err.status = 409;
    throw err;
  }

  // 2️⃣ Transaction starts
  return await prisma.$transaction(async (tx) => {
    // 2️⃣ Create vendor
    const vendor = await tx.vendor.create({
      data: {
        ...vendorDetails,
        licenseNumber: licenseNumber || null,
        gstNumber: gstNumber || null,
        phone: phone || null,
        email: email || null,
      },
    });

    // 3️⃣ Create default admin role
    const newRole = await tx.vendorRole.create({
      data: {
        name: "Vendor Admin",
        vendorId: vendor.id,
      },
    });

    // 4️⃣ Create admin user if provided
    let vendorUser = null;
    if (adminUser?.password) {
      const hashedPassword = await bcrypt.hash(adminUser.password, 10);
      vendorUser = await tx.vendorUser.create({
        data: {
          name: adminUser.name,
          email: adminUser.email,
          phone: adminUser.phone || null,
          password: hashedPassword,
          vendorId: vendor.id,
          roleId: newRole.id,
          isActive: true,
          type: "VENDORADMIN",
        },
      });
    }

    // 5️⃣ Fetch modules by keys
    const moduleKeys = permissions.map((p) => p.moduleKey);
    const modules = await tx.module.findMany({
      where: { key: { in: moduleKeys } },
    });

    // 6️⃣ Prepare role permissions
    const permissionsData = permissions.map((perm) => {
      const matchedModule = modules.find((m) => m.key === perm.moduleKey);
      if (!matchedModule) throw new Error(`Invalid moduleKey: ${perm.moduleKey}`);

      return {
        roleId: newRole.id,
        moduleId: matchedModule.id,
        canRead: perm.canRead,
        canWrite: perm.canWrite,
        canDelete: perm.canDelete,
      };
    });

    // 7️⃣ Create permissions if any
    if (permissionsData.length > 0) {
      await tx.vendorRolePermission.createMany({ data: permissionsData });
    }

    // 8️⃣ Return structured response
    return {
      vendor: {
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        licenseNumber: vendor.licenseNumber,
        gstNumber: vendor.gstNumber,
        isActive: vendor.isActive,
      },
      adminUser: vendorUser
        ? {
            id: vendorUser.id,
            name: vendorUser.name,
            email: vendorUser.email,
            phone: vendorUser.phone,
            role: newRole.name,
            // type: vendorUser.type,
            permissions: permissions,
          }
        : null,
      role: newRole,
    };
  });
};


// ---------------- UPDATE VENDOR ----------------
export const updateVendor = async (id, vendorData) => {
  try {
    // 🔹 Check for duplicates excluding the current vendor
    const conditions = [];
    if (vendorData.licenseNumber) conditions.push({ licenseNumber: vendorData.licenseNumber });
    if (vendorData.gstNumber) conditions.push({ gstNumber: vendorData.gstNumber });
    if (vendorData.phone) conditions.push({ phone: vendorData.phone });
    if (vendorData.email) conditions.push({ email: vendorData.email });

    if (conditions.length > 0) {
      const duplicate = await prisma.vendor.findFirst({
        where: {
          AND: [
            { id: { not: Number(id) } },
            { OR: conditions },
          ],
        },
      });

      if (duplicate) {
        let field = '';
        if (vendorData.licenseNumber && duplicate.licenseNumber === vendorData.licenseNumber) field = 'licenseNumber';
        else if (vendorData.gstNumber && duplicate.gstNumber === vendorData.gstNumber) field = 'gstNumber';
        else if (vendorData.phone && duplicate.phone === vendorData.phone) field = 'phone';
        else if (vendorData.email && duplicate.email === vendorData.email) field = 'email';

        const err = new Error(`${field} already exists`);
        err.status = 409;
        throw err;
      }
    }

    // 🔹 Update vendor
    const updatedVendor = await prisma.vendor.update({
      where: { id: Number(id) },
      data: vendorData,
    });

    return updatedVendor;
  } catch (error) {
    if (error.code === "P2025") {
      const err = new Error("Vendor not found");
      err.status = 404;
      throw err;
    }
    if (error.status) throw error;

    console.error("Prisma updateVendor error:", error);
    throw new Error(`Error updating vendor: ${error.message}`);
  }
};


// ---------------- DELETE VENDOR ----------------
export const deleteVendor = async (id) => {
  try {
    await prisma.vendor.delete({
      where: { id: Number(id) },
    });

    return { code: 200, success: true, message: 'Vendor deleted successfully' };
  } catch (error) {
    if (error.code === 'P2025') {
      return { code: 404, success: false, message: 'Vendor not found' };
    }
    return { code: 500, success: false, message: `An unexpected error occurred: ${error.message}` };
  }
};



export const getVendorById = async (id) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id: parseInt(id) }, // Prisma expects number if your ID is Int
    include: {
      users: true,       // Include vendor panel users
      vehicles: true,    // Include vehicles
      roles: true,       // Include vendor roles
      companyVendors: {  // Include company relationships if needed
        include: {
          company: true,
        },
      },
    },
  });

  if (!vendor) {
    const error = new Error('Vendor not found');
    error.status = 404;
    throw error;
  }

  return vendor;
};


// Fetch all vendors (no company filter)
export const getAllVendors = async () => {
  const vendors = await prisma.vendor.findMany({
    include: {
      users: true,         // Include vendor panel users
      vehicles: true,      // Include vehicles
      roles: true,         // Include vendor roles
      companyVendors: {
        include: {
          company: true,   // Include company info
        },
      },
    },
    orderBy: {
      createdAt: 'desc',   // Show latest vendors first
    },
  });

  return vendors;
};


export default{
  createVendor,
  updateVendor,
  deleteVendor,
  getVendorById,
  getAllVendors
};