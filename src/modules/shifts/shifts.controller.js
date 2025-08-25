import * as service from './shifts.service.js';
import { ShiftType } from '@prisma/client';

// Middleware to get companyId (assuming it's in req.user from auth)

export const createShiftCategory = async (req, res) => {
  try {
const{ companyId }= req.user;

    const category = await service.createShiftCategory(companyId, req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getShiftCategories = async (req, res) => {
  try {
const{ companyId }= req.user;

    const categories = await service.getCompanyShiftCategories(companyId);
    if (!categories || categories.length === 0) {
      return res.status(200).json({ message: 'No shift categories found'  ,categories: []});
    }
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getShiftCategory = async (req, res) => {
  try {
const{ companyId }= req.user;

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
const{ companyId }= req.user;

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
const{ companyId }= req.user;

    await service.deleteShiftCategory(companyId, req.params.categoryId);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createShift = async (req, res) => {
  try {
const{ companyId }= req.user;

    if (!Object.values(ShiftType).includes(req.body.shiftType)) {
      return res.status(400).json({ message: 'Invalid shift type' });
    }
    
    const shift = await service.createShift(companyId, req.body);
    res.status(201).json(shift);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getShifts = async (req, res) => {
  try {
const{ companyId }= req.user;

    const shifts = await service.getCompanyShifts(companyId);
    res.status(200).json(shifts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getShift = async (req, res) => {
  try {
const{ companyId }= req.user;

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
const{ companyId }= req.user;

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
const{ companyId }= req.user;

    await service.deleteShift(companyId, req.params.shiftId);
    res.status(200).json({ message: 'Shift deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};