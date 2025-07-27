import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import {  DocumentStatus } from "@prisma/client";

export const createDriver = async (driverData, files) => {

  
  try {

    if (typeof driverData === "string") {
      driverData = JSON.parse(driverData);
    }
    const {
      name,
      email,
      phone,
      licenseNo,
      vehicleId,
      companyId,
      isActive = true,
      driverDocuments = [],
    } = driverData;
    // ✅ Validate required fields
    if (!name || !licenseNo || !companyId) {
      throw new Error("Missing required driver fields: name, licenseNo, or companyId");
    }

    // ✅ Map uploaded files by document type
    const fileMap = {
      LICENSE: files?.license_no || "",
      INDICATION: files?.indication_file || "",
      AADHAR: files?.govId|| "",
      BGV: files?.bgv|| "",
      POLICE_VERIFICATION: files?.police_verification || "",
      MEDICAL_VERIFICATION: files?.medical_verification || "",
      TRAINING_VERIFICATION: files?.training_verification || "",
      EYE_TEST: files?.eye_test|| "",
      LETTER_OF_UNDERTAKING: files?.letter_of_undertaking|| "",
      INSURANCE: files?.insurance || "",
      POLLUTION: files?.pollution || "",
      RC: files?.rc || "",
    };

    // Log the files object to debug its structure
    console.log("Files object:", files);

    const documentsToCreate = driverDocuments.map((doc) => ({
      documentType: doc.documentType,
      status: doc.status || DocumentStatus.PENDING,
      expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
      filepath: fileMap[doc.documentType] || "ss",
    }));

    console.log(" this are the docuemnats to be created", documentsToCreate);
    
    const createdDriver = await prisma.$transaction(async (tx) => {
      return await tx.driver.create({
        data: {
          name,
          email,
          phone,
          licenseNo,
          vehicleId,
          companyId,
          isActive,
          driverDocuments: {
            create: documentsToCreate,
          },
        },
        include: {
          driverDocuments: true,
        },
      });
    });

    return "ann";
  } catch (error) {
    console.error("❌ Driver creation failed:", error.message);
    throw new Error("Driver creation failed. Reason: " + error.message);
  }
};


export const getAllDrivers = async () => {
  return await prisma.driver.findMany({ include: { company: true ,driverDocuments :true} });
};

export const getDriverById = async (id) => {
  return await prisma.driver.findUnique({ where: { id }, include: { company: true } });
};

export const updateDriver = async (id, data) => {
  return await prisma.driver.update({ where: { id }, data });
};


export const deleteDriver = async (id) => {
  try {
    await prisma.driver.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    if (error.code === "P2025" ) {
      return {code:404, success: false, message: 'Driver not found' };
    }
    return { code:500,success: false, message: { message:`An unexpected error occurred `, error: error.code} };
  }
};
