// src/modules/vendor/vendor.service.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
// ---------------- CREATE VENDOR ----------------

export const createVendor = async (data, adminUser, permissions = [], companyId) => {
  const { licenseNumber, gstNumber, phone, email, ...vendorDetails } = data;

  return await prisma.$transaction(async (tx) => {
    // Duplicate check
    const existingVendor = await tx.vendor.findFirst({
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
          ? 'licenseNumber'
          : existingVendor.gstNumber === gstNumber
          ? 'gstNumber'
          : existingVendor.phone === phone
          ? 'phone'
          : 'email';
      const err = new Error(`Vendor with same ${field} already exists`);
      err.status = 409;
      throw err;
    }

    // Create vendor
    const vendorData = {
      ...vendorDetails,
      licenseNumber: licenseNumber || null,
      gstNumber: gstNumber || null,
      phone: phone || null,
      email: email || null,
      ...(companyId && { company: { connect: { id: Number(companyId) } } }),
    };

    const vendor = await tx.vendor.create({ data: vendorData });

    // Create admin user if provided
    let vendorUser = null;
    if (adminUser?.password) {
      const hashedPassword = await bcrypt.hash(adminUser.password, 10);
      vendorUser = await tx.vendorUser.create({
        data: {
          name: adminUser.name,
          email: adminUser.email,
          phone: adminUser.phone,
          password: hashedPassword,
          vendorId: vendor.id,
          roleId: 1, // Assign default admin role ID or fetch dynamically
          isActive: true,
        },
      });

      // Assign permissions
      if (permissions.length) {
        await tx.vendorUserPermission.createMany({
          data: permissions.map((p) => ({ ...p, userId: vendorUser.id })),
        });
      }
    }

    return {
      ...vendor,
      adminUser: vendorUser
        ? {
            id: vendorUser.id,
            name: vendorUser.name,
            email: vendorUser.email,
            phone: vendorUser.phone,
          }
        : null,
      permissions,
    };
  });
};


// ---------------- UPDATE VENDOR ----------------
export const updateVendor = async (id, vendorData) => {
  try {
    // 🔹 Check for duplicates excluding current vendor
    const conditions = [];
    if (vendorData.licenseNumber) conditions.push({ licenseNumber: vendorData.licenseNumber });
    if (vendorData.gstNumber) conditions.push({ gstNumber: vendorData.gstNumber });
    if (vendorData.phone) conditions.push({ phone: vendorData.phone });
    if (vendorData.email) conditions.push({ email: vendorData.email });

    if (conditions.length) {
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
        if (duplicate.licenseNumber === vendorData.licenseNumber) field = 'licenseNumber';
        else if (duplicate.gstNumber === vendorData.gstNumber) field = 'gstNumber';
        else if (duplicate.phone === vendorData.phone) field = 'phone';
        else if (duplicate.email === vendorData.email) field = 'email';

        const err = new Error(`${field} already exists`);
        err.status = 409;
        throw err;
      }
    }

    return await prisma.vendor.update({
      where: { id: Number(id) },
      data: vendorData,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      const err = new Error('Vendor not found');
      err.status = 404;
      throw err;
    }
    if (error.status) throw error;
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