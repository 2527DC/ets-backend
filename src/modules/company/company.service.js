// /src/modules/company/company.service.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create company
const createCompany = async ({ name, email, phone, address }) => {
  const exists = await prisma.company.findUnique({ where: { email } });
  if (exists) throw { status: 409, message: "Company already exists" };

  return prisma.company.create({
    data: { name, email, phone, address }
  });
};

// Get all companies
const getAllCompanies = async () => {
  return prisma.company.findMany({
    include: {
      users: true,
      roles: true,
    },
    orderBy: { createdAt: 'desc' }
  });
};

// Get single company by ID
const getCompanyById = async (id) => {
  return prisma.company.findUnique({
    where: { id },
    include: {
      users: true,
      roles: true,
    },
  });
};

// Update company
const updateCompany = async (id, data) => {
  // Check if company exists
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) throw { status: 404, message: "Company not found" };

  // Optional: check for unique email conflict
  if (data.email && data.email !== company.email) {
    const emailExists = await prisma.company.findUnique({ where: { email: data.email } });
    if (emailExists) throw { status: 409, message: "Email already in use" };
  }

  return prisma.company.update({
    where: { id },
    data,
  });
};

// Delete company
const deleteCompany = async (id) => {
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) throw { status: 404, message: "Company not found" };

  return prisma.company.delete({ where: { id } });
};

export default {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
};
