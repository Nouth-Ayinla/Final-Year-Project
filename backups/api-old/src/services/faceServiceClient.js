const axios = require('axios');

const { env } = require('../config/env');

const faceClient = axios.create({
  baseURL: env.faceServiceBaseUrl,
  timeout: 10000,
});

async function createLivenessSession() {
  const response = await faceClient.post('/api/v1/liveness/session');
  return response.data;
}

async function getLivenessResult(sessionId) {
  const response = await faceClient.get(`/api/v1/liveness/result/${sessionId}`);
  return response.data;
}

module.exports = {
  createLivenessSession,
  getLivenessResult,
};
