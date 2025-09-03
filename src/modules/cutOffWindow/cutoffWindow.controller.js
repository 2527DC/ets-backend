import {  cutoffWindowService, WeekOffService } from "./cutoffWindow.service.js";

export const cutoffWindowController = {
  // Create cutoff window
  createCutoffWindow: async (req, res) => {
    try {
      const { companyId, cutoffType, durationMin, isActive } = req.body;

      if (!companyId || !cutoffType || durationMin === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Company ID, cutoff type, and duration are required'
        });
      }

      const cutoffWindow = await cutoffWindowService.createCutoffWindow({
        companyId,
        cutoffType,
        durationMin,
        isActive
      });

      res.status(201).json({
        success: true,
        message: 'Cutoff window created successfully',
        data: cutoffWindow
      });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Cutoff window for this type already exists for the company'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error creating cutoff window',
        error: error.message
      });
    }
  },

  // Get all cutoff windows for a company
  getCutoffWindows: async (req, res) => {
    try {
      const { companyId } = req.params;

      const cutoffWindows = await cutoffWindowService.getCutoffWindowsByCompany(companyId);

      res.status(200).json({
        success: true,
        data: cutoffWindows
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching cutoff windows',
        error: error.message
      });
    }
  },

  // Get single cutoff window
  getCutoffWindow: async (req, res) => {
    try {
      const { id } = req.params;
      const { companyId } = req.query;

      const cutoffWindow = await cutoffWindowService.getCutoffWindowById(id, companyId);

      if (!cutoffWindow) {
        return res.status(404).json({
          success: false,
          message: 'Cutoff window not found'
        });
      }

      res.status(200).json({
        success: true,
        data: cutoffWindow
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching cutoff window',
        error: error.message
      });
    }
  },

  // Update cutoff window
  updateCutoffWindow: async (req, res) => {
    try {
      const { id } = req.params;
      const { companyId, ...updateData } = req.body;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required'
        });
      }

      const cutoffWindow = await cutoffWindowService.updateCutoffWindow(id, companyId, updateData);

      res.status(200).json({
        success: true,
        message: 'Cutoff window updated successfully',
        data: cutoffWindow
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Cutoff window not found'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error updating cutoff window',
        error: error.message
      });
    }
  },

  // Delete cutoff window
  deleteCutoffWindow: async (req, res) => {
    try {
      const { id } = req.params;
      const { companyId } = req.body;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required'
        });
      }

      await cutoffWindowService.deleteCutoffWindow(id, companyId);

      res.status(200).json({
        success: true,
        message: 'Cutoff window deleted successfully'
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Cutoff window not found'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error deleting cutoff window',
        error: error.message
      });
    }
  },

  // Get cutoff window by type
  getCutoffByType: async (req, res) => {
    try {
      const { companyId, cutoffType } = req.params;

      const cutoffWindow = await cutoffWindowService.getCutoffWindowByType(companyId, cutoffType);

      if (!cutoffWindow) {
        return res.status(404).json({
          success: false,
          message: 'Cutoff window not found for this type'
        });
      }

      res.status(200).json({
        success: true,
        data: cutoffWindow
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching cutoff window',
        error: error.message
      });
    }
  },

  // Toggle cutoff window status
  toggleCutoffWindowStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { companyId, isActive } = req.body;

      if (!companyId || isActive === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Company ID and status are required'
        });
      }

      const cutoffWindow = await cutoffWindowService.toggleCutoffWindowStatus(id, companyId, isActive);

      res.status(200).json({
        success: true,
        message: `Cutoff window ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: cutoffWindow
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Cutoff window not found'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error updating cutoff window status',
        error: error.message
      });
    }
  }
};

const weekOffService = new WeekOffService();
// controllers/weekOff.controller.js
export class WeekOffController {
  // ✅ Create weekoff
  async create(req, res) {
    try {
      const { companyId, departmentId, userId, daysOfWeek } = req.body;

      // Validate mandatory fields
      if (!daysOfWeek || !Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
        return res.status(400).json({ error: "daysOfWeek is required" });
      }

      const weekOff = await weekOffService.createWeekOff({
        companyId,
        departmentId,
        userId,
        daysOfWeek,
      });

      res.status(201).json(weekOff);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Upsert (create or update)
  async upsert(req, res) {
    try {
      const { companyId, departmentId, userId, daysOfWeek } = req.body;
      const weekOff = await weekOffService.upsertWeekOff({
        companyId,
        departmentId,
        userId,
        daysOfWeek,
      });
      res.json(weekOff);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get weekoff for user with fallback
  async getForUser(req, res) {
    try {
      const userId = Number(req.params.userId);
      const weekOff = await weekOffService.getUserWeekOff(userId);
      if (!weekOff) return res.status(404).json({ message: "No weekoff found" });
      res.json(weekOff);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete weekoff
  async delete(req, res) {
    try {
      const id = Number(req.params.id);
      await weekOffService.deleteWeekOff(id);
      res.json({ message: "WeekOff deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
