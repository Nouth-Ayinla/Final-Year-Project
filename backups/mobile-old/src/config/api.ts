export const API_BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/health`,
  enroll: `${API_BASE_URL}/api/v1/face/enroll`,
  verify: `${API_BASE_URL}/api/v1/face/verify`,
  livenessSession: `${API_BASE_URL}/api/v1/liveness/session`,
  livenessResult: `${API_BASE_URL}/api/v1/liveness/result`,
};
