// /src/modules/companyVendor/companyVendor.service.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ==============================
// COMPANY-VENDOR SERVICE
// ==============================

// Assign vendors to a company
const assignVendorsToCompanyService = async (companyId, vendorIds) => {
  try {
    // Validate input
    if (!vendorIds || vendorIds.length === 0) {
      throw { status: 400, message: "vendorIds must be a non-empty array" };
    }

    // Remove existing mappings
    await prisma.companyVendor.deleteMany({ where: { companyId } });

    // Create new mappings
    const assignments = await prisma.companyVendor.createMany({
      data: vendorIds.map((vendorId) => ({ companyId, vendorId })),
      skipDuplicates: true,
    });

    return assignments;
  } catch (err) {
    console.error("❌ assignVendorsToCompanyService error:", err);
    throw { status: err.status || 500, message: err.message || "Failed to assign vendors to company" };
  }
};

// Assign companies to a vendor
const assignCompaniesToVendorService = async (vendorId, companyIds) => {
  try {
    if (!companyIds || companyIds.length === 0) {
      throw { status: 400, message: "companyIds must be a non-empty array" };
    }

    // Remove existing mappings
    await prisma.companyVendor.deleteMany({ where: { vendorId } });

    // Create new mappings
    const assignments = await prisma.companyVendor.createMany({
      data: companyIds.map((companyId) => ({ companyId, vendorId })),
      skipDuplicates: true,
    });

    return assignments;
  } catch (err) {
    console.error("❌ assignCompaniesToVendorService error:", err);
    throw { status: err.status || 500, message: err.message || "Failed to assign companies to vendor" };
  }
};

// Get vendors assigned to a company
const getVendorsByCompanyService = async (companyId) => {
  try {
    const results = await prisma.companyVendor.findMany({
      where: { companyId },
      include: { vendor: true },
    });
    return results.map((item) => item.vendor); // return only vendor objects
  } catch (err) {
    console.error("❌ getVendorsByCompanyService error:", err);
    throw { status: 500, message: "Failed to fetch vendors for company" };
  }
};

// Get companies assigned to a vendor
const getCompaniesByVendorService = async (vendorId) => {
  try {
    const results = await prisma.companyVendor.findMany({
      where: { vendorId },
      include: { company: true },
    });
    return results.map((item) => item.company); // return only company objects
  } catch (err) {
    console.error("❌ getCompaniesByVendorService error:", err);
    throw { status: 500, message: "Failed to fetch companies for vendor" };
  }
};

// Remove vendor from a company
const removeVendorFromCompanyService = async (companyId, vendorId) => {
  try {
    await prisma.companyVendor.deleteMany({ where: { companyId, vendorId } });
    return true;
  } catch (err) {
    console.error("❌ removeVendorFromCompanyService error:", err);
    throw { status: 500, message: "Failed to remove vendor from company" };
  }
};

// Remove company from a vendor
const removeCompanyFromVendorService = async (vendorId, companyId) => {
  try {
    await prisma.companyVendor.deleteMany({ where: { vendorId, companyId } });
    return true;
  } catch (err) {
    console.error("❌ removeCompanyFromVendorService error:", err);
    throw { status: 500, message: "Failed to remove company from vendor" };
  }
};

export default {
  assignVendorsToCompanyService,
  assignCompaniesToVendorService,
  getVendorsByCompanyService,
  getCompaniesByVendorService,
  removeVendorFromCompanyService,
  removeCompanyFromVendorService,
};
