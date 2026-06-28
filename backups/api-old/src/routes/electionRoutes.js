const express = require('express');

const { notImplemented } = require('../utils/notImplemented');

const router = express.Router();

router.get('/active', notImplemented('GET /elections/active'));

module.exports = { electionRoutes: router };
