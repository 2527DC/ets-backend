import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createModule = async (data) => {
  if (Array.isArray(data)) {
    // Step 1: Find existing keys
    const keys = data.map(m => m.key);
    const existing = await prisma.module.findMany({
      where: { key: { in: keys } },
      select: { key: true, id: true, name: true }
    });

    const existingKeys = existing.map(e => e.key);

    // Step 2: Filter out only new modules
    const newModules = data.filter(m => !existingKeys.includes(m.key));

    // Step 3: Insert only new modules
    let inserted = [];
    if (newModules.length > 0) {
      inserted = await prisma.module.createMany({
        data: newModules.map(m => ({
          name: m.name,
          key: m.key,
          isActive: m.isActive ?? true,
          isRestricted: m.isRestricted ?? false
        })),
        skipDuplicates: true, // extra safety
      });
    }

    return {
      insertedCount: inserted.count || 0,
      skippedKeys: existingKeys,
      insertedKeys: newModules.map(m => m.key),
    };
  }

  // -------- Single insert ----------
  const existing = await prisma.module.findUnique({
    where: { key: data.key },
    select: { key: true, id: true, name: true }
  });

  if (existing) {
    return {
      insertedCount: 0,
      skippedKeys: [existing.key],
      insertedKeys: []
    };
  }

  const module = await prisma.module.create({
    data: {
      name: data.name,
      key: data.key,
      isActive: data.isActive ?? true,
      isRestricted: data.isRestricted ?? false,
    }
  });

  return {
    insertedCount: 1,
    skippedKeys: [],
    insertedKeys: [module.key],
    module,
  };
};

export const getAllModules = async () => {
  return await prisma.module.findMany();
};

export const getModuleById = async (id) => {
  return await prisma.module.findUnique({ where: { id } });
};

export const updateModule = async (id, data) => {
  return await prisma.module.update({
    where: { id },
    data
  });
};

export const deleteModule = async (id) => {
  return await prisma.module.delete({ where: { id } });
};
