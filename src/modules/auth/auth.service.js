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
              module: { include: { parent: true } }
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
      companyName: user.company.name ||null ,
      role: user.role.name },
    allowedModules,
    token
  };
};

export default { login };





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
