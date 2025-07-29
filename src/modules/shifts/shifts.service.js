import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export const createShiftCategory = async (companyId, data) => {
  return await prisma.shiftCategory.create({
    data: {
      name: data.name,
      description: data.description,
      companyId: Number(companyId)
    }
  });
};

export const getCompanyShiftCategories = async (companyId) => {
  return await prisma.shiftCategory.findMany({
    where: { companyId: Number(companyId) },
    include: { shifts: true }
  });
};

export const getShiftCategoryById = async (companyId, categoryId) => {
  return await prisma.shiftCategory.findUnique({
    where: { 
      id: Number(categoryId),
      companyId: Number(companyId)
    },
    include: { shifts: true }
  });
};

export const updateShiftCategory = async (companyId, categoryId, data) => {
  return await prisma.shiftCategory.update({
    where: { 
      id: Number(categoryId),
      companyId: Number(companyId)
    },
    data: {
      name: data.name,
      description: data.description
    }
  });
};

export const deleteShiftCategory = async (companyId, categoryId) => {
  // Delete related shifts first
  await prisma.shift.deleteMany({
    where: { 
      shiftCategoryId: Number(categoryId),
      companyId: Number(companyId)
    }
  });
  
  return await prisma.shiftCategory.delete({
    where: { 
      id: Number(categoryId),
      companyId: Number(companyId)
    }
  });
};

export const createShift = async (companyId, data) => {
  return await prisma.shift.create({
    data: {
      shiftType: data.shiftType,
      hour: data.hour,
      minute: data.minute,
      shiftCategoryId: Number(data.shiftCategoryId),
      companyId: Number(companyId)
    }
  });
};

export const getCompanyShifts = async (companyId) => {
  return await prisma.shift.findMany({
    where: { companyId: Number(companyId) },
    include: {
      shiftCategory: true,
      Route: true
    }
  });
};

export const getShiftById = async (companyId, shiftId) => {
  return await prisma.shift.findUnique({
    where: { 
      id: Number(shiftId),
      companyId: Number(companyId)
    },
    include: {
      shiftCategory: true,
      Route: true
    }
  });
};

export const updateShift = async (companyId, shiftId, data) => {
  return await prisma.shift.update({
    where: { 
      id: Number(shiftId),
      companyId: Number(companyId)
    },
    data: {
      shiftType: data.shiftType,
      hour: data.hour,
      minute: data.minute,
      shiftCategoryId: data.shiftCategoryId ? Number(data.shiftCategoryId) : undefined
    }
  });
};

export const deleteShift = async (companyId, shiftId) => {
  // Remove from routes first
  return await prisma.shift.delete({
    where: { 
      id: Number(shiftId),
      companyId: Number(companyId)
    }
  });
};