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
    ...(user.role?.name && { role: user.role.name })
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    type: user.type.toLowerCase(),
    ...(user.company && { companyId: user.company.id, companyName: user.company.name }),
    ...(user.role && { role: user.role.name }),
    allowedModules,
    token
  };
};

export default { login };





export const createSuperAdmin = async ({ email, password, name }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw { status: 400, message: 'User already exists' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
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

