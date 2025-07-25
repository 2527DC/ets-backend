import express from 'express';
import * as controller from './user.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();
router.use(authenticate); 

router.post('/', controller.createEmployee);
router.get('/', controller.getAllEmployees);
router.get('/:id', controller.getEmployeeById);
router.put('/:id', controller.updateEmployee);
router.delete('/:id', controller.deleteEmployee);

export default router;
