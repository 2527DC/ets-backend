import express from 'express';
import * as controller from './driver.controller.js';
import uploadDocuments from '../../middlewares/upload.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

// POST /api/drivers
router.post("/", uploadDocuments, controller.createDriver )
  
// GET /api/drivers
router.get('/', controller.getAllDrivers);

// GET /api/drivers/:id
router.get('/:id', controller.getDriverById);

// PUT /api/drivers/:id
router.put('/:id', controller.updateDriver);

// DELETE /api/drivers/:id
router.delete('/:id', controller.deleteDriver);

export default router;
