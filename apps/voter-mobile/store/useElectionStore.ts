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
} from '@/services/electionService';

interface ElectionState {
  // Data
  elections: Election[];
  candidates: Candidate[];
  candidateDetail: CandidateDetail | null;

  // Loading states
  isLoadingElections: boolean;
  isLoadingCandidates: boolean;
  isLoadingDetail: boolean;
  isCastingVote: boolean;

  // Error
  error: string | null;

  // Whether the current voter has already voted in an election (keyed by electionId)
  votedElections: Record<string, boolean>;

  // Actions
  fetchElections: () => Promise<void>;
  fetchCandidates: (electionId: string) => Promise<void>;
  fetchCandidateDetail: (electionId: string, candidateId: string) => Promise<void>;
  castVote: (candidateId: string, electionId: string) => Promise<boolean>;
  clearError: () => void;
  clearCandidates: () => void;
  clearCandidateDetail: () => void;
}

export const useElectionStore = create<ElectionState>((set, get) => ({
  elections: [],
  candidates: [],
  candidateDetail: null,
  isLoadingElections: false,
  isLoadingCandidates: false,
  isLoadingDetail: false,
  isCastingVote: false,
  error: null,
  votedElections: {},

  fetchElections: async () => {
    set({ isLoadingElections: true, error: null });
    try {
      const res = await electionService.getElections();
      set({ elections: res.data ?? [], isLoadingElections: false });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load elections.';
      set({ isLoadingElections: false, error: message });
    }
  },

  fetchCandidates: async (electionId: string) => {
    set({ isLoadingCandidates: true, error: null, candidates: [] });
    try {
      const res = await electionService.getCandidates(electionId);
      set({ candidates: res.data ?? [], isLoadingCandidates: false });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load candidates.';
      set({ isLoadingCandidates: false, error: message });
    }
  },

  fetchCandidateDetail: async (electionId: string, candidateId: string) => {
    set({ isLoadingDetail: true, error: null, candidateDetail: null });
    try {
      const res = await electionService.getCandidateDetail(electionId, candidateId);
      set({ candidateDetail: res.data ?? null, isLoadingDetail: false });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load candidate details.';
      set({ isLoadingDetail: false, error: message });
    }
  },

  castVote: async (candidateId: string, electionId: string) => {
    set({ isCastingVote: true, error: null });
    try {
      await electionService.castVote(candidateId);
      // Mark this election as voted in local state
      set((state) => ({
        isCastingVote: false,
        votedElections: { ...state.votedElections, [electionId]: true },
      }));
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to cast vote.';
      set({ isCastingVote: false, error: message });
      return false;
    }
  },

  clearError: () => set({ error: null }),
  clearCandidates: () => set({ candidates: [] }),
  clearCandidateDetail: () => set({ candidateDetail: null }),
}));
