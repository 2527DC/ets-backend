import express from 'express';
import * as controller from './driver.controller.js';

const router = express.Router();

// POST /api/drivers
router.post('/', controller.createDriver);

// GET /api/drivers
router.get('/', controller.getAllDrivers);

// GET /api/drivers/:id
router.get('/:id', controller.getDriverById);

// PUT /api/drivers/:id
router.put('/:id', controller.updateDriver);

// DELETE /api/drivers/:id
router.delete('/:id', controller.deleteDriver);

export default router;
