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
             module: true
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

  let allowedModules = [];

  if (user) {
    const moduleMap = new Map();

    user.role?.rolePermissions.forEach(rp => {
      const mod = rp.module;
      if (!mod.parentId) {
        if (!moduleMap.has(mod.key)) {
          moduleMap.set(mod.key, {
            id: mod.key,
            canRead: rp.canRead,
            canWrite: rp.canWrite,
            canDelete: rp.canDelete,
            children: []
          });
        }
      } else {
        const parent = mod.parent;
        let parentEntry = moduleMap.get(parent.key);
        if (!parentEntry) {
          parentEntry = {
            id: parent.key,
            canRead: true,
            canWrite: true,
            canDelete: true,
            children: []
          };
          moduleMap.set(parent.key, parentEntry);
        }
        parentEntry.children.push({
          id: mod.key,
          canRead: rp.canRead,
          canWrite: rp.canWrite,
          canDelete: rp.canDelete
        });
      }
    });

    allowedModules = Array.from(moduleMap.values());
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    type: user.type,
    ...(user.companyId && { companyId: user.companyId }),
    // ...(user.role?.name && { role: user.role.name }),
    ...(user.role?.id && { roleId: user.role.id }) 
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' });

  return {
    user:{id: user.id,
      name: user.name,
      email: user.email,
      type: user.type.toLowerCase(),
      companyName: user.company?.name ||null ,
      role: user.role?.name },
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

  // 2. Verify password
  const isMatch = await bcrypt.compare(password, superAdmin.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // 3. Generate JWT
  const token = jwt.sign(
    {
      id: superAdmin.id,
      email: superAdmin.email,
      type: superAdmin.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  // 4. Return sanitized data
  return {
    id: superAdmin.id,
    name: superAdmin.name,
    email: superAdmin.email,
    type: superAdmin.role,
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




export const vendorUserLoginService = async (email, password) => {
  // 1. Find VendorUser with vendor and role info
  const vendorUser = await prisma.vendorUser.findUnique({
    where: { email },
    include: {
      vendor: true,
      role: true
    }
  });

  if (!vendorUser) {
    const error = new Error("Vendor User not found");
    error.status = 404;
    throw error;
  }

  if (!vendorUser.isActive) {
    const error = new Error("Account is deactivated");
    error.status = 403;
    throw error;
  }

  // 2. Compare password
  const isMatch = await bcrypt.compare(password, vendorUser.password);
  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  // 3. Generate JWT
  const token = jwt.sign(
    {
      userId: vendorUser.id,
      vendorId: vendorUser.vendorId,
      roleId: vendorUser.roleId,
      email: vendorUser.email
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    token,
    user: {
      id: vendorUser.id,
      name: vendorUser.name,
      email: vendorUser.email,
      phone: vendorUser.phone,
      role: vendorUser.role?.name || null,
      vendor: {
        id: vendorUser.vendor.id,
        name: vendorUser.vendor.name,
        isActive: vendorUser.vendor.isActive,
      }
    }
  };
  };

export default { login };
