/**
 * Election API service — maps to voter-facing backend election endpoints.
 *
 * NOTE on response shapes:
 * The backend returns { success: boolean, data: T } for election routes.
 * Auth routes return { message: string, data: T }.
 * This service normalises both shapes.
 */
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/constants/Api';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

import axios from "axios";

// Get the host machine's IP for the face verification service (same logic as Api.ts)
const getFaceServiceUrl = (): string => {
  if (__DEV__) {
    if (Platform.OS === 'ios') {
      const url = 'http://localhost:8000';
      console.log('Face Service URL (iOS):', url);
      return url;
    }
    const hostUri = Constants.expoConfig?.hostUri;
    console.log('Host URI:', hostUri);
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      const url = `http://${ip}:8000`;
      console.log('Face Service URL (Android):', url);
      return url;
    }
    const fallback = 'http://192.168.1.169:8000';
    console.log('Face Service URL (Fallback):', fallback);
    return fallback;
  }
  return 'https://face.ondodecide.com'; // Production URL
};

const FACE_SERVICE_URL = getFaceServiceUrl();

export type ElectionStatus = 'DRAFT' | 'UPCOMING' | 'ACTIVE' | 'CLOSED';

export interface PoliticalParty {
  id: string;
  name: string;
  abbreviation: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Election {
  id: string;
  title: string;
  description?: string;
  status: ElectionStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  _count?: { votes: number };
}

export interface Candidate {
  id: string;
  firstName: string;
  surname: string;
  otherName?: string;
  party: PoliticalParty;
  imageUrl: string;
  bio: string;
  electionId: string;
  state?: string;
  LGA?: string;
  _count?: { votes: number };
}

// GetSingleCandidateDetails does NOT return an election object — it returns _count.votes
export interface CandidateDetail {
  id: string;
  firstName: string;
  surname: string;
  otherName?: string;
  DOB: string;
  sex: string;
  maritalStatus: string;
  state: string;
  LGA: string;
  education: string;
  bio: string;
  imageUrl: string;
  party: PoliticalParty;
  election?: any;
  _count: { votes: number };
}

export interface CastVoteResponse {
  success: boolean;
  message: string;
  vote?: any;
}

export interface VoterInfo {
  firstName: string;
  surname: string;
  otherName?: string;
  email: string;
  profilePicture: string;
  DOB: string;
  sex: string;
  maritalStatus: string;
  state: string;
  LGA: string;
  education: string;
  residentialAddress: string;
  voterId: string;
  votes: { electionId: string }[];
}

export const electionService = {
  /**
   * Get all elections visible to the voter (excludes DRAFT).
   * GET /api/voter/elections
   * Response: { success: boolean, data: Election[] }
   */
  getElections: async (): Promise<{ data: Election[] }> => {
    const { data } = await apiClient.get(API_ENDPOINTS.VOTER_ELECTIONS);
    // backend returns { success, data } — normalise
    return { data: data?.data ?? [] };
  },

  /**
   * Get all candidates in an election (mobile-optimised).
   * GET /api/voter/candidates/:electionId
   * Response: { success: boolean, data: Candidate[] }
   */
  getCandidates: async (electionId: string): Promise<{ data: Candidate[] }> => {
    const { data } = await apiClient.get(API_ENDPOINTS.VOTER_CANDIDATES(electionId));
    return { data: data?.data ?? [] };
  },

  /**
   * Get full details of a single candidate (includes _count.votes, NO election obj).
   * GET /api/voter/elections/:electionId/candidates/:candidateId
   * Response: { success: boolean, data: CandidateDetail }
   */
  getCandidateDetail: async (
    electionId: string,
    candidateId: string
  ): Promise<{ data: CandidateDetail | null }> => {
    const { data } = await apiClient.get(
      API_ENDPOINTS.VOTER_CANDIDATE_DETAIL(electionId, candidateId)
    );
    return { data: data?.data ?? null };
  },

  /**
   * Cast a vote for a candidate.
   * POST /api/voter/castVote/:candidateId
   * ⚠️  Backend requires protectRoute — voter must be authenticated via cookie.
   */
  castVote: async (candidateId: string): Promise<CastVoteResponse> => {
    const { data } = await apiClient.post(API_ENDPOINTS.VOTER_CAST_VOTE(candidateId));
    return data;
  },

  /**
   * Get current voter information including voting history.
   * GET /api/voter/getMeVoter
   * Response: VoterInfo with votes array containing electionIds
   */
  getVoterInfo: async (): Promise<{ data: VoterInfo }> => {
    const { data } = await apiClient.get(API_ENDPOINTS.VOTER_ME);
    return { data };
  },

  verifyBiometric: async (
    voterId: string,
    imageUri: string
  ): Promise<any> => {
    console.log('Starting face verification...');
    console.log('Voter ID:', voterId); //@note we console.logs the values right here 
    console.log('Image URI:', imageUri);
    console.log('Face Service URL:', FACE_SERVICE_URL);

    const formData = new FormData();
    formData.append('voter_id', voterId);
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'verify_face.jpg',
    } as any);

    console.log('FormData prepared, making request...');

    // Let Axios set the Content-Type header automatically with the correct boundary
    const response = await axios.post(
      `${FACE_SERVICE_URL}/api/v1/face/verify`,
      formData,
      {
        timeout: 30000,
      }
    );

    console.log('Response received:', response.data); //@audit we console.logs the error 

    return response.data;
  },
};
