import userService from './user.service.js';

export const createEmployee = async (req, res) => {
  try {
    const { companyId } = req.user;
    const newEmployee = await userService.createEmployee(req.body, companyId);

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: newEmployee,
    });
  } catch (err) {
    // console.error("Create employee error:", err);

    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};


export const getAllEmployees = async (req, res) => {
  try {
    const employees = await userService.getAllEmployees();
    return res.json(employees);
  } catch (err) {
    console.error('Get employees error:', err);
    return res.status(500).json({ message: 'Failed to get employees' });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const employee = await userService.getEmployeeById(id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    return res.json(employee);
  } catch (err) {
    console.error('Get employee by ID error:', err);
    return res.status(500).json({ message: 'Failed to get employee' });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updatedEmployee = await userService.updateEmployee(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee
    });
  } catch (err) {
    console.error("Update employee error:", err);

    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Failed to update employee"
    });
  }
};


export const deleteEmployee = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await userService.deleteEmployee(id);
    return res.status(204).send();
  } catch (err) {
    console.error('Delete employee error:', err);
    return res.status(500).json({ message: 'Failed to delete employee' });
  }
};


export const uploadEmployees = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No file uploaded',
        details: 'Please upload an Excel file with employee data'
      });
    }

    const result = await userService.bulkCreateEmployees(req.file.path);

    return res.status(200).json({
      message: result.message,
      summary: {
        total: result.createdCount + result.failedCount,
        created: result.createdCount,
        failed: result.failedCount,
      },
      details: {
        created: result.created,
        failed: result.failed,
      },
    });
  } catch (err) {
    console.error('Bulk upload error:', err);
    return res.status(500).json({ 
      message: 'Bulk upload failed',
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
};

export const createDepartments = async (req, res) => {
  try {
    console.log("create team invoked");

    const { name, description } = req.body;
    const { companyId } = req.user; // comes from auth

    if (!name) {
      return res.status(400).json({
        status: "fail",
        message: "Name field is required",
      });
    }

    const newTeam = await userService.createDepartments({
      name,
      description,
      companyId,
    });

    return res.status(201).json({
      status: "success",
      message: "Team created successfully",
      data: newTeam,
    });
  } catch (err) {
    console.error("Create team error:", err);

    return res.status(err.status || 500).json({
      status: "error",
      message: err.message || "Failed to create team",
    });
  }
};


export const getCompanyDepartments = async (req, res) => {
  try {
    const { companyId } = req.user;
    const departments = await userService.getCompanyDepartments(companyId);
    
    if (!departments || departments.length === 0) {
      return res.status(200).json({
        success: true,
        departments: [],
        message: 'No departments found in company'
      });  
    }
    
    return res.json({
      success:true,
      departments: departments,
      message: 'Departments retrieved successfully'
    });
  } catch (err) {
    console.error('Get company departments error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to get company departments',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
}

export const updateDepartments = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required',
      });
    }

    const userEmail = req.user?.email;
    const updatedTeam = await userService.updateDepartments(id, { name, description }, userEmail);

    return res.json({
      success: true,
      message: 'Team updated successfully',
      team: updatedTeam,
    });
  } catch (err) {
    console.error('Update team error:', err);
    return res.status(err.status || 500).json({
      success: false,
        message: err.message || 'Failed to update team',
    });
  }
};

export const deleteDepartments = async (req, res) => {
  try {
    const userEmail =req.user.email
    const id = parseInt(req.params.id, 10); // Convert string to number
    const deletedDepartment = await userService.deleteDepartments(id,userEmail);

    if (!deletedDepartment) {
      return res.status(404).json({
        success: false,
        message: `Department  not found to Delete .`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Department deleted successfully.',
      data: {
        id: deletedDepartment.id,
        name: deletedDepartment.name, // optional, depends on what you want to return
      },
    });
  } catch (err) {
    console.error('Delete department error:', err);
    return res.status(err.status || 500).json({
      status: 'error',
      message: err.message || 'Failed to delete department',
    });
  }
};


export const getEmployeesByDepartments = async (req, res) => {
  try {

    const teamId = parseInt(req.params.id, 10);
    const { isActive} = req.query; 

    // Convert isActive to boolean if provided
    const activeFilter = isActive !== undefined ? isActive === "true" : undefined;

    const employees = await userService.getEmployeesByDepartments(teamId, activeFilter);

    return res.status(200).json({
      message: employees.length > 0 
        ? 'Employees fetched successfully' 
        : 'No employees found for this team',
        departmentId: teamId,
      employees,
    });
  } catch (err) {
    console.error('Get employees by team error:', err);
    return res.status(500).json({ message: 'Failed to get employees for the team' });
  }
};



export const searchEmployees = async (req, res) => {
  try {
    const { q, isActive } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Search query (q) is required" });
    }

    const {companyId}=req.user

    const employees = await userService.searchEmployees(
      q,
      isActive !== undefined ? isActive === "true" : undefined ,companyId
    );

    // Format the response
    const formattedEmployees = employees.map(emp => ({
      id: emp.userId,
      employeeCode: emp.userId,
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      alternativePhone: emp.alternativePhone,
      gender: emp.gender,
      type: emp.type,
      isActive: emp.isActive,
      address: {
        landmark: emp.landmark,
        address: emp.address,
        lat: emp.lat,
        lng: emp.lng,
      },
      departmentId: emp.departmentId,
      companyId: emp.companyId,
      specialNeed: emp.specialNeed,
      specialNeedPeriod: emp.specialNeedStart && emp.specialNeedEnd
        ? {
            start: emp.specialNeedStart,
            end: emp.specialNeedEnd,
          }
        : null,
      additionalInfo: emp.additionalInfo || {},
      createdAt: emp.createdAt,
      updatedAt: emp.updatedAt,
    }));

    res.json({
      success: true,
      total: formattedEmployees.length,
      employees: formattedEmployees,
    });

  } catch (error) {
    console.error("Error searching employees:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};





export const toggleIsActiveStatusController = async (req, res) => {
  try {
    const { userId } = req.params;       // e.g. EMP001
    const { isActive } = req.query;      // "true" / "false"

    if (!userId || isActive === undefined) {
      return res.status(400).json({ success: false, error: "userId and isActive are required" });
    }

    // Convert string to boolean
    const isActiveBool = isActive === "true";

    const updatedUser = await userService.toggleIsActiveStatusService({
      userId,
      status: isActiveBool,
    });

    // 🧹 Remove sensitive fields
    const { password, ...safeUser } = updatedUser;

    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      user: safeUser,
    });
  } catch (error) {

    // Check if service sent a specific statusCode
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || "Failed to update user status",
    });
  }
};



