import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

import { parseExcelFile } from './user.utility.js';
import { CreateUserSchema } from './user.schema.js';
const prisma = new PrismaClient();


const SALT_ROUNDS = 10;

const createEmployee = async (data ,companyId) => {
  try {
    const {  userId,  roleId, additionalInfo, ...userDetails} = data;

    const password = await bcrypt.hash(userId, SALT_ROUNDS);

    const employeeData = {
      ...userDetails,
      userId,
      password,
      type: 'EMPLOYEE',
      additionalInfo: additionalInfo,
      ...(companyId && { company: { connect: { id: companyId } } }),
      ...(roleId && { role: { connect: { id: roleId } } }),
    };

    return await prisma.user.create({ data: employeeData });

  } catch (error) {
    console.error('Error creating employee:', error);

    if (error.code === 'P2002') {
      const field = error.meta?.target?.join(', ') || 'field';
      const err = new Error(`Duplicate entry on ${field}`);
      err.status = 409;
      throw err;
    }

    const err = new Error('Failed to create employee');
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


const updateEmployee = async (id, data) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  return await prisma.user.update({
    where: { id },
    data,
    include: { role: true, company: true }
  });
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
export default {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  bulkCreateEmployees
};
