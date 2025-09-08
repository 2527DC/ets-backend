// /src/modules/company/company.service.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';


// Create company
const createCompany = async ( companydata, adminUser, permissions ) => {
  
  const { name, email, phone, address } = companydata;
  const { name: adminName, email: adminEmail, phone: adminPhone, password: adminPassword } = adminUser;
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const existingCompany = await prisma.company.findUnique({ where: { email } });
  if (existingCompany) throw { status: 409, message: "Company already exists" };

  return await prisma.$transaction(async (tx) => {
    // 1. Create Company
    const newCompany = await tx.company.create({
      data: { name, email, phone, address }
    });

    // 2. Create Role
    const newRole = await tx.role.create({
      data: {
        name: "Admin",
        companyId: newCompany.id,
      }
    });

    // 3. Create Admin User
    const newUser = await tx.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        password: hashedPassword,
        companyId: newCompany.id,
        roleId: newRole.id,
        type:"ADMIN"
      }
    });

    // 4. Fetch Modules by keys
    const moduleKeys = permissions.map(p => p.moduleKey);
    const modules = await tx.module.findMany({
      where: {
        key: { in: moduleKeys }
      }
    });

    // 5. Prepare Permissions for Role
    const permissionsData = permissions.map((perm) => {
      const matchedModule = modules.find(m => m.key === perm.moduleKey);
      if (!matchedModule) throw new Error(`Invalid moduleKey: ${perm.moduleKey}`);

      return {
        roleId: newRole.id,
        moduleId: matchedModule.id,
        canRead: perm.canRead,
        canWrite: perm.canWrite,
        canDelete: perm.canDelete
      };
    });

    // 6. Create Permissions
    await tx.rolePermission.createMany({ data: permissionsData });

    return {
      company: newCompany,
      adminUser: newUser,
      role: newRole
    };
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
