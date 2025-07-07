import userService from './user.service.js';

export const createEmployee = async (req, res) => {
  try {
    const { name, email, password, phone, companyId, roleId } = req.body;

    if (!name || !email || !password || !companyId || !roleId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newEmployee = await userService.createEmployee({
      name, email, password, phone, companyId, roleId
    });

    return res.status(201).json(newEmployee);
  } catch (err) {
    console.error('Create employee error:', err);
    return res.status(err.status || 500).json({ message: err.message || 'Something went wrong' });
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
