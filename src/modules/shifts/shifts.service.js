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
    include: { 
      shifts: {
        where: { isActive: true },
        orderBy: [{ hour: 'asc' }, { minute: 'asc' }]
      } 
    },
    orderBy: { name: 'asc' }
  });
};

export const getShiftCategoryById = async (companyId, categoryId) => {
  return await prisma.shiftCategory.findUnique({
    where: { 
      id: Number(categoryId),
      companyId: Number(companyId)
    },
    include: { 
      shifts: {
        where: { isActive: true },
        orderBy: [{ hour: 'asc' }, { minute: 'asc' }]
      } 
    }
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
  // Check if category exists and belongs to company
  const category = await prisma.shiftCategory.findUnique({
    where: { 
      id: Number(categoryId),
      companyId: Number(companyId)
    }
  });
  
  if (!category) {
    throw new Error('Shift category not found');
  }
  
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
  // Verify the shift category exists and belongs to the company
  const category = await prisma.shiftCategory.findUnique({
    where: { 
      id: Number(data.shiftCategoryId),
      companyId: Number(companyId)
    }
  });
  
  if (!category) {
    throw new Error('Shift category not found');
  }
  
  return await prisma.shift.create({
    data: {
      shiftType: data.shiftType,
      hour: data.hour,
      minute: data.minute,
      shiftCategoryId: Number(data.shiftCategoryId),
      companyId: Number(companyId)
    },
    include: {
      shiftCategory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const getCompanyShifts = async (companyId, filters = {}) => {
  const whereClause = {
    companyId: Number(companyId),
    ...filters
  };
  
  const shifts = await prisma.shift.findMany({
    where: whereClause,
    include: {
      shiftCategory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      { shiftCategoryId: 'asc' },
      { hour: 'asc' },
      { minute: 'asc' }
    ]
  });

  return shifts;
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
  // If changing category, verify the new category exists and belongs to the company
  if (data.shiftCategoryId) {
    const category = await prisma.shiftCategory.findUnique({
      where: { 
        id: Number(data.shiftCategoryId),
        companyId: Number(companyId)
      }
    });
    
    if (!category) {
      throw new Error('Shift category not found');
    }
  }
  
  const updateData = {
    ...(data.shiftType && { shiftType: data.shiftType }),
    ...(data.hour !== undefined && { hour: data.hour }),
    ...(data.minute !== undefined && { minute: data.minute }),
    ...(data.isActive !== undefined && { isActive: data.isActive }),
    ...(data.shiftCategoryId && { shiftCategoryId: Number(data.shiftCategoryId) })
  };
  
  return await prisma.shift.update({
    where: { 
      id: Number(shiftId),
      companyId: Number(companyId)
    },
    data: updateData,
    include: {
      shiftCategory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const deleteShift = async (companyId, shiftId) => {
 
  return await prisma.shift.delete({
    where: { 
      id: Number(shiftId),
      companyId: Number(companyId)
    }
  });
};

export const toggleShiftStatus = async (companyId, shiftId, isActive) => {
  return await prisma.shift.update({
    where: { 
      id: Number(shiftId),
      companyId: Number(companyId)
    },
    data: { isActive },
    include: {
      shiftCategory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};