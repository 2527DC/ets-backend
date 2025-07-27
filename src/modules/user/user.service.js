import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


const SALT_ROUNDS = 10;

const createEmployee = async (data) => {
  try {
    const {
      userId,
      roleId,
      companyId,
      additionalInfo,
      ...userDetails
    } = data;

    const password = await bcrypt.hash(userId, SALT_ROUNDS);

    const employeeData = {
      ...userDetails,
      userId,
      password,
      type: 'EMPLOYEE',
      addtionalInfo: additionalInfo,
      ...(companyId && { company: { connect: { id: companyId } } }),
      ...(roleId && { role: { connect: { id: roleId } } }),
    };

    return await prisma.user.create({ data: employeeData });

  } catch (error) {
    console.error('Error creating employee:', error);

    if (error.code === 'P2002') {
      const field = error.meta?.target?.join(', ') || 'field';
      const err = new Error(`Duplicate entry on ${field}`);
      err.status = 409;
      throw err;
    }

    const err = new Error('Failed to create employee');
    err.status = 500;
    throw err;
  }
};



const getAllEmployees = async () => {
  return await prisma.user.findMany({
    where: { type: 'EMPLOYEE' },
    select: {
      id: true,
      userId: true,
      name: true,
      gender: true,
      specialNeed: true,
      specialNeedStart: true,
      specialNeedEnd: true,
      email: true,
      phone: true,
      type: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      address: true,
      lat: true,
      lng: true,
      addtionalInfo: true,
      role: {
        select: {
          id: true,
          name: true
        }
      }
      // Excludes company and password
    }
  });
};


const getEmployeeById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      name: true,
      gender: true,
      specialNeed: true,
      specialNeedStart: true,
      specialNeedEnd: true,
      email: true,
      phone: true,
      type: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      address: true,
      lat: true,
      lng: true,
      addtionalInfo: true,
      role: {
        select: {
          id: true,
          name: true
        }
      }
      // company is excluded by not adding it
      // password is excluded by not selecting it
    }
  });
};


const updateEmployee = async (id, data) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  return await prisma.user.update({
    where: { id },
    data,
    include: { role: true, company: true }
  });
};

const deleteEmployee = async (id) => {
  return await prisma.user.delete({ where: { id } });
};

export default {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
};
