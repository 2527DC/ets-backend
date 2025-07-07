import express from 'express';
import * as ctrl from './module.controller.js';
const router = express.Router();

router.post('/', ctrl.createModule);
router.get('/', ctrl.getAllModules);
router.get('/:id', ctrl.getModuleById);
router.put('/:id', ctrl.updateModule);
router.delete('/:id', ctrl.deleteModule);

export default router;
