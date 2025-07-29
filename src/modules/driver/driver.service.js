import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import {  DocumentStatus } from "@prisma/client";
import { insertDriverToFirebase } from './driver.utility.js';

export const createDriver = async (driverData, files ,companyId) => {

  
  try {

    if (typeof driverData === "string") {
      driverData = JSON.parse(driverData);
    }
    const {
      driverId,
      name,
      email,
      phone,
      licenseNo,
      isActive = true,
      driverDocuments = [],
    } = driverData;
    // ✅ Validate required fields


   console.log(" this is the files object", files);
   

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

console.log("File map:", fileMap);

    console.log("Files object:", files);

    const documentsToCreate = driverDocuments.map((doc) => ({
      documentType: doc.documentType,
      status: doc.status || DocumentStatus.PENDING,
      expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
      filepath: fileMap[doc.documentType] || "uploads/driverDocuments/default.png", // Default path if no file is uploaded
    }));

    console.log(" this are the docuemnats to be created", documentsToCreate);
    
    const createdDriver = await prisma.$transaction(async (tx) => {
      return await tx.driver.create({
        data: {
          name,
          email,
          phone,
          licenseNo,
          companyId,
          isActive,
          driverId, 
          driverDocuments: {
            create: documentsToCreate,
          },
        },
        include: {
          driverDocuments: true,
        },
      });
    });
    await insertDriverToFirebase(createdDriver.driverId);
    return createdDriver;
  } catch (error) {
    if (error.code === 'P2002') {
      const targetField = error.meta?.target?.[0] || "Field";
      throw new Error(`${targetField.charAt(0).toUpperCase() + targetField.slice(1)} already exists`);
    }
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
