import { PrismaClient } from '@prisma/client';

// /src/modules/vendor/vendor.service.js

const prisma = new PrismaClient();

export const createVendor = async (vendorData) => {
    try {
        const vendor = await prisma.vendor.create({
            data: vendorData,
        });
        return vendor;
    } catch (error) {
        throw new Error(`Error creating vendor: ${error.message}`);
    }
};

export const getAllVendors = async () => {
    try {
        const vendors = await prisma.vendor.findMany();
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
        return { message: 'Vendor deleted successfully' };
    } catch (error) {
       if (error.code ==="P2025") {
        return { code:404, success: false, message: 'Vendor not found' };
       }
       return { code:500,success: false, message: { message:`An unexpected error occurred `, error: error.code} };
    }
};