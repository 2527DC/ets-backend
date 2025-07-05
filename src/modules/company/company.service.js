// /src/modules/company/company.service.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const createCompany = async ({ name, email, phone, address }) => {
  // Business logic: check duplicate, etc.
  const exists = await prisma.company.findUnique({ where: { email } });
  if (exists) throw { status: 409, message: "Company already exists" };

  return prisma.company.create({
    data: { name, email, phone, address }
  });
};

export default { createCompany };
