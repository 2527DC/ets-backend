import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const login = async (email, password) => {
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              module: {
                select: {
                  key: true,
                  name: true,
                  isRestricted: true
                }
              }
            }
          }
        }
      },
      company: true
    }
  });

  if (!user) throw { status: 401, message: 'Invalid credentials' };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw { status: 401, message: 'Invalid credentials' };

  const tokenPayload = {
    id: user.id,
    email: user.email,
    type: "COMPANY",
    ...(user.companyId && { companyId: user.companyId }),
    companyName: user.company?.name || null,
    ...(user.role?.id && { roleId: user.role.id }) 
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' });

  // Transform rolePermissions to use module key and remove unnecessary fields
  const allowedModules = user.role?.rolePermissions?.map(permission => ({
    moduleKey: permission.module.key,
    moduleName: permission.module.name,
    isRestricted: permission.module.isRestricted,
    canRead: permission.canRead,
    canWrite: permission.canWrite,
    canDelete: permission.canDelete
  })) || [];

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      type: "COMPANY",
      companyName: user.company?.name || null,
      role: user.role?.name 
    },
    allowedModules,
    token
  };
};

export const superAdminLoginService = async ({ email, password }) => {
  const superAdmin = await prisma.admin.findUnique({
    where: { email }
  });

  if (!superAdmin) {
    throw new Error("Super Admin not found");
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, superAdmin.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // Generate JWT with consistent payload structure
  const token = jwt.sign(
    {
      id: superAdmin.id,
      email: superAdmin.email,
      type: superAdmin.role ,// Use consistent type naming
      role: []// Include role if needed
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  // Return sanitized data
  return {
    id: superAdmin.id,
    name: superAdmin.name,
    email: superAdmin.email,
    type: superAdmin.role , // Consistent type
    role: superAdmin.role,
    token
  };
};



export const createSuperAdmin = async ({ email, password, name ,phone}) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw { status: 400, message: 'User already exists' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      phone,
      email,
      password: hashedPassword,
      name,
      type: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  return {
    message: 'Super Admin created successfully',
    userId: newUser.id,
  };
};



export const employeeLoginService = async (email, password) => {
  try {
    // 1️⃣ Check if employee exists
    const employee = await prisma.user.findUnique({
      where: { email },
    });

    if (!employee) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }

    // 2️⃣ Validate password
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }

    // 3️⃣ Generate JWT token
    const token = jwt.sign(
      { id: employee.id, role: employee.role }, // payload
      JWT_SECRET,
      { expiresIn: "1d" } // token expiry
    );

    // 4️⃣ Return user info + token
    return {
      message: "Login successful",
      token,
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      },
    };
  } catch (err) {
    const customError = new Error(err.message || "Failed to login");
    customError.status = err.status || 500;
    throw customError;
  }
};


export default { login };
