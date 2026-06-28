const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { env } = require('./config/env');
const { adminRoutes } = require('./routes/adminRoutes');
const { authRoutes } = require('./routes/authRoutes');
const { biometricRoutes } = require('./routes/biometricRoutes');
const { electionRoutes } = require('./routes/electionRoutes');
const { healthRoutes } = require('./routes/healthRoutes');
const { voterRoutes } = require('./routes/voterRoutes');
const { votingRoutes } = require('./routes/votingRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(healthRoutes);
app.use(`${env.apiPrefix}/auth`, authRoutes);
app.use(`${env.apiPrefix}/voters`, voterRoutes);
app.use(`${env.apiPrefix}/biometrics`, biometricRoutes);
app.use(`${env.apiPrefix}/elections`, electionRoutes);
app.use(`${env.apiPrefix}/voting`, votingRoutes);
app.use(`${env.apiPrefix}/admin`, adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
  });
});

app.use((error, req, res, next) => {
  const status = error.response?.status || 500;
  const details = error.response?.data || error.message;

  res.status(status).json({
    message: 'Request failed',
    details,
  });
});

module.exports = { app };
