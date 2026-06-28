/**
 * Auth API service — maps to existing backend voter endpoints.
 * Backend is NOT modified; these match the existing contract exactly.
 */
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/constants/Api';

export interface VoterData {
  id: string;
  email: string;
  voterId: string;
  firstName?: string;
  surname?: string;
  otherName?: string;
  profilePicture?: string;
  DOB?: string;
  sex?: string;
  maritalStatus?: string;
  state?: string;
  LGA?: string;
  education?: string;
  residentialAddress?: string;
  isActivated?: boolean;
}

export interface LoginPayload {
  identifier: string; // email OR voterId
  password: string;
}

export interface ActivatePayload {
  voterId: string;
  activationPin: string;
  password: string;
}

export interface ApiResponse<T = VoterData> {
  message: string;
  data?: T;
}

export const authService = {
  /**
   * Login with voter ID/email + password.
   * POST /api/voter/voterLogin
   */
  login: async (payload: LoginPayload): Promise<ApiResponse> => {
    const { data } = await apiClient.post<ApiResponse>(
      API_ENDPOINTS.VOTER_LOGIN,
      payload
    );
    return data;
  },

  /**
   * Activate a voter account for first-time use.
   * POST /api/voter/activateVoterAccount
   */
  activate: async (payload: ActivatePayload): Promise<ApiResponse> => {
    const { data } = await apiClient.post<ApiResponse>(
      API_ENDPOINTS.VOTER_ACTIVATE,
      payload
    );
    return data;
  },

  /**
   * Logout — clears the server-side cookie.
   * POST /api/voter/logout
   */
  logout: async (): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.post<ApiResponse<null>>(
      API_ENDPOINTS.VOTER_LOGOUT
    );
    return data;
  },
};
