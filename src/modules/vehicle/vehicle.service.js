import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const createVehicle = async (vehicleData) => {
  try {
    const vehicle = await prisma.vehicle.create({
      data: vehicleData,
    });
    return vehicle;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { success: false, message: `Database error: ${error.message}` };
    }
    throw new Error(`Error creating vehicle: ${error.message}`);
  }
};

export const getAllVehicles = async () => {
  try {
    const vehicles = await prisma.vehicle.findMany();
    return vehicles;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { success: false, message: `Database error: ${error.message}` };
    }
    throw new Error(`Error fetching vehicles: ${error.message}`);
  }
};

export const getVehicleById = async (id) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: Number(id) },
    });
    if (!vehicle) {
      return { success: false, message: 'Vehicle not found' };
    }
    return vehicle;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { success: false, message: `Database error: ${error.message}` };
    }
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return { success: false, message: 'Vehicle not found' };
    }
    throw new Error(`Error updating vehicle: ${error.message}`);
  }
};

export const deleteVehicle = async (id) => {
  try {
    await prisma.vehicle.delete({
      where: { id: Number(id) },
    });
    return { success: true, message: 'Vehicle deleted successfully' };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return { success: false, message: 'Vehicle not found' };
    }
    throw new Error(`Error deleting vehicle: ${error.message}`);
  }
};

export const createVehicleType = async (data, companyId) => {
  try {
    if (!companyId) {
      throw new Error('Company ID is required to create a vehicle type');
    }

    const vehicleType = await prisma.vehicleType.create({
      data: {
        name: data.name,
        capacity: data.capacity,
        fuel: data.fuel, // must match enum: PETROL, DIESEL, ELECTRIC, HYBRID
        description: data.description || null,
        companyId,
      },
    });
    return vehicleType;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { success: false, message: `Database error: ${error.message}` };
    }
    throw new Error(`Error creating vehicle type: ${error.message}`);
  }
};

export const getAllVehicleTypes = async (companyId) => {
  try {
    const vehicleTypes = await prisma.vehicleType.findMany({
      where: { companyId },
    });
    return vehicleTypes;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { success: false, message: `Database error: ${error.message}` };
    }
    throw new Error(`Error fetching vehicle types: ${error.message}`);
  }
};

export const getVehicleTypeById = async (id) => {
  try {
    const vehicleType = await prisma.vehicleType.findUnique({ where: { id } });
    if (!vehicleType) {
      return { success: false, message: 'Vehicle type not found' };
    }
    return vehicleType;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { success: false, message: `Database error: ${error.message}` };
    }
    throw new Error(`Error fetching vehicle type: ${error.message}`);
  }
};

export const updateVehicleType = async (id, data) => {
  try {
    const updatedVehicleType = await prisma.vehicleType.update({
      where: { id },
      data,
    });
    return updatedVehicleType;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return { success: false, message: 'Vehicle type not found' };
    }
    throw new Error(`Error updating vehicle type: ${error.message}`);
  }
};

export const deleteVehicleType = async (id) => {
  try {
    await prisma.vehicleType.delete({ where: { id } });
    return { success: true, message: 'Vehicle type deleted successfully' };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return { success: false, message: 'Vehicle type not found' };
    }
    throw new Error(`Error deleting vehicle type: ${error.message}`);
  }
};
