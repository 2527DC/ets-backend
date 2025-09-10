import express from 'express';
import * as controller from './user.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { CreateUserSchema, UpdateUserSchema } from './user.schema.js';
import multer from 'multer';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// 🔒 Protect all routes
router.use(authenticate);

// --- TEAM ROUTES ---
router.post('/create-department', controller.createDepartments);
router.get('/company-departments', controller.getCompanyDepartments); // ✅ Changed POST to GET

// --- EMPLOYEE BULK UPLOAD ---
router.post('/employees/bulk-upload', upload.single('file'), controller.uploadEmployees);

// --- EMPLOYEE CRUD ---
router.post('/employee',validate(CreateUserSchema),controller.createEmployee);
router.put('/employee/:id',validate(UpdateUserSchema), controller.updateEmployee);
// toggle the emoployee status 

router.patch("/status-update/:userId", controller.toggleIsActiveStatusController);

router.get('/department-employees/:id', controller.getEmployeesByDepartments); 
router.get("/employees/search", controller.searchEmployees);

router.get('/employees', controller.getAllEmployees); 
// ❗️Dynamic routes must come last to avoid conflict
router.put('/update-department/:id', controller.updateDepartments);
router.delete('/delete-departments/:id', controller.deleteDepartments);
    
router.get('/employee/:id', controller.getEmployeeById);
router.delete('/employee/:id', controller.deleteEmployee);
export default router;
