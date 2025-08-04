import userService from './user.service.js';

export const createEmployee = async (req, res) => {
  
  try {
    const {companyId} = req.user;
    const newEmployee = await userService.createEmployee(req.body ,companyId);
    if (!newEmployee) {
      return res.status(400).json({ message: 'Failed to create employee' });
    }
    return res.status(201).json({  message: 'Employee created successfully',});
    

  } catch (err) {
    console.error('Create employee error:', err);

    return res.status(err.status || 500).json({
      message: err.message || 'Something went wrong',
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
    return res.json(updatedEmployee);
  } catch (err) {
    console.error('Update employee error:', err);
    return res.status(err.status || 500).json({ message: err.message || 'Failed to update employee' });
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
    console.log("create team invoked", req.body);
    
    const { name, description } = req.body;
    const { companyId } = req.user;
    if (!name ) {
      return res.status(400).json({ message: 'Name filed is  required' });
    }
    const newTeam = await userService.createDepartments({ name, description, companyId });
    return res.status(201).json({
      message: 'Team created successfully',
      team: newTeam,
    });
  } catch (err) {
    console.error('Create team error:', err);
    return res.status(err.status || 500).json({
      message: err.message || 'Failed to create team',
    });
  }
}

export  const getCompanyDepartments = async (req, res) => {
  try {
    const { companyId } = req.user;
    const teams = await userService.getCompanyDepartments(companyId);
    if (!teams || teams.length === 0) {
      return res.status(404).json({ message: 'No teams found in company ' , departments: []});  
    }
    return res.json(teams);
  } catch (err) {
    console.error('Get company teams error:', err);
    return res.status(500).json({ message: 'Failed to get company teams' });
  }
}

export const updateDepartments = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10); // Convert string to number
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    const updatedTeam = await userService.updateTeam(id, { name, description });

    return res.json({
      message: 'Team updated successfully',
      team: updatedTeam,
    });
  } catch (err) {
    console.error('Update team error:', err);
    return res.status(err.status || 500).json({
      message: err.message || 'Failed to update team',
    });
  }
};

export const deleteDepartments = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10); // Convert string to number
    await userService.deleteDepartments(id);
    return res.status(204).send();
  } catch (err) {
    console.error('Delete team error:', err);
    return res.status(err.status || 500).json({
      message: err.message || 'Failed to delete team',
    });
  }
}

export const getEmployeesByDepartments= async (req, res) => {
  try {
    console.log(" ths employe by team  invoked");
    
    const teamId = parseInt(req.params.id, 10); // Convert string to number
    const employees = await userService.getEmployeesByTeam(teamId);

    if (!employees || employees.length === 0) {
      return res.status(404).json({ message: 'No employees found for this team' , employees: []});  
    }

    return res.json(employees);
  } catch (err) {
    console.error('Get employees by team error:', err);
    return res.status(500).json({ message: 'Failed to get employees for the team' });
  }
}