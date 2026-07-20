/**
 * Global election state management using Zustand.
 * Covers: elections list, candidates list, candidate detail, vote casting.
 */
import { create } from 'zustand';
import {
  electionService,
  Election,
  Candidate,
  CandidateDetail,
  VoterInfo,
} from '@/services/electionService';

interface ElectionState {
  // Data
  elections: Election[];
  candidates: Candidate[];
  candidateDetail: CandidateDetail | null;
  voterInfo: VoterInfo | null;

  // Loading states
  isLoadingElections: boolean;
  isLoadingCandidates: boolean;
  isLoadingDetail: boolean;
  isCastingVote: boolean;
  isLoadingVoterInfo: boolean;

  // Error
  error: string | null;

  // Actions
  fetchElections: () => Promise<void>;
  fetchCandidates: (electionId: string) => Promise<void>;
  fetchCandidateDetail: (electionId: string, candidateId: string) => Promise<void>;
  castVote: (candidateId: string, electionId: string) => Promise<boolean>;
  fetchVoterInfo: () => Promise<void>;
  hasVotedInElection: (electionId: string) => boolean;
  clearError: () => void;
  clearCandidates: () => void;
  clearCandidateDetail: () => void;
}

export const useElectionStore = create<ElectionState>((set, get) => ({
  elections: [],
  candidates: [],
  candidateDetail: null,
  voterInfo: null,
  isLoadingElections: false,
  isLoadingCandidates: false,
  isLoadingDetail: false,
  isCastingVote: false,
  isLoadingVoterInfo: false,
  error: null,

  fetchElections: async () => {
    set({ isLoadingElections: true, error: null });
    try {
      const res = await electionService.getElections();
      set({ elections: res.data ?? [], isLoadingElections: false });
    } catch (err: any) {
      console.error('Error fetching elections:', err);
      set({ isLoadingElections: false });
    }
  },

  fetchCandidates: async (electionId: string) => {
    set({ isLoadingCandidates: true, error: null, candidates: [] });
    try {
      const res = await electionService.getCandidates(electionId);
      set({ candidates: res.data ?? [], isLoadingCandidates: false });
    } catch (err: any) {
      console.error('Error fetching candidates:', err);
      set({ isLoadingCandidates: false });
    }
  },

  fetchCandidateDetail: async (electionId: string, candidateId: string) => {
    set({ isLoadingDetail: true, error: null, candidateDetail: null });
    try {
      const res = await electionService.getCandidateDetail(electionId, candidateId);
      set({ candidateDetail: res.data ?? null, isLoadingDetail: false });
    } catch (err: any) {
      console.error('Error fetching candidate detail:', err);
      set({ isLoadingDetail: false });
    }
  },

  castVote: async (candidateId: string, electionId: string) => {
    set({ isCastingVote: true, error: null });
    console.log("entered here");
    try {
      await electionService.castVote(candidateId);
      // Refresh voter info to get updated voting history
      await get().fetchVoterInfo();
      set({ isCastingVote: false });

      console.log("passed in here")
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to cast vote.';
      console.log(message);
      set({ isCastingVote: false, error: message });
      return false;
    }
  },

  fetchVoterInfo: async () => {
    set({ isLoadingVoterInfo: true, error: null });
    try {
      const res = await electionService.getVoterInfo();
      set({ voterInfo: res.data, isLoadingVoterInfo: false });
    } catch (err: any) {
      console.error('Error fetching voter info:', err);
      set({ isLoadingVoterInfo: false });
    }
  },

  hasVotedInElection: (electionId: string) => {
    const { voterInfo } = get();
    if (!voterInfo || !voterInfo.votes) return false;
    return voterInfo.votes.some((vote) => vote.electionId === electionId);
  },

  clearError: () => set({ error: null }),
  clearCandidates: () => set({ candidates: [] }),
  clearCandidateDetail: () => set({ candidateDetail: null }),
}));
