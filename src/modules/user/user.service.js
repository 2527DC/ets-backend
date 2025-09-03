import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

import { parseExcelFile } from './user.utility.js';
import { CreateUserSchema } from './user.schema.js';
import { parsePrismaNotFoundError } from '../../utils/prismaErrorParser.js';
const prisma = new PrismaClient();


const SALT_ROUNDS = 10;

const createEmployee = async (data, companyId) => {
  try {
    const { userId, departmentId, alternate_mobile_number, roleId, additionalInfo, specialNeed, specialNeedStart, specialNeedEnd, ...userDetails } = data;

    // Validate special need fields
    if (specialNeed === null || specialNeed === 'NONE' || !specialNeed) {
      // If specialNeed is null, 'NONE', or not provided, ignore start/end dates
      userDetails.specialNeed = null;
      userDetails.specialNeedStart = null;
      userDetails.specialNeedEnd = null;
    } else if (specialNeed && (!specialNeedStart || !specialNeedEnd)) {
      // If specialNeed is provided but dates are missing
      const err = new Error("specialNeedStart and specialNeedEnd are required when specialNeed is provided");
      err.status = 400;
      throw err;
    } else {
      // If specialNeed is provided with dates, process them
      userDetails.specialNeed = specialNeed;
      userDetails.specialNeedStart = specialNeedStart ? new Date(specialNeedStart) : null;
      userDetails.specialNeedEnd = specialNeedEnd ? new Date(specialNeedEnd) : null;
    }

    const password = await bcrypt.hash(userId, SALT_ROUNDS);

    const employeeData = {
      ...userDetails,
      userId,
      alternative_phone: alternate_mobile_number,
      password,
      type: 'EMPLOYEE',
      additionalInfo,
      ...(companyId && { company: { connect: { id: companyId } } }),
      ...(departmentId && { department: { connect: { id: departmentId } } }),
      ...(roleId && { role: { connect: { id: roleId } } }),
    };

    return await prisma.user.create({ data: employeeData });
  } catch (error) {
    
    if (error.code === "P2002") {
      const field = error.meta?.target?.join(", ") || "field";
      const err = new Error(`Duplicate entry on ${field}`);
      err.status = 409;
      throw err;
    }
    if (error.code === "P2025") {
      throw parsePrismaNotFoundError(error);
    }

    // If it's already a custom error with status, rethrow it
    if (error.status) {
      throw error;
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
    if (error.message.includes("special_need_dates_check")) {
      throw { status:409 ,message:"Special need requires valid start and end dates."};
    }
      if (error.code === "P2002") {
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
        company: { connect: { id: companyId } }, // ensure `Company` matches schema
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

const getCompanyDepartments = async (companyId) => {
  try {
    const departments = await prisma.department.findMany({
      where: { companyId },
      include: {
        _count: {
          select: {
            users: true, // Total users
            users: {
              where: {
                isActive: true
              }
            },
          },
        },
      },
    });

    return departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      companyId: dept.companyId,
      description: dept.description,
      totalUsers: dept._count.users, // Total count
      activeUsers: dept._count.users, // Active count (this might need adjustment based on Prisma's count structure)
      inactiveUsers: dept._count.users - dept._count.users, // Calculate inactive
    }));
  } catch (err) {
    console.error('Error fetching company teams:', err);
    throw new Error('Failed to fetch company teams');
  }
};

const updateDepartments = async (id, data, userEmail) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Set current user for the trigger
      await tx.$executeRawUnsafe(`SET LOCAL "app.current_user" = '${userEmail}'`);

      // Perform the update
      return await tx.department.update({
        where: { id },
        data,
      });
    });

    return result;
  } catch (err) {
    if (err.code === 'P2025') {
      const notFoundError = new Error(`Department  not found`);
      notFoundError.status = 404; // attach status code
      throw notFoundError;
    }

    console.error('Error updating department:', err);
    const serverError = new Error('Failed to update department');
    serverError.status = 500;
    throw serverError;
  }
};



const deleteDepartments = async (id, userEmail) => {
  try {
    return await prisma.$transaction(async (tx) => {
      // Set current user for the trigger
      await tx.$executeRawUnsafe(`SET LOCAL "app.current_user" = '${userEmail}'`);

      // Perform delete
      return await tx.department.delete({
        where: { id },
      });
    });
  } catch (err) {
    if (err.code === 'P2025') {
      console.warn(`Department with id ${id} not found.`);
      return null;
    }
    console.error('Error deleting department:', err);
    throw new Error('Failed to delete department');
  }
};



const getEmployeesByDepartments = async (teamId, isActive) => {
  try {
    // Fetch employees + their direct weekoff
    const employees = await prisma.user.findMany({
      where: {
        departmentId: teamId,
        type: 'EMPLOYEE',
        ...(isActive !== undefined && { isActive: isActive }),
      },
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        role: { select: { id: true, name: true } },
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

        // ✅ Direct relation to WeekOff
        weekOff: {
          select: {
            id: true,
            daysOfWeek: true,
            userId: true,
            departmentId: true,
          },
        },
      },
    });

    // Fetch department-level weekoff once
    const departmentWeekOff = await prisma.weekOff.findUnique({
      where: { departmentId: teamId },
      select: { id: true, daysOfWeek: true, departmentId: true },
    });

    // Fetch company-level weekoff once (assume all users belong to same company)
    const companyId = employees[0]?.companyId;
    let companyWeekOff = null;
    if (companyId) {
      companyWeekOff = await  prisma.weekOff.findFirst({
        where: { companyId: 1 },
        select: {
          id: true,
          daysOfWeek: true,
          departmentId: true,
        },
      });
      
    }

    // Apply fallback logic for each employee
    const employeesWithWeekOff = employees.map(emp => {
      let finalWeekOff = null;

      if (emp.weekOff && emp.weekOff.daysOfWeek?.length > 0) {
        // ✅ User-level weekoff
        finalWeekOff = emp.weekOff.daysOfWeek;
      } else if (departmentWeekOff && departmentWeekOff.daysOfWeek?.length > 0) {
        // ✅ Department-level weekoff
        finalWeekOff = departmentWeekOff.daysOfWeek;
      } else if (companyWeekOff && companyWeekOff.daysOfWeek?.length > 0) {
        // ✅ Company-level weekoff
        finalWeekOff = companyWeekOff.daysOfWeek;
      }
      const { weekOff, ...rest } = emp;
      return {
        ...rest,
        finalWeekOff, // 👈 This is the resolved weekoff
      };
    });

    return employeesWithWeekOff;
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
