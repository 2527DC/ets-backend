import * as vehicleService from './vehicle.service.js';

export const createVehicle = async (req, res) => {
    try {
        const vehicleData = req.body;
        const vehicle = await vehicleService.createVehicle(vehicleData);
        res.status(201).json(vehicle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await vehicleService.getAllVehicles();
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await vehicleService.getVehicleById(id);
        res.status(200).json(vehicle);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

export const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicleData = req.body;
        const updatedVehicle = await vehicleService.updateVehicle(id, vehicleData);
        res.status(200).json(updatedVehicle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await vehicleService.deleteVehicle(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



export const createVehicleType = async (req, res) => {
  try {
    const result = await vehicleService.createVehicleType(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({ message: 'Failed to create VehicleType' });
  }
};

export const getAllVehicleTypes = async (req, res) => {
  try {
    const result = await vehicleService.getAllVehicleTypes();
    res.json(result);
  } catch (error) {
    console.error('Fetch all error:', error);
    res.status(500).json({ message: 'Failed to fetch VehicleTypes' });
  }
};

export const getVehicleTypeById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await vehicleService.getVehicleTypeById(id);
    if (!result) {
      return res.status(404).json({ message: 'VehicleType not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Fetch by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch VehicleType'  ,error:error.name,error:error});
  }
};

export const updateVehicleType = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await vehicleService.updateVehicleType(id, req.body);

    if (!result.success && result.message === 'VehicleType not found') {
      return res.status(404).json({ message: result.message });
    }

    res.json(result);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Failed to update VehicleType' });
  }
};

export const deleteVehicleType = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await vehicleService.deleteVehicleType(id);

    if (!result.success && result.message === 'VehicleType not found') {
      return res.status(404).json({ message: result.message });
    }

    res.json({ message: 'VehicleType deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Failed to delete VehicleType' ,error:error.name,error:error});
  }
};
