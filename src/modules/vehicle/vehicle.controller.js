import * as vehicleService from './vehicle.service.js';

const sendResponse = (res, statusCode, success, data, message = null) => {
  res.status(statusCode).json({ success, data, message });
};

export const createVehicle = async (req, res) => {
  try {
    const vehicleData = req.body;
    const vehicle = await vehicleService.createVehicle(vehicleData);
    sendResponse(res, 201, true, vehicle, 'Vehicle created successfully');
  } catch (error) {
    sendResponse(res, 500, false, null, error.message);
  }
};

export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();
    sendResponse(res, 200, true, vehicles, 'Vehicles fetched successfully');
  } catch (error) {
    sendResponse(res, 500, false, null, error.message);
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await vehicleService.getVehicleById(id);
    if (!vehicle) {
      return sendResponse(res, 404, false, null, 'Vehicle not found');
    }
    sendResponse(res, 200, true, vehicle, 'Vehicle fetched successfully');
  } catch (error) {
    sendResponse(res, 500, false, null, error.message);
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicleData = req.body;
    const updatedVehicle = await vehicleService.updateVehicle(id, vehicleData);
    sendResponse(res, 200, true, updatedVehicle, 'Vehicle updated successfully');
  } catch (error) {
    sendResponse(res, 500, false, null, error.message);
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await vehicleService.deleteVehicle(id);
    sendResponse(res, 200, true, result, 'Vehicle deleted successfully');
  } catch (error) {
    sendResponse(res, 500, false, null, error.message);
  }
};

export const createVehicleType = async (req, res) => {
  try {
    const { companyId } = req.user;
    const result = await vehicleService.createVehicleType(req.body, companyId);
    sendResponse(res, 201, true, result, 'VehicleType created successfully');
  } catch (error) {
    sendResponse(res, 500, false, null, 'Failed to create VehicleType');
  }
};

export const getAllVehicleTypes = async (req, res) => {
  try {
    const result = await vehicleService.getAllVehicleTypes();
    sendResponse(res, 200, true, { vehicleTypes: result }, 'VehicleTypes fetched successfully');
  } catch (error) {
    sendResponse(res, 500, false, null, 'Failed to fetch VehicleTypes');
  }
};

export const getVehicleTypeById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await vehicleService.getVehicleTypeById(id);
    if (!result) {
      return sendResponse(res, 404, false, null, 'VehicleType not found');
    }
    sendResponse(res, 200, true, result, 'VehicleType fetched successfully');
  } catch (error) {
    sendResponse(res, 500, false, null, 'Failed to fetch VehicleType');
  }
};

export const updateVehicleType = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await vehicleService.updateVehicleType(id, req.body);

    if (!result.success && result.message === 'VehicleType not found') {
      return sendResponse(res, 404, false, null, result.message);
    }

    sendResponse(res, 200, true, result, 'VehicleType updated successfully');
  } catch (error) {
    sendResponse(res, 500, false, null, 'Failed to update VehicleType');
  }
};

export const deleteVehicleType = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await vehicleService.deleteVehicleType(id);

    if (!result.success && result.message === 'VehicleType not found') {
      return sendResponse(res, 404, false, null, result.message);
    }

    sendResponse(res, 200, true, null, 'VehicleType deleted successfully');
  } catch (error) {
    sendResponse(res, 500, false, null, 'Failed to delete VehicleType');
  }
};
