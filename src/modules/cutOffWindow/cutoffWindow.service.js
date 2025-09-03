import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const cutoffWindowService = {
  // Create a new cutoff window
  createCutoffWindow: async (data) => {
    return await prisma.cutoffWindow.create({
      data: {
        companyId: Number(data.companyId),
        cutoffType: data.cutoffType,
        durationMin: Number(data.durationMin),
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    });
  },
  
  // Get all cutoff windows for a company
  getCutoffWindowsByCompany: async (companyId) => {
    return await prisma.cutoffWindow.findMany({
      where: {
        companyId: Number(companyId)
      },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  // Get cutoff window by ID
  getCutoffWindowById: async (id, companyId = null) => {
    const where = { id: Number(id) };
    if (companyId) {
      where.companyId = Number(companyId);
    }
    
    return await prisma.cutoffWindow.findUnique({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  },

  // Update cutoff window
  updateCutoffWindow: async (id, companyId, data) => {
    return await prisma.cutoffWindow.update({
      where: {
        id: Number(id),
        companyId: Number(companyId)
      },
      data: {
        ...(data.cutoffType && { cutoffType: data.cutoffType }),
        ...(data.durationMin !== undefined && { durationMin: Number(data.durationMin) }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedAt: new Date()
      }
    });
  },

  // Delete cutoff window
  deleteCutoffWindow: async (id, companyId) => {
    return await prisma.cutoffWindow.delete({
      where: {
        id: Number(id),
        companyId: Number(companyId)
      }
    });
  },

  // Get cutoff window by type for a company
  getCutoffWindowByType: async (companyId, cutoffType) => {
    return await prisma.cutoffWindow.findUnique({
      where: {
        unique_company_cutoff_type: {
          companyId: Number(companyId),
          cutoffType: cutoffType
        }
      }
    });
  },

  // Toggle cutoff window status
  toggleCutoffWindowStatus: async (id, companyId, isActive) => {
    return await prisma.cutoffWindow.update({
      where: {
        id: Number(id),
        companyId: Number(companyId)
      },
      data: {
        isActive: isActive,
        updatedAt: new Date()
      }
    });
  }
};



// services/weekOff.service.js

export class WeekOffService {
  async createWeekOff({ companyId, departmentId, userId, daysOfWeek }) {
    return prisma.weekOff.create({
      data: {
        companyId,
        departmentId,
        userId,
        daysOfWeek,
      },
    });
  }

  async upsertWeekOff({ companyId, departmentId, userId, daysOfWeek }) {
    return prisma.weekOff.upsert({
      where: {
        userId: userId || undefined,
        departmentId: departmentId || undefined,
      },
      update: { daysOfWeek },
      create: {
        companyId,
        departmentId,
        userId,
        daysOfWeek,
      },
    });
  }

  async getUserWeekOff(userId) {
    // 1. Check user-specific weekoff
    let weekOff = await prisma.weekOff.findUnique({
      where: { userId },
    });

    if (weekOff) return weekOff;

    // 2. Else check department/team weekoff
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { department: true },
    });

    if (user?.departmentId) {
      weekOff = await prisma.weekOff.findUnique({
        where: { departmentId: user.departmentId },
      });
    }

    // 3. Else check company level weekoff
    if (!weekOff && user?.companyId) {
      weekOff = await prisma.weekOff.findFirst({
        where: { companyId: user.companyId },
      });
    }

    return weekOff;
  }

  async deleteWeekOff(id) {
    return prisma.weekOff.delete({ where: { id } });
  }
}

