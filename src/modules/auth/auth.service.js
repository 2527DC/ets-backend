import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

const login = async (email, password) => {
  // Try Admin
  const admin = await prisma.admin.findUnique({
    where: { email },
    include: {
      adminPermissions: {
        include: {
          module: {
            include: {
              children: true,
              parent: true   // Add this!
            }
          }
        }
      }
    }
  });
  

  if (admin) {
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) throw { status: 401, message: 'Invalid credentials' };

    // Build modules with children
    const moduleMap = new Map();
    admin.adminPermissions.forEach(ap => {
      const mod = ap.module;
      if (!mod.parentId) {
        // parent module
        if (!moduleMap.has(mod.id)) {
          moduleMap.set(mod.id, {
            id: mod.id,
            name: mod.name,
            key: mod.key,
            canRead: ap.canRead,
            canWrite: ap.canWrite,
            canDelete: ap.canDelete,
            children: []
          });
        }
      } else {
        // submodule: find parent entry, or create placeholder
        const parent = mod.parent;
        let parentEntry = moduleMap.get(parent.id);
        if (!parentEntry) {
          parentEntry = {
            id: parent.id,
            name: parent.name,
            key: parent.key,
            canRead: true, // default true; parent permission can be filled properly if needed
            canWrite: true,
            canDelete: true,
            children: []
          };
          moduleMap.set(parent.id, parentEntry);
        }
        parentEntry.children.push({
          id: mod.id,
          name: mod.name,
          key: mod.key,
          canRead: ap.canRead,
          canWrite: ap.canWrite,
          canDelete: ap.canDelete
        });
      }
    });

    const modules = Array.from(moduleMap.values());

    const token = jwt.sign({ id: admin.id, type: 'admin' }, JWT_SECRET, { expiresIn: '8h' });

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      type: 'admin',
      modules,
      token
    };
  }

  // Try Employee
  const employee = await prisma.employee.findUnique({
    where: { email },
    include: {
      role: { include: { rolePermissions: { include: { module: { include: { children: true, parent: true } } } } } },
      company: true
    }
  });

  if (!employee) throw { status: 401, message: 'Invalid credentials' };

  const valid = await bcrypt.compare(password, employee.password);
  if (!valid) throw { status: 401, message: 'Invalid credentials' };

  // Build modules with children
  const moduleMap = new Map();
  employee.role.rolePermissions.forEach(rp => {
    const mod = rp.module;
    if (!mod.parentId) {
      if (!moduleMap.has(mod.id)) {
        moduleMap.set(mod.id, {
          id: mod.id,
          name: mod.name,
          key: mod.key,
          canRead: rp.canRead,
          canWrite: rp.canWrite,
          canDelete: rp.canDelete,
          children: []
        });
      }
    } else {
      const parent = mod.parent;
      let parentEntry = moduleMap.get(parent.id);
      if (!parentEntry) {
        parentEntry = {
          id: parent.id,
          name: parent.name,
          key: parent.key,
          canRead: true, // default true; fill properly if needed
          canWrite: true,
          canDelete: true,
          children: []
        };
        moduleMap.set(parent.id, parentEntry);
      }
      parentEntry.children.push({
        id: mod.id,
        name: mod.name,
        key: mod.key,
        canRead: rp.canRead,
        canWrite: rp.canWrite,
        canDelete: rp.canDelete
      });
    }
  });

  const modules = Array.from(moduleMap.values());

  const token = jwt.sign(
    { id: employee.id, type: 'employee', companyId: employee.companyId, role: employee.role?.name },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    type: 'employee',
    companyId: employee.companyId,
    companyName: employee.company.name,
    role: employee.role?.name,
    modules,
    token
  };
};

export default { login };
