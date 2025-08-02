import * as roleService from './role.service.js';

// Create a new role
export const createRole = async (req, res) => {
  try {
    const { name } = req.body;
    const companyId = req.companyId;
    const role = await roleService.createRole({ name, companyId });
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create role' });
  }
};

// Get all roles
export const getAllRoles = async (req, res) => {
  
  try {
    const roles = await roleService.getAllRoles();
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to get roles' });
  }
};

export const getCompanyRoles = async (req, res) => {

  try {
    const {companyId} = req.user;

    const roles = await roleService.getCompanyRoles(companyId);
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to get roles' });
  }
};
// Get role by ID
export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await roleService.getRoleById(Number(id));
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ error: 'Failed to get role' });
  }
};

// Update role
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRole = await roleService.updateRole(Number(id), req.body);
    res.json(updatedRole);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
};

// Delete role
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    await roleService.deleteRole(Number(id));
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
};
