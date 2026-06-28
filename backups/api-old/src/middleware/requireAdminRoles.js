function requireAdminRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        message: 'Admin authentication required.',
      });
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action.',
      });
    }

    return next();
  };
}

module.exports = { requireAdminRoles };
