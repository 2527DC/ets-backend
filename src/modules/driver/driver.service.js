import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createDriver = async (data) => {
  return await prisma.driver.create({ data });
};

export const getAllDrivers = async () => {
  return await prisma.driver.findMany({ include: { company: true } });
};

export const getDriverById = async (id) => {
  return await prisma.driver.findUnique({ where: { id }, include: { company: true } });
};

export const updateDriver = async (id, data) => {
  return await prisma.driver.update({ where: { id }, data });
};

export const deleteDriver = async (id) => {
  return await prisma.driver.delete({ where: { id } });
};
