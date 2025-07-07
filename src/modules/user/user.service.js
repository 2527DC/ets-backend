import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

const createEmployee = async ({ name, email, password, phone, companyId, roleId }) => {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw { status: 400, message: 'Email already in use' };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create employee (type=EMPLOYEE)
  const employee = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      type: 'EMPLOYEE',
      companyId,
      roleId,
      isActive: true
    },
    include: {
      role: true,
      company: true
    }
  });

  return {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    phone: employee.phone,
    companyId: employee.companyId,
    companyName: employee.company?.name,
    roleId: employee.roleId,
    roleName: employee.role?.name,
    createdAt: employee.createdAt
  };
};

const getAllEmployees = async () => {
  return await prisma.user.findMany({
    where: { type: 'EMPLOYEE' },
    include: { role: true, company: true }
  });
};

const getEmployeeById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    include: { role: true, company: true }
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
