// src/modules/vendor/vendor.service.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();


export const createVendor = async (vendorData, adminUser = null, permissions = []) => {
  const {name,email,phone,address,licenseNumber,gstNumber,isActive} = vendorData;
  // Check if vendor already exists
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
    throw { status: 409, message: `Vendor with same ${field} already exists` };
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Create Vendor
    const newVendor = await tx.vendor.create({
      data: {
        name,
        email,
        phone,
        address,
        licenseNumber: licenseNumber || null,
        gstNumber: gstNumber || null,
        isActive: isActive ?? true,
      },
    });

    // 2. Create default role: Vendor Admin
    const newRole = await tx.vendorRole.create({
      data: {
        name: "Vendor Admin",
        vendorId: newVendor.id,
      },
    });

    // 3. Create admin user if provided
    let newVendorUser = null;
    if (adminUser?.password) {
      const existingAdmin = await tx.vendorUser.findUnique({
        where: { email: adminUser.email },
      });
      if (existingAdmin) throw { status: 409, message: "Vendor admin with this email already exists" };

      const hashedPassword = await bcrypt.hash(adminUser.password, 10);
      newVendorUser = await tx.vendorUser.create({
        data: {
          name: adminUser.name,
          email: adminUser.email,
          phone: adminUser.phone || null,
          password: hashedPassword,
          vendorId: newVendor.id,
          roleId: newRole.id,
          type: "VENDOR_ADMIN",
          isActive: true,
        },
      });
    }

    // 4. Fetch modules by keys
    const moduleKeys = permissions.map((p) => p.moduleKey);
    const modules = await tx.module.findMany({
      where: {
        key: { in: moduleKeys },
      },
    });

    // 5. Prepare permissions for role
    const permissionsData = permissions.map((perm) => {
      const matchedModule = modules.find((m) => m.key === perm.moduleKey);
      if (!matchedModule) throw new Error(`Invalid moduleKey: ${perm.moduleKey}`);

      return {
        vendorRoleId: newRole.id,
        moduleId: matchedModule.id,
        canRead: perm.canRead ?? false,
        canWrite: perm.canWrite ?? false,
        canDelete: perm.canDelete ?? false,
      };
    });

    // 6. Create permissions
    if (permissionsData.length > 0) {
      await tx.vendorPermission.createMany({ data: permissionsData });
    }

    // ✅ Return nested structure
    return {
      vendor: newVendor,
      adminUser: newVendorUser,
      role: newRole,
    };
  });
};






// ---------------- UPDATE VENDOR ----------------
export const updateVendor = async (id, data) => {
  // 1️⃣ Check if vendor exists
  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor) throw { status: 404, message: "Vendor not found" };

  // 2️⃣ Optional: check for unique fields conflict
  if (data.email && data.email !== vendor.email) {
    const emailExists = await prisma.vendor.findUnique({ where: { email: data.email } });
    if (emailExists) throw { status: 409, message: "Email already in use" };
  }
  if (data.phone && data.phone !== vendor.phone) {
    const phoneExists = await prisma.vendor.findFirst({ where: { phone: data.phone } });
    if (phoneExists) throw { status: 409, message: "Phone already in use" };
  }
  if (data.licenseNumber && data.licenseNumber !== vendor.licenseNumber) {
    const licenseExists = await prisma.vendor.findFirst({ where: { licenseNumber: data.licenseNumber } });
    if (licenseExists) throw { status: 409, message: "License number already in use" };
  }
  if (data.gstNumber && data.gstNumber !== vendor.gstNumber) {
    const gstExists = await prisma.vendor.findFirst({ where: { gstNumber: data.gstNumber } });
    if (gstExists) throw { status: 409, message: "GST number already in use" };
  }

  // 3️⃣ Update vendor
  return prisma.vendor.update({
    where: { id },
    data,
  });
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