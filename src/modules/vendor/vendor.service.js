import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createVendor = async (vendorData, companyId) => {
    try {
      const vendor = await prisma.vendor.create({
        data: {
          ...vendorData,
          company: {
            connect: { id: companyId }
          }
        }
      });
      return vendor;
    } catch (error) {
      throw new Error(`Error creating vendor: ${error.message}`);
    }
  };
  



export const getAllVendors = async (companyId) => {
    try {
        const vendors = await prisma.vendor.findMany({
            where: {
                companyId: Number(companyId),
            },
        });
        return vendors;
    } catch (error) {
        throw new Error(`Error fetching vendors: ${error.message}`);
    }
};

export const getVendorById = async (id) => {
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { id: Number(id) },
        });
        if (!vendor) {
            throw new Error('Vendor not found');
        }
        return vendor;
    } catch (error) {
        throw new Error(`Error fetching vendor: ${error.message}`);
    }
};

export const updateVendor = async (id, vendorData) => {
    try {
        const updatedVendor = await prisma.vendor.update({
            where: { id: Number(id) },
            data: vendorData,
        });
        return updatedVendor;
    } catch (error) {
        throw new Error(`Error updating vendor: ${error.message}`);
    }
};
export const deleteVendor = async (id) => {
    try {
      await prisma.vendor.delete({
        where: { id: Number(id) },
      });
      return { code: 200, success: true, message: 'Vendor deleted successfully' };
    } catch (error) {
      console.log("This is the error in the vendor delete ", error);
  
      if (error.code === "P2025") {
        return { code: 404, success: false, message: 'Vendor not found' };
      }
      return { code: 500, success: false, message: `An unexpected error occurred: ${error.code}` };
    }
  };
  