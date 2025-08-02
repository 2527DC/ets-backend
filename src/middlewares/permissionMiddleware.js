export const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
      if (!req.user?.permissions?.includes(requiredPermission)) {
        return res.status(403).json({ message: 'Forbidden: No permission' });
      }
      next();
    };
  };
  