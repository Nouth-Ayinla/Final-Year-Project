const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { env } = require('../config/env');

async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

function generateTemporaryPassword(length = 14) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let password = '';

  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    password += alphabet[randomIndex];
  }

  return password;
}

function signAdminAccessToken(adminUser) {
  return jwt.sign(
    {
      sub: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
      type: 'admin_access',
    },
    env.jwtSecret,
    {
      expiresIn: env.adminAccessTokenTtl,
    }
  );
}

function toAdminAuthPayload(adminUser) {
  return {
    id: adminUser._id.toString(),
    firstName: adminUser.firstName,
    lastName: adminUser.lastName,
    email: adminUser.email,
    phone: adminUser.phone,
    role: adminUser.role,
    assignedLgas: adminUser.assignedLgas,
    isActive: adminUser.isActive,
    twoFactorEnabled: adminUser.twoFactorEnabled,
    passwordChangeRequired: adminUser.passwordChangeRequired,
    lastLoginAt: adminUser.lastLoginAt,
  };
}

module.exports = {
  generateTemporaryPassword,
  hashPassword,
  signAdminAccessToken,
  toAdminAuthPayload,
  verifyPassword,
};
