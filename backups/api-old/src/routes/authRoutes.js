const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { env } = require('../config/env');
const { AdminUser } = require('../models');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  hashPassword,
  signAdminAccessToken,
  toAdminAuthPayload,
  verifyPassword,
} = require('../utils/adminAuth');
const { notImplemented } = require('../utils/notImplemented');

const router = express.Router();

function parseName(fullName = '') {
	const trimmed = fullName.trim();
	if (!trimmed) {
		return { firstName: '', lastName: '' };
	}

	const parts = trimmed.split(/\s+/);
	const firstName = parts.shift() || '';
	const lastName = parts.join(' ') || firstName;

	return { firstName, lastName };
}

function signAccessToken(adminUser) {
	return jwt.sign(
		{
			sub: adminUser._id.toString(),
			role: adminUser.role,
			email: adminUser.email,
		},
		env.jwtSecret,
		{ expiresIn: env.accessTokenTtl }
	);
}

// Local signup endpoint
router.post('/admin/signup', asyncHandler(async (req, res) => {
	const { email, password, fullName, phoneNumber } = req.body || {};

	if (!email || !password || !fullName) {
		return res.status(400).json({
			message: 'email, password, and fullName are required.',
		});
	}

	if (password.length < 8) {
		return res.status(400).json({
			message: 'Password must be at least 8 characters.',
		});
	}

	const normalizedEmail = String(email).trim().toLowerCase();
	const existingUser = await AdminUser.findOne({ email: normalizedEmail }).lean();
	if (existingUser) {
		return res.status(409).json({ message: 'Admin account already exists.' });
	}

	const { firstName, lastName } = parseName(fullName);
	if (!firstName || !lastName) {
		return res.status(400).json({ message: 'Please provide a valid full name.' });
	}

	const passwordHash = await hashPassword(String(password));

	const adminUser = await AdminUser.create({
		firstName,
		lastName,
		email: normalizedEmail,
		phone: phoneNumber,
		passwordHash,
		role: 'SUPER_ADMIN',
		lastLoginAt: new Date(),
	});

	const accessToken = signAccessToken(adminUser);

	return res.status(201).json({
		accessToken,
		user: {
			id: adminUser._id,
			email: adminUser.email,
			fullName: `${adminUser.firstName} ${adminUser.lastName}`.trim(),
			role: adminUser.role,
		},
	});
}));

// Local signin endpoint
router.post('/admin/signin', asyncHandler(async (req, res) => {
	const { email, password } = req.body || {};

	if (!email || !password) {
		return res.status(400).json({ message: 'email and password are required.' });
	}

	const normalizedEmail = String(email).trim().toLowerCase();
	const adminUser = await AdminUser.findOne({ email: normalizedEmail });

	if (!adminUser || !adminUser.isActive) {
		return res.status(401).json({ message: 'Invalid email or password.' });
	}

	const isPasswordValid = await verifyPassword(String(password), adminUser.passwordHash);
	if (!isPasswordValid) {
		return res.status(401).json({ message: 'Invalid email or password.' });
	}

	adminUser.lastLoginAt = new Date();
	await adminUser.save();

	const accessToken = signAccessToken(adminUser);

	return res.json({
		accessToken,
		user: {
			id: adminUser._id,
			email: adminUser.email,
			fullName: `${adminUser.firstName} ${adminUser.lastName}`.trim(),
			role: adminUser.role,
		},
	});
}));

// Remote login endpoint
router.post(
  '/admin/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }

    const adminUser = await AdminUser.findOne({
      email: String(email).toLowerCase().trim(),
    });

    if (!adminUser) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    if (!adminUser.isActive) {
      return res.status(403).json({
        message: 'This admin account has been deactivated.',
      });
    }

    const passwordIsValid = await verifyPassword(password, adminUser.passwordHash);

    if (!passwordIsValid) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    adminUser.lastLoginAt = new Date();
    await adminUser.save();

    return res.status(200).json({
      message: 'Admin login successful.',
      accessToken: signAdminAccessToken(adminUser),
      admin: toAdminAuthPayload(adminUser),
    });
  })
);

// Remote reset password with temp endpoint
router.patch(
  '/admin/reset-password-with-temp',
  asyncHandler(async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email  || !newPassword) {
      return res.status(400).json({
        message: 'email, newPassword are required.',
      });
    }

    if (String(newPassword).length < 8) {
      return res.status(400).json({
        message: 'newPassword must be at least 8 characters long.',
      });
    }

    const adminUser = await AdminUser.findOne({
      email: String(email).toLowerCase().trim(),
    });

    if (!adminUser) {
      return res.status(404).json({
        message: 'Admin user not found.',
      });
    }

    if (!adminUser.isActive) {
      return res.status(403).json({
        message: 'This admin account has been deactivated.',
      });
    }

    adminUser.passwordHash = await hashPassword(String(newPassword));
    adminUser.passwordChangeRequired = false;
    await adminUser.save();

    return res.status(200).json({
      message: 'Password reset successful. You can now log in with your new password.',
      admin: toAdminAuthPayload(adminUser),
    });
  })
);

router.post('/request-otp', notImplemented('POST /auth/request-otp'));
router.post('/verify-otp', notImplemented('POST /auth/verify-otp'));
router.post('/refresh', notImplemented('POST /auth/refresh'));
router.post('/logout', notImplemented('POST /auth/logout'));

module.exports = { authRoutes: router };
