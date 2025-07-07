import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createModule = async ({ name, key, parentId }) => {
  return await prisma.module.create({
    data: { name, key, parentId, isActive: true }
  });
};

export const getAllModules = async () => {
  return await prisma.module.findMany({
    include: { children: true, parent: true }
  });
};

export const getModuleById = async (id) => {
  return await prisma.module.findUnique({
    where: { id },
    include: { children: true, parent: true }
  });
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
