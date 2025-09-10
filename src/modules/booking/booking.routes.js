import express from 'express';
import { createBookingsController, getScheduledBookingsController } from './booking.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createBookingSchema } from './booking.schema.validation.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

router.post('/create', validate(createBookingSchema), createBookingsController);
router.get('/get-scheduled-bookings', getScheduledBookingsController);
export default router;
