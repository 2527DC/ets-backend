import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export const createVehicle = async (vehicleData) => {
    try {
        const vehicle = await prisma.vehicle.create({
            data: vehicleData,
        });
        return vehicle;
    } catch (error) {
        throw new Error(`Error creating vehicle: ${error.message}`);
    }
};

export const getAllVehicles = async () => {
    try {
        const vehicles = await prisma.vehicle.findMany();
        return vehicles;
    } catch (error) {
        throw new Error(`Error fetching vehicles: ${error.message}`);
    }
};

export const getVehicleById = async (id) => {
    try {
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: Number(id) },
        });
        if (!vehicle) {
            throw new Error('Vehicle not found');
        }
        return vehicle;
    } catch (error) {
        throw new Error(`Error fetching vehicle: ${error.message}`);
    }
};

export const updateVehicle = async (id, vehicleData) => {
    try {
        const updatedVehicle = await prisma.vehicle.update({
            where: { id: Number(id) },
            data: vehicleData,
        });
        return updatedVehicle;
    } catch (error) {
        throw new Error(`Error updating vehicle: ${error.message}`);
    }
};

export const deleteVehicle = async (id) => {
    try {
        await prisma.vehicle.delete({
            where: { id: Number(id) },
        });
        return { message: 'Vehicle deleted successfully' };
    } catch (error) {
        throw new Error(`Error deleting vehicle: ${error.message}`);
    }
};



export const createVehicleType = async (data) => {
  return await prisma.vehicleType.create({ data });
};

export const getAllVehicleTypes = async () => {
  return await prisma.vehicleType.findMany();
};

export const getVehicleTypeById = async (id) => {
  return await prisma.vehicleType.findUnique({ where: { id } });
};

export const updateVehicleType = async (id, data) => {
  try {
    return await prisma.vehicleType.update({
      where: { id },
      data,
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      return { success: false, message: 'VehicleType not found' };
    }
    throw error;
  }
};

export const deleteVehicleType = async (id) => {
  try {
    await prisma.vehicleType.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    if ( error.code === 'P2025') {
      return { success: false, message: 'VehicleType not found' };
    }
    throw error;
  }
};
