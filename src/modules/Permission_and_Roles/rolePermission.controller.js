import * as rolePermissionService from './rolePermission.service.js';

// Create RolePermission

export const createRolePermission = async (req, res) => {
  try {
    const { roleId, moduleId, canRead, canWrite, canDelete } = req.body;

    if (!roleId || !moduleId) {
      return res.status(400).json({ message: 'roleId and moduleId are required' });
    }

    const permissions = await rolePermissionService.createRolePermissionWithChildren({
      roleId,
      moduleId,
      canRead: !!canRead,
      canWrite: !!canWrite,
      canDelete: !!canDelete
    });

    return res.status(201).json({
      message: 'Role permissions created successfully',
      created: permissions
    });
  } catch (err) {
    console.error('Create RolePermission error:', err);
    return res.status(500).json({ message: err.message || 'Something went wrong' });
  }
};


// Get all RolePermissions
export const getAllRolePermissions = async (req, res) => {
  try {
    const permissions = await rolePermissionService.getAllRolePermissions();
    return res.json(permissions);
  } catch (err) {
    console.error('Get all RolePermissions error:', err);
    return res.status(500).json({ message: err.message || 'Something went wrong' });
  }
};
export const getRolePermissionsByRoleId = async (req, res) => {
    try {
      const { roleId } = req.params;
  
      if (!roleId) {
        return res.status(400).json({ message: 'Missing roleId parameter' });
      }
  
      const permissions = await rolePermissionService.getRolePermissionsByRoleId(Number(roleId));
  
      return res.json(permissions);
    } catch (err) {
      console.error('Get RolePermissions by roleId error:', err);
      return res.status(500).json({ message: err.message || 'Something went wrong' });
    }
  };
  

// Update RolePermission by ID
export const updateRolePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updatedPermission = await rolePermissionService.updateRolePermission(parseInt(id, 10), data);
    return res.json(updatedPermission);
  } catch (err) {
    console.error('Update RolePermission error:', err);
    return res.status(500).json({ message: err.message || 'Something went wrong' });
  }
};

// Delete RolePermission by ID
export const deleteRolePermission = async (req, res) => {
  try {
    const { id } = req.params;

    await rolePermissionService.deleteRolePermission(parseInt(id, 10));
    return res.json({ message: 'RolePermission deleted successfully' });
  } catch (err) {
    console.error('Delete RolePermission error:', err);
    return res.status(500).json({ message: err.message || 'Something went wrong' });
  }
};


export const getUserPermissions = async (req, res) => {
  try {
 
     const {companyId ,roleId} = req.user
    const role = await rolePermissionService.getPermissionsFromToken(companyId,roleId);

    if (!role) {
      return res.status(404).json({ message: 'No permissions found for this role'  });
    }
    return res.json({ allowedModules :role});

  } catch (err) {
    console.error('❌ getUserPermissions controller error:', err);
    return res.status(500).json({ message: err.message || 'Failed to get user permissions' });
  }
};
