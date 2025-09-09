import * as rolePermissionService from './rolePermission.service.js';

// Create RolePermission

export const createRoleWithPermissions = async (req, res) => {
  try {
    const { name, isAssignable, isSystemLevel, permissions } = req.body;
const {companyId}=req.user
    if (!name ) {
      return res.status(400).json({ message: "name and companyId are required" });
    }

    // permissions should be an array of { moduleKey, canRead, canWrite, canDelete }
    const role = await rolePermissionService.createRoleWithPermissions({
      name,
      companyId,
      isAssignable: isAssignable ?? true,
      isSystemLevel: isSystemLevel ?? false,
      permissions: permissions || [],
    });

    return res.status(201).json({
      message: "Role created successfully with permissions",
      role,
    });
  } catch (err) {
    console.error("Create Role error:", err);
    return res.status(500).json({ message: err.message || "Something went wrong" });
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
  

  export const updateRolePermissionsController = async (req, res) => {
    try {
      const { roleId } = req.params; 
      const { permissions } = req.body;
  
      if (!permissions) {
        return res.status(400).json({ 
          success: false,
          message: "permissions is required" 
        });
      }
  
      const updated = await rolePermissionService.updateRolePermissions(
        parseInt(roleId, 10),
        permissions
      );
  
      return res.json({
        success: true,
        message: "Role permissions updated successfully",
        roleId: parseInt(roleId, 10),
        permissions: updated
      });
    } catch (err) {
      console.error("Update RolePermissions error:", err);
      return res.status(500).json({ 
        success: false,
        message: err.message || "Something went wrong" 
      });
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
