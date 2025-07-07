import * as driverService from './driver.service.js';

export const createDriver = async (req, res) => {
  try {
    const driver = await driverService.createDriver(req.body);
    res.status(201).json(driver);
  } catch (err) {
    console.error('Create driver error:', err);
    res.status(500).json({ message: err.message || 'Something went wrong' });
  }
};

export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await driverService.getAllDrivers();
    res.json(drivers);
  } catch (err) {
    console.error('Get drivers error:', err);
    res.status(500).json({ message: err.message || 'Something went wrong' });
  }
};

export const getDriverById = async (req, res) => {
  try {
    const driver = await driverService.getDriverById(parseInt(req.params.id));
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (err) {
    console.error('Get driver by ID error:', err);
    res.status(500).json({ message: err.message || 'Something went wrong' });
  }
};

export const updateDriver = async (req, res) => {
  try {
    const updated = await driverService.updateDriver(parseInt(req.params.id), req.body);
    res.json(updated);
  } catch (err) {
    console.error('Update driver error:', err);
    res.status(500).json({ message: err.message || 'Something went wrong' });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    await driverService.deleteDriver(parseInt(req.params.id));
    res.json({ message: 'Driver deleted successfully' });
  } catch (err) {
    console.error('Delete driver error:', err);
    res.status(500).json({ message: err.message || 'Something went wrong' });
  }
};
