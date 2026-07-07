/**
 * API Configuration
 * Points to the existing Express backend at port 5000.
 * 
 * IMPORTANT: When running on an Android emulator, 
 * use 10.0.2.2 instead of localhost to reach the host machine.
 * When running on a physical device, use the machine's LAN IP.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBaseUrl = (): string => {
  if (__DEV__) {
    if (Platform.OS === 'ios') {
      return 'http://localhost:5001';      // iOS simulator only
    }
    // Dynamically get the host machine's LAN IP from Expo CLI/Metro
    const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.92.124:8081"

    console.log(hostUri);
    
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      return `http://${ip}:5001`;
    }
    // Fallback if hostUri is unavailable (e.g. Android Emulator fallback)
    return 'http://10.112.32.155:5001';
  }
  return 'https://api.ondodecide.com';
};


export const API_BASE_URL = getBaseUrl();

export const API_ENDPOINTS = {
  // Voter Auth
  VOTER_LOGIN: '/api/voter/voterLogin',
  VOTER_LOGOUT: '/api/voter/logout',
  VOTER_ACTIVATE: '/api/voter/activateVoterAccount',
  VOTER_ME: '/api/voter/getMeVoter',

  // Elections (voter-facing)
  VOTER_ELECTIONS: '/api/voter/elections',
  VOTER_CANDIDATES: (electionId: string) => `/api/voter/candidates/${electionId}`,
  VOTER_CANDIDATE_DETAIL: (electionId: string, candidateId: string) =>
    `/api/voter/elections/${electionId}/candidates/${candidateId}`,
  VOTER_CAST_VOTE: (candidateId: string) => `/api/voter/castVote/${candidateId}`,
  VOTER_VERIFY_BIOMETRIC: '/api/voter/verify-biometric',
} as const;
