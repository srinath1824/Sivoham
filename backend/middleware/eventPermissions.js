// Middleware to check event permissions
const checkEventPermission = (requiredPermission) => {
  return (req, res, next) => {
    // Super admin has all permissions
    if (req.user.isSuperAdmin) {
      return next();
    }
    
    // Check if user has the required event permission
    if (!req.user.eventPermissions || !req.user.eventPermissions[requiredPermission]) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

module.exports = { checkEventPermission };