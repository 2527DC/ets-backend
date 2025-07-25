import express from 'express';
import {
  createRolePermission,
  getAllRolePermissions,
  updateRolePermission,
  deleteRolePermission,
  getRolePermissionsByRoleId,
  getUserPermissions
} from './rolePermission.controller.js';

const router = express.Router();

// POST /api/role-permissions
router.post('/', createRolePermission);

// GET /api/role-permissions
router.get('/', getAllRolePermissions);

// PUT /api/role-permissions/:id
router.put('/:id', updateRolePermission);
// DELETE /api/role-permissions/:id
router.delete('/:id', deleteRolePermission);
router.get('/permissions', getUserPermissions); // get role permission by token 

router.get('/role/:roleId', getRolePermissionsByRoleId);
export default router;

