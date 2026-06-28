/**
 * Axios HTTP client configured for the Votosi backend.
 *
 * Auth strategy:
 * - Backend sets JWT as an httpOnly cookie on login/activation.
 * - We also extract the raw token value from the set-cookie header and
 *   store it in SecureStore so we can attach it as Authorization: Bearer
 *   on subsequent requests — necessary because React Native doesn't
 *   automatically send cookies cross-request the way a browser does.
 */
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/Api';

const TOKEN_KEY = 'votosi_jwt';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor ────────────────────────────────────────────────────
// Attach stored token as both Cookie header and Authorization header so
// the backend's protectRoute (which reads req.cookies.jwt) finds it.
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Also send as cookie so cookie-parser on the backend picks it up
      config.headers.Cookie = `jwt=${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ───────────────────────────────────────────────────
// Extract the JWT from set-cookie and persist it in SecureStore.
apiClient.interceptors.response.use(
  async (response) => {
    const setCookie = response.headers['set-cookie'] as any;
    if (setCookie) {
      const cookieStr = Array.isArray(setCookie)
        ? setCookie.find((c: string) => c.startsWith('jwt='))
        : typeof setCookie === 'string' && setCookie.startsWith('jwt=')
          ? setCookie
          : undefined;

      if (cookieStr) {
        const token = cookieStr.split('jwt=')[1]?.split(';')[0];
        if (token) {
          await SecureStore.setItemAsync(TOKEN_KEY, token);
        }
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

export { apiClient, TOKEN_KEY };
