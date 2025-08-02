import express from 'express';
import * as controller from './user.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { CreateUserSchema } from './user.schema.js';
 import multer from "multer";
import { checkPermission } from '../../middlewares/permissionMiddleware.js';
const router = express.Router();
router.use(authenticate); 

const upload = multer({ dest: 'uploads/' });

router.post('/employees/bulk-upload', upload.single('file'), controller.uploadEmployees);
router.post(  '/employe', checkPermission('manage-team.write'),validate(CreateUserSchema),controller.createEmployee );
router.get('/', controller.getAllEmployees);
router.get('/:id', controller.getEmployeeById);
router.put('/:id', controller.updateEmployee);
router.delete('/:id', controller.deleteEmployee);

export default router;
