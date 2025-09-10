import express from 'express';
import * as controller from './shifts.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

// Shift Category Routes
router.post('/categories', controller.createShiftCategory);
router.get('/categories', controller.getShiftCategories);
router.get('/categories/:categoryId', controller.getShiftCategory);
router.put('/categories/:categoryId', controller.updateShiftCategory);
router.delete('/categories/:categoryId', controller.deleteShiftCategory);

// Shift Routes
router.post('/create', controller.createShift);
router.get('/get-shifts', controller.getShifts);
router.get('/shifts/:shiftId', controller.getShift);
router.put('/shifts/:shiftId', controller.updateShift);
router.delete('/shifts/:shiftId', controller.deleteShift);

export default router;