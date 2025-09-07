// /src/modules/vendor/vendor.routes.js
import express from 'express';
import * as vendorController from './vendor.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { CreateVendorSchema, UpdateVendorSchema } from './vendor.schema.js';

const router = express.Router();

router.use(authenticate);

// --- VENDOR CRUD ROUTES ---
router.post('/',validate(CreateVendorSchema), vendorController.createVendor);
router.get('/all-vendors',  vendorController.getAllVendors);
router.get('/vendor/:id', vendorController.getVendorById);
router.put(  '/update-vendor/:id',  validate(UpdateVendorSchema),  vendorController.updateVendor);
router.delete(  '/delete-vendor/:id',  vendorController.deleteVendor);

export default router;
