const express = require('express');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ondo-voting-api',
  });
});

module.exports = { healthRoutes: router };
