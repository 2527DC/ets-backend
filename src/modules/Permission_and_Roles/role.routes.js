import express from 'express';
import * as controller from './role.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate); 
router.post('/', controller.createRole);
router.get('/', controller.getAllRoles);
router.get('/company-roles', controller.getCompanyRoles);
router.get('/:id', controller.getRoleById);
router.put('/:id', controller.updateRole);
router.delete('/:id', controller.deleteRole);
router.get("/:roleId/users", controller.getRoleUsers);
router.post("/:roleId/assign-users", controller.assignUsersToRole);
export default router;
