const express = require('express');

const { notImplemented } = require('../utils/notImplemented');

const router = express.Router();

router.get('/me', notImplemented('GET /voters/me'));
router.get('/me/eligibility', notImplemented('GET /voters/me/eligibility'));

module.exports = { voterRoutes: router };
