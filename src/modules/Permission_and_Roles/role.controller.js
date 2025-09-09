import * as roleService from './role.service.js';

// Create a new role
export const createRole = async (req, res) => {
  try {
    const { name } = req.body;
    const {companyId} = req.user;
    const role = await roleService.createRole({ name, companyId });
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create role' });
  }
};

// Get all roles
export const getAllRoles = async (req, res) => {
  
  try {

    const {companyId} = req.user;
    const roles = await roleService.getAllRoles(companyId);
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


// controllers/roleController.js

export const getRoleUsers = async (req, res) => {
  try {
    const { roleId } = req.params;

    const users = await roleService.getRoleUsers(parseInt(roleId, 10));

    return res.json({
      success: true,
      roleId,
      total: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching role users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch role users",
      error: error.message,
    });
  }
};


export const assignUsersToRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userIds array is required",
      });
    }

    const updatedUsers = await roleService.assignUsersToRole(
      parseInt(roleId, 10),
      userIds
    );

    return res.json({
      success: true,
      message: "Users assigned to role successfully",
      totalAssigned: updatedUsers.length,
      users: updatedUsers,
    });
  } catch (error) {
    console.error("Error assigning users to role:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign users to role",
      error: error.message,
    });
  }
};
