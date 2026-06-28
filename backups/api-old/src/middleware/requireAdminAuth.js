const jwt = require('jsonwebtoken');

const { env } = require('../config/env');
const { AdminUser } = require('../models');

async function requireAdminAuth(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Admin authentication required.',
    });
  }

  const token = authorization.slice('Bearer '.length).trim();

  try {
    const payload = jwt.verify(token, env.jwtSecret);

    if (payload.type !== 'admin_access') {
      return res.status(401).json({
        message: 'Invalid admin token type.',
      });
    }

    const adminUser = await AdminUser.findById(payload.sub);

    if (!adminUser) {
      return res.status(401).json({
        message: 'Admin user for this token no longer exists.',
      });
    }

    if (!adminUser.isActive) {
      return res.status(403).json({
        message: 'This admin account has been deactivated.',
      });
    }

    req.admin = adminUser;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired admin token.',
    });
  }
}

module.exports = { requireAdminAuth };
