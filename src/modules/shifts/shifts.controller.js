import * as service from './shifts.service.js';
import { ShiftType } from '@prisma/client';

// Middleware to get companyId (assuming it's in req.user from auth)

export const createShiftCategory = async (req, res) => {
  try {
    const { companyId } = req.user;
    const category = await service.createShiftCategory(companyId, req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
export const getShiftCategories = async (req, res) => {
  try {
    const { companyId } = req.user;
    const categories = await service.getCompanyShiftCategories(companyId);

    res.status(200).json({
      success: true,
      message: "Shift categories fetched successfully",
      data: { categories: categories || [] },
      count: categories.length,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch shift categories",
      error: err, 
    });
  }
};


export const getShiftCategory = async (req, res) => {
  try {
    const { companyId } = req.user;
    const category = await service.getShiftCategoryById(companyId, req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Shift category not found' });
    }
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateShiftCategory = async (req, res) => {
  try {
    const { companyId } = req.user;
    const category = await service.updateShiftCategory(
      companyId,
      req.params.categoryId,
      req.body
    );
    res.status(200).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteShiftCategory = async (req, res) => {
  try {
    const { companyId } = req.user;
    await service.deleteShiftCategory(companyId, req.params.categoryId);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createShift = async (req, res) => {
  try {
    const { companyId } = req.user;

    // Validate shift type
    if (!Object.values(ShiftType).includes(req.body.shiftType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shift type',
        shift: null
      });
    }

    const shift = await service.createShift(companyId, req.body);

    res.status(201).json({
      success: true,
      message: 'Shift created successfully',
      data: shift
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
      shift: null
    });
  }
};


export const getShifts = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { categoryId, activeOnly } = req.query;
    
    const filters = {};
    if (categoryId) filters.shiftCategoryId = parseInt(categoryId);
    if (activeOnly === 'true') filters.isActive = true;
    
    const shifts = await service.getCompanyShifts(companyId, filters);

    res.status(200).json({
      success: true,
      shifts: shifts || []   
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


export const getShift = async (req, res) => {
  try {
    const { companyId } = req.user;
    const shift = await service.getShiftById(companyId, req.params.shiftId);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    res.status(200).json(shift);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateShift = async (req, res) => {
  try {
    const { companyId } = req.user;
    
    if (req.body.shiftType && !Object.values(ShiftType).includes(req.body.shiftType)) {
      return res.status(400).json({ message: 'Invalid shift type' });
    }
  
    
    const shift = await service.updateShift(companyId, req.params.shiftId, req.body);
    res.status(200).json(shift);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteShift = async (req, res) => {
  try {
    const { companyId } = req.user;
    await service.deleteShift(companyId, req.params.shiftId);
    res.status(200).json({ message: 'Shift deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};