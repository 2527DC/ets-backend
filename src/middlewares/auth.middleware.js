import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ Always use the same secret for sign + verify
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // ✅ Verify using the same secret
    const decoded = jwt.verify(token, JWT_SECRET);
    const { id, companyId, roleId, role, type, email } = decoded;

    // 🚀 SUPER_ADMIN bypass
    if (type === 'SUPER_ADMIN') {
      req.user = {
        id,
        type,
        role,
        roleId,
        companyId,
        permissions: ['*']
      };
      return next();
    }

    if (!id) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    // 🔍 Fetch only necessary fields from rolePermission and module
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      select: {
        canRead: true,
        canWrite: true,
        canDelete: true,
        module: {
          select: { key: true, isActive: true }
        }
      }
    });

    // 🧠 Build permission strings
    const permissions = [];
    for (const p of rolePermissions) {
      if (!p.module.isActive) continue;

      const key = p.module.key;
      if (p.canRead) permissions.push(`${key}.read`);
      if (p.canWrite) permissions.push(`${key}.write`);
      if (p.canDelete) permissions.push(`${key}.delete`);
    }

    // 🪪 Attach to req.user
    req.user = { id, type, role, roleId, email, companyId, permissions };

    return next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please login again.' });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Authentication failed.' });
    }

    return res.status(401).json({ message: 'Authentication failed.' });
  }
};
