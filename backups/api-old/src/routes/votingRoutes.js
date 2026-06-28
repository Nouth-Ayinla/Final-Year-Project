const express = require('express');

const { notImplemented } = require('../utils/notImplemented');

const router = express.Router();

router.get('/ballot', notImplemented('GET /voting/ballot'));
router.get('/status', notImplemented('GET /voting/status'));
router.post('/cast', notImplemented('POST /voting/cast'));
router.get('/receipt/:receiptId', notImplemented('GET /voting/receipt/:receiptId'));

module.exports = { votingRoutes: router };
