// /src/modules/company/company.service.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';


// Create company
const createCompany = async ( companydata, adminUser, permissions ) => {
  
  const { name, email, phone, address, logo, website, isActive } = companydata;
  const { name: adminName, email: adminEmail, phone: adminPhone, password: adminPassword } = adminUser;
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const existingCompany = await prisma.company.findUnique({ where: { email } });
  if (existingCompany) throw { status: 409, message: "Company already exists" };

  return await prisma.$transaction(async (tx) => {
    // 1. Create Company
    const newCompany = await tx.company.create({
      data: { name, email, phone, address, logo, website, isActive  }
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
        type:"SUPER ADMIN"
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


// Update company with full structure
const updateCompany = async (companyId, companyData, adminUser, permissions) => {
  const { name, email, phone, address, isActive, logo, website } = companyData;

  // 1. Check if company exists
  const existingCompany = await prisma.company.findUnique({ where: { id: companyId } });
  if (!existingCompany) throw { status: 404, message: "Company not found" };

  // 2. Check for unique email conflict (but allow same email for this company)
  if (email && email !== existingCompany.email) {
    const emailExists = await prisma.company.findUnique({ where: { email } });
    if (emailExists) throw { status: 409, message: "Email already in use" };
  }

  return await prisma.$transaction(async (tx) => {
    // ✅ Update Company with logo + website
    const updatedCompany = await tx.company.update({
      where: { id: companyId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(typeof isActive === "boolean" && { isActive }),
        ...(logo && { logo }),
        ...(website && { website }),
      },
    });

    // ✅ Update Admin User if provided
    let updatedAdmin = null;
    if (adminUser) {
      const { name: adminName, email: adminEmail, phone: adminPhone, password: adminPassword } = adminUser;
      const hashedPassword = adminPassword
        ? await bcrypt.hash(adminPassword, 10)
        : undefined;

      updatedAdmin = await tx.user.updateMany({
        where: { companyId, type: "ADMIN" },
        data: {
          ...(adminName && { name: adminName }),
          ...(adminEmail && { email: adminEmail }),
          ...(adminPhone && { phone: adminPhone }),
          ...(hashedPassword && { password: hashedPassword }),
        },
      });
    }

    // ✅ Update Permissions if provided
    if (permissions && permissions.length > 0) {
      const adminRole = await tx.role.findFirst({
        where: { companyId, name: "Admin" },
      });

      if (adminRole) {
        await tx.rolePermission.deleteMany({ where: { roleId: adminRole.id } });

        const moduleKeys = permissions.map((p) => p.moduleKey);
        const modules = await tx.module.findMany({
          where: { key: { in: moduleKeys } },
        });

        const permissionsData = permissions.map((perm) => {
          const matchedModule = modules.find((m) => m.key === perm.moduleKey);
          if (!matchedModule) throw new Error(`Invalid moduleKey: ${perm.moduleKey}`);

          return {
            roleId: adminRole.id,
            moduleId: matchedModule.id,
            canRead: perm.canRead,
            canWrite: perm.canWrite,
            canDelete: perm.canDelete,
          };
        });

        await tx.rolePermission.createMany({ data: permissionsData });
      }
    }

    return { company: updatedCompany, adminUser: updatedAdmin };
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
