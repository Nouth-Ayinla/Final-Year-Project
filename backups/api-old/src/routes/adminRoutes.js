const express = require('express');

const { AdminUser } = require('../models');
const { requireAdminAuth } = require('../middleware/requireAdminAuth');
const { requireAdminRoles } = require('../middleware/requireAdminRoles');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  generateTemporaryPassword,
  hashPassword,
  toAdminAuthPayload,
  verifyPassword,
} = require('../utils/adminAuth');
const { notImplemented } = require('../utils/notImplemented');

const router = express.Router();

router.use(requireAdminAuth);

router.get('/dashboard', notImplemented('GET /admin/dashboard'));

router.get(
  '/me',
  asyncHandler(async (req, res) => {
    return res.status(200).json({
      admin: toAdminAuthPayload(req.admin),
    });
  })
);

router.patch(
  '/me',
  asyncHandler(async (req, res) => {
    const { firstName, lastName, email, phone, twoFactorEnabled } = req.body;

    if (typeof firstName !== 'undefined') {
      req.admin.firstName = String(firstName).trim();
    }

    if (typeof lastName !== 'undefined') {
      req.admin.lastName = String(lastName).trim();
    }

    if (typeof email !== 'undefined') {
      const normalizedEmail = String(email).toLowerCase().trim();

      const existingAdmin = await AdminUser.findOne({
        email: normalizedEmail,
        _id: { $ne: req.admin._id },
      });

      if (existingAdmin) {
        return res.status(409).json({
          message: 'Another admin with this email already exists.',
        });
      }

      req.admin.email = normalizedEmail;
    }

    if (typeof phone !== 'undefined') {
      req.admin.phone = phone ? String(phone).trim() : undefined;
    }

    if (typeof twoFactorEnabled !== 'undefined') {
      req.admin.twoFactorEnabled = Boolean(twoFactorEnabled);
    }

    await req.admin.save();

    return res.status(200).json({
      message: 'Admin profile updated successfully.',
      admin: toAdminAuthPayload(req.admin),
    });
  })
);

router.get(
  '/admin-users',
  requireAdminRoles('SUPER_ADMIN', 'ELECTION_ADMIN'),
  asyncHandler(async (req, res) => {
    const { role, isActive, search } = req.query;
    const query = {};

    if (role) {
      query.role = String(role);
    }

    if (typeof isActive !== 'undefined') {
      query.isActive = String(isActive) === 'true';
    }

    if (search) {
      const searchRegex = new RegExp(String(search).trim(), 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
      ];
    }

    const adminUsers = await AdminUser.find(query)
      .populate('assignedLgas', 'name code')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      items: adminUsers.map(toAdminAuthPayload),
      total: adminUsers.length,
    });
  })
);

router.get(
  '/admin-users/:adminUserId',
  asyncHandler(async (req, res) => {
    const isElevatedReader = ['SUPER_ADMIN', 'ELECTION_ADMIN'].includes(req.admin.role);
    const isSelfRead = req.admin._id.toString() === req.params.adminUserId;

    if (!isElevatedReader && !isSelfRead) {
      return res.status(403).json({
        message: 'You do not have permission to view this admin user.',
      });
    }

    const adminUser = await AdminUser.findById(req.params.adminUserId).populate(
      'assignedLgas',
      'name code'
    );

    if (!adminUser) {
      return res.status(404).json({
        message: 'Admin user not found.',
      });
    }

    return res.status(200).json({
      admin: toAdminAuthPayload(adminUser),
    });
  })
);

router.patch(
  '/admin-users/:adminUserId/change-password',
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const isSelfUpdate = req.admin._id.toString() === req.params.adminUserId;

    if (!isSelfUpdate) {
      return res.status(403).json({
        message: 'You can only change your own password with this endpoint.',
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'currentPassword and newPassword are required.',
      });
    }

    if (String(newPassword).length < 8) {
      return res.status(400).json({
        message: 'newPassword must be at least 8 characters long.',
      });
    }

    const passwordIsValid = await verifyPassword(
      currentPassword,
      req.admin.passwordHash
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        message: 'Current password is incorrect.',
      });
    }

    req.admin.passwordHash = await hashPassword(String(newPassword));
    req.admin.passwordChangeRequired = false;
    await req.admin.save();

    return res.status(200).json({
      message: 'Password updated successfully.',
      admin: toAdminAuthPayload(req.admin),
    });
  })
);



router.post(
  '/admin-users',
  requireAdminRoles('SUPER_ADMIN'),
  asyncHandler(async (req, res) => {
    const {
      firstName,
      lastName,
      email,
      phone,
      role,
      assignedLgas = [],
      temporaryPassword,
    } = req.body;

    if (!firstName || !lastName || !email || !role) {
      return res.status(400).json({
        message: 'firstName, lastName, email, and role are required.',
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingAdmin = await AdminUser.findOne({ email: normalizedEmail });

    if (existingAdmin) {
      return res.status(409).json({
        message: 'An admin with this email already exists.',
      });
    }

    const issuedTemporaryPassword =
      typeof temporaryPassword === 'string' && temporaryPassword.trim()
        ? temporaryPassword.trim()
        : generateTemporaryPassword();

    const passwordHash = await hashPassword(issuedTemporaryPassword);

    const adminUser = await AdminUser.create({
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: normalizedEmail,
      phone: phone ? String(phone).trim() : undefined,
      role: String(role).trim(),
      assignedLgas,
      passwordHash,
      passwordChangeRequired: true,
    });

    return res.status(201).json({
      message: 'Admin user created successfully.',
      admin: toAdminAuthPayload(adminUser),
      temporaryPassword: issuedTemporaryPassword,
    });
  })
);

router.patch(
  '/admin-users/:adminUserId',
  asyncHandler(async (req, res) => {
    const {
      firstName,
      lastName,
      email,
      phone,
      role,
      assignedLgas,
      twoFactorEnabled,
      passwordChangeRequired,
    } = req.body;

    const adminUser = await AdminUser.findById(req.params.adminUserId);
    const isSuperAdmin = req.admin.role === 'SUPER_ADMIN';
    const isSelfUpdate = req.admin._id.toString() === req.params.adminUserId;

    if (!adminUser) {
      return res.status(404).json({
        message: 'Admin user not found.',
      });
    }

    if (!isSuperAdmin && !isSelfUpdate) {
      return res.status(403).json({
        message: 'You do not have permission to update this admin user.',
      });
    }

    if (typeof firstName !== 'undefined') {
      adminUser.firstName = String(firstName).trim();
    }

    if (typeof lastName !== 'undefined') {
      adminUser.lastName = String(lastName).trim();
    }

    if (typeof email !== 'undefined') {
      const normalizedEmail = String(email).toLowerCase().trim();

      const existingAdmin = await AdminUser.findOne({
        email: normalizedEmail,
        _id: { $ne: adminUser._id },
      });

      if (existingAdmin) {
        return res.status(409).json({
          message: 'Another admin with this email already exists.',
        });
      }

      adminUser.email = normalizedEmail;
    }

    if (typeof phone !== 'undefined') {
      adminUser.phone = phone ? String(phone).trim() : undefined;
    }

    if (typeof role !== 'undefined') {
      if (!isSuperAdmin) {
        return res.status(403).json({
          message: 'Only a SUPER_ADMIN can change an admin role.',
        });
      }

      adminUser.role = String(role).trim();
    }

    if (typeof assignedLgas !== 'undefined') {
      if (!isSuperAdmin) {
        return res.status(403).json({
          message: 'Only a SUPER_ADMIN can change assigned LGAs.',
        });
      }

      adminUser.assignedLgas = Array.isArray(assignedLgas) ? assignedLgas : [];
    }

    if (typeof twoFactorEnabled !== 'undefined') {
      adminUser.twoFactorEnabled = Boolean(twoFactorEnabled);
    }

    if (typeof passwordChangeRequired !== 'undefined') {
      if (!isSuperAdmin) {
        return res.status(403).json({
          message: 'Only a SUPER_ADMIN can change the password change requirement.',
        });
      }

      adminUser.passwordChangeRequired = Boolean(passwordChangeRequired);
    }

    await adminUser.save();

    return res.status(200).json({
      message: 'Admin user updated successfully.',
      admin: toAdminAuthPayload(adminUser),
    });
  })
);

router.patch(
  '/admin-users/:adminUserId/status',
  requireAdminRoles('SUPER_ADMIN'),
  asyncHandler(async (req, res) => {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        message: 'isActive must be a boolean.',
      });
    }

    const adminUser = await AdminUser.findById(req.params.adminUserId);

    if (!adminUser) {
      return res.status(404).json({
        message: 'Admin user not found.',
      });
    }

    adminUser.isActive = isActive;
    await adminUser.save();

    return res.status(200).json({
      message: isActive ? 'Admin user reactivated.' : 'Admin user deactivated.',
      admin: toAdminAuthPayload(adminUser),
    });
  })
);

router.post(
  '/admin-users/:adminUserId/reset-password',
  requireAdminRoles('SUPER_ADMIN'),
  asyncHandler(async (req, res) => {
    const adminUser = await AdminUser.findById(req.params.adminUserId);

    if (!adminUser) {
      return res.status(404).json({
        message: 'Admin user not found.',
      });
    }

    const issuedTemporaryPassword = generateTemporaryPassword();

    adminUser.passwordHash = await hashPassword(issuedTemporaryPassword);
    adminUser.passwordChangeRequired = true;
    await adminUser.save();

    return res.status(200).json({
      message: 'Admin password reset successfully.',
      admin: toAdminAuthPayload(adminUser),
      temporaryPassword: issuedTemporaryPassword,
    });
  })
);

router.get('/elections', notImplemented('GET /admin/elections'));
router.post('/elections', notImplemented('POST /admin/elections'));
router.get('/elections/:electionId', notImplemented('GET /admin/elections/:electionId'));
router.patch('/elections/:electionId', notImplemented('PATCH /admin/elections/:electionId'));
router.post('/elections/:electionId/publish', notImplemented('POST /admin/elections/:electionId/publish'));
router.post('/elections/:electionId/close', notImplemented('POST /admin/elections/:electionId/close'));

router.get('/lgas', notImplemented('GET /admin/lgas'));
router.post('/lgas', notImplemented('POST /admin/lgas'));
router.get('/wards', notImplemented('GET /admin/wards'));
router.post('/wards', notImplemented('POST /admin/wards'));
router.get('/polling-units', notImplemented('GET /admin/polling-units'));
router.post('/polling-units', notImplemented('POST /admin/polling-units'));

router.get('/parties', notImplemented('GET /admin/parties'));
router.post('/parties', notImplemented('POST /admin/parties'));
router.get('/candidates', notImplemented('GET /admin/candidates'));
router.post('/candidates', notImplemented('POST /admin/candidates'));
router.patch('/candidates/:candidateId', notImplemented('PATCH /admin/candidates/:candidateId'));

router.get('/voters', notImplemented('GET /admin/voters'));
router.post('/voters', notImplemented('POST /admin/voters'));
router.post('/voters/import', notImplemented('POST /admin/voters/import'));
router.get('/voters/:voterId', notImplemented('GET /admin/voters/:voterId'));
router.patch('/voters/:voterId', notImplemented('PATCH /admin/voters/:voterId'));
router.patch('/voters/:voterId/status', notImplemented('PATCH /admin/voters/:voterId/status'));

router.get('/results/summary', notImplemented('GET /admin/results/summary'));
router.get('/results/lgas', notImplemented('GET /admin/results/lgas'));
router.get('/audit-logs', notImplemented('GET /admin/audit-logs'));

module.exports = { adminRoutes: router };
