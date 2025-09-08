import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient()
export const createProductAdminService = async (data) => {
  const { name, email, password, role } = data;

  // Check if email already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email },
  });
  if (existingAdmin) {
    throw new Error("Admin with this email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create Admin
  const admin = await prisma.admin.create({
    data: {
      name,
      email,
      password: hashedPassword,

    },
  });

  return admin;
};
