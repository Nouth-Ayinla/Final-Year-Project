const express = require('express');

const {
  createLivenessSession,
  getLivenessResult,
} = require('../services/faceServiceClient');
const { notImplemented } = require('../utils/notImplemented');

const router = express.Router();

router.post('/liveness/session', async (req, res, next) => {
  try {
    const session = await createLivenessSession();
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});

router.get('/liveness/:sessionId', async (req, res, next) => {
  try {
    const result = await getLivenessResult(req.params.sessionId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/enroll', notImplemented('POST /biometrics/enroll'));
router.post('/verify', notImplemented('POST /biometrics/verify'));

module.exports = { biometricRoutes: router };
