import express from 'express';
import { cutoffWindowController } from './cutoffWindow.controller.js';

const router = express.Router();

// Create a new cutoff window
router.post('/cutoff-windows', cutoffWindowController.createCutoffWindow);

// Get all cutoff windows for a company
router.get('/companies/:companyId/cutoff-windows', cutoffWindowController.getCutoffWindows);

// Get cutoff window by type for a company
router.get('/companies/:companyId/cutoff-type/:cutoffType', cutoffWindowController.getCutoffByType);

// Get single cutoff window
router.get('/cutoff-windows/:id', cutoffWindowController.getCutoffWindow);

// Update cutoff window
router.put('/cutoff-windows/:id', cutoffWindowController.updateCutoffWindow);

// Toggle cutoff window status
router.patch('/cutoff-windows/:id/toggle-status', cutoffWindowController.toggleCutoffWindowStatus);

// Delete cutoff window
router.delete('/cutoff-windows/:id', cutoffWindowController.deleteCutoffWindow);

export default router;