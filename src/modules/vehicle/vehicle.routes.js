// /src/modules/company/company.routes.js
import express from 'express';
import * as vehicleController from './vehicle.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

router.post('/', vehicleController.createVehicle);
router.post('/create-vehicle-type', vehicleController.createVehicleType);
router.get('/get-all-vehicle-types', vehicleController.getAllVehicleTypes);
router.get('/get-vehicle-type/:id', vehicleController.getVehicleTypeById);
router.put('/update-vehicle-type/:id', vehicleController.updateVehicleType);
router.delete('/delete-vehicle-type/:id', vehicleController.deleteVehicleType);

router.get('/', vehicleController.getAllVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.put('/:id', vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);

export default router;
