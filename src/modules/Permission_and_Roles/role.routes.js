import express from 'express';
import * as controller from './role.controller.js';

const router = express.Router();

router.post('/', controller.createRole);
router.get('/', controller.getAllRoles);
router.get('/:id', controller.getRoleById);
router.put('/:id', controller.updateRole);
router.delete('/:id', controller.deleteRole);

export default router;
