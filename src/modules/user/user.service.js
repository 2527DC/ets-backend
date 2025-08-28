import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

import { parseExcelFile } from './user.utility.js';
import { CreateUserSchema } from './user.schema.js';
const prisma = new PrismaClient();


const SALT_ROUNDS = 10;

const createEmployee = async (data, companyId) => {
  try {
    const { userId, departmentId, alternate_mobile_number, dateRange, roleId, additionalInfo, ...userDetails } = data;

    const password = await bcrypt.hash(userId, SALT_ROUNDS);

    const employeeData = {
      ...userDetails,
      userId,
      alternative_phone: alternate_mobile_number,
      password,
      type: 'EMPLOYEE',
      specialNeed: data?.specialNeed || null,
      specialNeedStart: dateRange?.startDate ? new Date(dateRange?.startDate) : null,
      specialNeedEnd: dateRange?.endDate ? new Date(dateRange?.endDate) : null,
      additionalInfo,
      ...(companyId && { company: { connect: { id: companyId } } }),
      ...(departmentId && { department: { connect: { id: departmentId } } }),
      ...(roleId && { role: { connect: { id: roleId } } }),
    };

    return await prisma.user.create({ data: employeeData });
  } catch (error) {
    // console.error("Error creating employee:", error);

    if (error.code === "P2002") {
      const field = error.meta?.target?.join(", ") || "field";
      const err = new Error(`Duplicate entry on ${field}`);
      err.status = 409;
      throw err;
    }

    if (error.code === "P2025") {
      const err = new Error("Invalid department ID. Department not found.");
      err.status = 400;
      throw err;
    }

    const err = new Error("Failed to create employee");
    err.status = 500;
    throw err;
  }
};




const getAllEmployees = async () => {
  return await prisma.user.findMany({
    where: { type: 'EMPLOYEE' },
    select: {
      id: true,
      userId: true,
      name: true,
      gender: true,
      specialNeed: true,
      specialNeedStart: true,
      specialNeedEnd: true,
      email: true,
      phone: true,
      type: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      address: true,
      lat: true,
      lng: true,
      additionalInfo: true,
      role: {
        select: {
          id: true,
          name: true
        }
      }
      // Excludes company and password
    }
  });
};


const getEmployeeById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      name: true,
      gender: true,
      specialNeed: true,
      specialNeedStart: true,
      specialNeedEnd: true,
      email: true,
      phone: true,
      type: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      address: true,
      lat: true,
      lng: true,
      additionalInfo: true,
      role: {
        select: {
          id: true,
          name: true
        }
      }
      // company is excluded by not adding it
      // password is excluded by not selecting it
    }
  });
};


export const updateEmployee = async (id, data) => {
  try {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    return await prisma.user.update({
      where: { id },
      data,
      include: { role: true, company: true }
    });
  } catch (error) {
    // Handle Prisma specific errors
   
      if (error.code === "P2002") {
        // Unique constraint violation (like email already exists)
        throw {
          status: 400,
          message: `Duplicate field: ${error.meta.target.join(", ")} already exists`
        };
      } else if (error.code === "P2025") {
        // Record not found
        throw {
          status: 404,
          message: "Employee not found"
        };
      }

    // Unknown errors
    throw {
      status: 500,
      message: "Internal server error while updating employee"
    };
  }
};


const deleteEmployee = async (id) => {
  return await prisma.user.delete({ where: { id } });
};


export const bulkCreateEmployees = async (filePath) => {
  try {
    const employees = await parseExcelFile(filePath);
    const created = [];
    const failed = [];

    // Validate the parsed data is an array
    if (!Array.isArray(employees)) {
      throw new Error('Invalid file format: Expected array of employee data');
    }

    for (let i = 0; i < employees.length; i++) {
      const record = employees[i];
      console.log(`Processing row ${i + 1}:`, record);

      // Validate row structure
      if (!record || typeof record !== 'object' || Object.keys(record).length === 0) {
        failed.push({
          row: i + 1,
          userId: 'N/A',
          reason: 'Empty or invalid row data',
          field: 'multiple',
          data: record
        });
        continue;
      }

      // Zod validation
      const result = CreateUserSchema.safeParse(record);
      if (!result.success) {
        let validationErrors = [];
        
        if (result.error?.errors) {
          validationErrors = result.error.errors.map(err => {
            const field = err.path?.join('.') || 'unknown field';
            
            // Custom error messages for specific error types
            if (err.code === 'invalid_enum_value') {
              const options = err.options?.join('", "') || err.values?.join('", "') || 'available options';
              return `"${field}" must be one of: "${options}"`;
            }
            if (err.code === 'invalid_type') {
              if (err.received === 'undefined') {
                return `"${field}" is required`;
              }
              return `"${field}" must be ${err.expected}, got ${err.received}`;
            }
            if (err.code === 'invalid_string') {
              if (err.validation === 'email') {
                return `"${field}" must be a valid email address`;
              }
              return `"${field}" has invalid format`;
            }
            
            return `"${field}": ${err.message}`;
          });
        } else {
          validationErrors = [result.error?.message || 'Invalid data format'];
        }

        const firstErrorField = result.error?.errors?.[0]?.path?.[0] || 'multiple';

        failed.push({
          row: i + 1,
          userId: record.userId || 'N/A',
          reason: validationErrors.join('; '),
          field: firstErrorField,
          data: record
        });
        continue;
      }

      const validData = result.data;

      try {
        const { companyId, roleId, ...userData } = validData;
        
        if (!userData.userId) {
          throw new Error('userId is required');
        }

        const hashedPassword = await bcrypt.hash(userData.userId, SALT_ROUNDS);

        const employee = await prisma.user.create({
          data: {
            ...userData,
            password: hashedPassword,
            type: 'EMPLOYEE',
            company: { connect: { id: Number(companyId) } },
            role: roleId ? { connect: { id: Number(roleId) } } : undefined,
          },
        });

        created.push({
          row: i + 1,
          userId: employee.userId,
          message: 'Successfully created',
        });
      } catch (err) {
        let reason = 'Failed to create employee';
        let errorField = 'multiple';
        
        // Handle Prisma errors
        if (err.code === 'P2002') {
          errorField = err.meta?.target?.[0] || 'field';
          reason = `${errorField} already exists in the system`;
        } else if (err.code === 'P2025') {
          errorField = err.meta?.cause?.includes('role') ? 'roleId' : 'companyId';
          reason = `Invalid ${errorField}: related record not found`;
        } else {
          reason = err.message || reason;
        }

        failed.push({
          row: i + 1,
          userId: validData.userId || 'N/A',
          reason,
          field: errorField,
          data: record
        });
      }
    }

    return {
      message: 'Bulk upload completed',
      createdCount: created.length,
      failedCount: failed.length,
      created,
      failed,
      summary: {
        totalRows: employees.length,
        successRate: `${Math.round((created.length / employees.length) * 100)}%`,
        failedFields: [...new Set(failed.map(f => f.field))] // Unique list of failed fields
      }
    };
  } catch (err) {
    console.error('Error in bulkCreateEmployees:', err);
    throw new Error(`Failed to process file: ${err.message}`);
  }
};

const createDepartments = async ({ name, description, companyId }) => {
  try {
    console.log("this is the company id in service", companyId);

    return await prisma.department.create({
      data: {
        name,
        description,
        Company: { connect: { id: companyId } }, // ensure `Company` matches schema
      },
    });
  } catch (err) {
    if (err.code === "P2025") {
      // Company not found
      const customError = new Error(`Company with id ${companyId} not found`);
      customError.status = 404;
      throw customError;
    }

    const customError = new Error(`Failed to create department: ${err.message}`);
    customError.status = 500;
    throw customError;
  }
};

 const getCompanyDepartments= async (companyId) => {
  try {
    const departments = await prisma.department.findMany({
      where: { companyId },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      companyId: dept.companyId,
      description: dept.description,
      users: dept._count.users, // 👈 Rename _count.users to users
    }));
  } catch (err) {
    console.error('Error fetching company teams:', err);
    throw new Error('Failed to fetch company teams');
  }
};

const updateDepartments = async (id, data) => {
  try {
    return await prisma.department.update({
      where: { id },
      data,
    });
  } catch (err) {
    console.error('Error updating team:', err);
    throw new Error('Failed to update team');
  }
}



const deleteDepartments = async (id) => {
  try {
    return await prisma.department.delete({
      where: { id },
    });
  } catch (err) {
    // Check if the error is Prisma P2025 (record not found)
    if (err.code === 'P2025') {
      console.warn(`Department with id ${id} not found.`);
      return null; // or throw a custom error if you prefer
    }
    console.error('Error deleting department:', err);
    throw new Error('Failed to delete department');
  }
};


const getEmployeesByDepartments = async (teamId, isActive) => {
  try {
    return await prisma.user.findMany({
      where: {
        departmentId: teamId,
        type: 'EMPLOYEE',
        ...(isActive !== undefined && { isActive: isActive }), // Only add if provided
      },
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        address: true,
        companyId: true,
        departmentId: true,
        lat: true,
        lng: true,
        additionalInfo: true,
        specialNeed: true,
        specialNeedStart: true,
        specialNeedEnd: true,
        isActive: true,
        type: true,
        landmark: true,
        alternative_phone: true,
      },
    });
  } catch (err) {
    console.error('Error fetching employees by team:', err);
    throw new Error('Failed to fetch employees by team');
  }
};


const searchEmployees = async (query, isActive) => {
  return prisma.user.findMany({
    where: {
      AND: [
        {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { userId: { contains: query, mode: "insensitive" } },
          ],
        },
        ...(isActive !== undefined ? [{ isActive }] : []),
      ],
    },
    take: 10, // limit results to 10
    orderBy: {
      createdAt: "desc", // optional: newest employees first
    },
 
  });
};

export default {
  createEmployee,searchEmployees,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  bulkCreateEmployees
  ,createDepartments
  ,getCompanyDepartments
  ,updateDepartments
  ,deleteDepartments,
  getEmployeesByDepartments
};
