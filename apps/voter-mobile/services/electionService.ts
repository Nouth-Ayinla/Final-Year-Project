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

export type ElectionStatus = 'DRAFT' | 'UPCOMING' | 'ACTIVE' | 'CLOSED';

export type PoliticalParty =
  | 'APC' | 'PDP' | 'LP' | 'NNPP' | 'APGA' | 'SDP' | 'YPP';

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

  verifyBiometric: async (
    electionId: string,
    imageUri: string
  ): Promise<{ success: boolean; matched: boolean; similarity: number; message?: string }> => {
    const formData = new FormData();
    formData.append('electionId', electionId);
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'verify_face.jpg',
    } as any);

    const { data } = await apiClient.post(
      API_ENDPOINTS.VOTER_VERIFY_BIOMETRIC,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },
};
