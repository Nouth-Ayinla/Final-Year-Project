const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ondo_voting',
  faceServiceBaseUrl: process.env.FACE_SERVICE_BASE_URL || 'http://localhost:8000',
  jwtSecret: process.env.JWT_SECRET || 'replace-me',
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || '7d',
  adminAccessTokenTtl: process.env.ADMIN_ACCESS_TOKEN_TTL || '8h',
};

module.exports = { env };
