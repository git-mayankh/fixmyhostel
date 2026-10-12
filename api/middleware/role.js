function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Access denied: No role assigned' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access forbidden: Requires one of roles: [${roles.join(', ')}]` 
      });
    }

    next();
  };
}

module.exports = {
  requireRole
};
