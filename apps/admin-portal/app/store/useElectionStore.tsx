import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "sonner";

type ElectionStore = {
  isCreatingElection: boolean;
  isGettingElections: boolean;

  createElection: (data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
  }) => Promise<boolean>;

  getElections: () => Promise<any[]>;
  elections: any[];

  DeleteElection: (electionId: string) => Promise<boolean>;
  isDeletingElection: boolean;

  EditElection: (
    electionId: string,
    data: {
      title: string;
      description: string;
      startDate: string;
      endDate: string;
      status: string;
    },
  ) => Promise<boolean>;

  isEditingElection: boolean;

  AddCandidate: (electionId: string, formData: FormData) => Promise<boolean>;

  isAddingCandidate: boolean;
  isGettingCandidatesInElection: boolean;
  CandidatesInElection: any[];
  GetCandidatesInElections: (electionId: string) => Promise<any[]>;
  isDeletingCandidate: boolean;
  DeleteCandidate: (candidateId: string) => Promise<boolean>;
  isGettingCandidate: boolean;
  candidate: any | null;
  GetCandidateById: (candidateId: string) => Promise<any>;
  isEditingCandidate: boolean;
  EditCandidate: (candidateId: string, formData: FormData) => Promise<boolean>;

  isCreatingParty: boolean;
  isGettingParties: boolean;
  isEditingParty: boolean;
  isDeletingParty: boolean;
  parties: any[];
  getParties: () => Promise<any[]>;
  createParty: (data: {
    name: string;
    abbreviation: string;
    primaryColor: string;
    secondaryColor: string;
    description?: string;
  }) => Promise<boolean>;
  editParty: (
    partyId: string,
    data: {
      name: string;
      primaryColor: string;
      secondaryColor: string;
      description?: string;
      isActive?: boolean;
    },
  ) => Promise<boolean>;
  deleteParty: (partyId: string) => Promise<boolean>;
};

export const useElectionStore = create<ElectionStore>((set) => ({
  isCreatingElection: false,
  isGettingElections: false,
  elections: [],
  isDeletingElection: false,
  isEditingElection: false,
  isAddingCandidate: false,
  isGettingCandidatesInElection: false,
  CandidatesInElection: [],
  isDeletingCandidate: false,
  isGettingCandidate: false,
  candidate: null,
  isEditingCandidate: false,

  isCreatingParty: false,
  isGettingParties: false,
  isEditingParty: false,
  isDeletingParty: false,
  parties: [],

  createElection: async (data) => {
    try {
      set({ isCreatingElection: true });
      const res = await axiosInstance.post("/election/createElection", data);
      toast.success(res.data?.message || "Election created successfully");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create election");
      return false;
    } finally {
      set({ isCreatingElection: false });
    }
  },

  getElections: async () => {
    set({ isGettingElections: true });
    try {
      const res = await axiosInstance.get("/election/getAllElections");
      const elections = res.data?.data ?? [];
      set({ elections });
      return elections;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to get elections");
      return [];
    } finally {
      set({ isGettingElections: false });
    }
  },

  DeleteElection: async (electionId: string) => {
    set({ isDeletingElection: true });
    try {
      await axiosInstance.delete(`/election/deleteElection/${electionId}`);

      set((state) => ({
        elections: state.elections.filter(
          (election) => election.id !== electionId,
        ),
      }));

      toast.success("Election deleted successfully");

      return true;
    } catch (error: any) {
      console.log("Error deleting Election", error);

      toast.error(error.response?.data?.message || "Failed to delete Election");

      return false;
    } finally {
      set({ isDeletingElection: false });
    }
  },

  EditElection: async (electionId: string, data) => {
    try {
      set({ isEditingElection: true });

      const res = await axiosInstance.put(
        `/election/editElection/${electionId}`,
        data,
      );

      toast.success(res.data?.message || "Election updated successfully");

      set((state) => ({
        elections: state.elections.map((election) =>
          election.id === electionId
            ? { ...election, ...res.data.data }
            : election,
        ),
      }));

      return true;
    } catch (error: any) {
      console.log("Error editing election", error);

      toast.error(error.response?.data?.message || "Failed to update election");

      return false;
    } finally {
      set({ isEditingElection: false });
    }
  },

  AddCandidate: async (electionId, formData: FormData) => {
    try {
      set({ isAddingCandidate: true });

      const res = await axiosInstance.post(
        `/election/createCandidate/${electionId}/candidate`,
        formData,
      );

      toast.success(res.data?.message || "Candidate added successfully");

      return true;
    } catch (error: any) {
      console.log("Error adding candidate", error);

      toast.error(error.response?.data?.message || "Failed to add candidate");

      return false;
    } finally {
      set({ isAddingCandidate: false });
    }
  },

  GetCandidatesInElections: async (electionId: string) => {
    set({ isGettingCandidatesInElection: true });

    try {
      const res = await axiosInstance.get(
        `/election/getCandidatesInElection/${electionId}`,
      );

      const candidates = res.data?.data ?? [];

      set({ CandidatesInElection: candidates });

      return candidates;
    } catch (error: any) {
      console.log("Error getting candidates", error);
      toast.error(error.response?.data?.message || "Failed to get candidates");
      return [];
    } finally {
      set({ isGettingCandidatesInElection: false });
    }
  },
  DeleteCandidate: async (candidateId: string) => {
    set({ isDeletingCandidate: true });
    try {
      await axiosInstance.delete(`/election/deleteCandidate/${candidateId}`);

      set((state) => ({
        CandidatesInElection: state.CandidatesInElection.filter(
          (candidate) => candidate.id !== candidateId,
        ),
      }));

      toast.success("Candidate removed successfully");

      return true;
    } catch (error: any) {
      console.log("Error deleting candidate", error);

      toast.error(
        error.response?.data?.message || "Failed to delete Candidate",
      );

      return false;
    } finally {
      set({ isDeletingCandidate: false });
    }
  },
  GetCandidateById: async (candidateId: string) => {
    try {
      set({ isGettingCandidate: true });

      const res = await axiosInstance.get(
        `/election/getCandidateById/${candidateId}`,
      );

      set({
        candidate: res.data.data,
      });

      return res.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch candidate");

      return null;
    } finally {
      set({
        isGettingCandidate: false,
      });
    }
  },

  EditCandidate: async (candidateId: string, formData: FormData) => {
    try {
      set({ isEditingCandidate: true });

      const res = await axiosInstance.put(
        `/election/editCandidate/${candidateId}`,
        formData,
      );

      toast.success(res.data?.message || "Candidate updated successfully");

      const updatedCandidate = res.data.candidate;

      set((state) => ({
        candidate:
          state.candidate?.id === candidateId
            ? updatedCandidate
            : state.candidate,
        CandidatesInElection: state.CandidatesInElection.map((candidate) =>
          candidate.id === candidateId ? updatedCandidate : candidate,
        ),
      }));

      return true;
    } catch (error: any) {
      console.error("Error editing candidate:", error);

      toast.error(
        error.response?.data?.message || "Failed to update candidate",
      );

      return false;
    } finally {
      set({ isEditingCandidate: false });
    }
  },

  getParties: async () => {
    set({ isGettingParties: true });
    try {
      const res = await axiosInstance.get("/election/getAllParties");
      const parties = res.data?.parties ?? [];
      set({ parties });
      return parties;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load political parties");
      return [];
    } finally {
      set({ isGettingParties: false });
    }
  },

  createParty: async (data) => {
    set({ isCreatingParty: true });
    try {
      const res = await axiosInstance.post("/election/createParty", data);
      toast.success(res.data?.message || "Political party registered successfully");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to register political party");
      return false;
    } finally {
      set({ isCreatingParty: false });
    }
  },

  editParty: async (partyId, data) => {
    set({ isEditingParty: true });
    try {
      const res = await axiosInstance.put(`/election/editParty/${partyId}`, data);
      toast.success(res.data?.message || "Political party updated successfully");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update political party");
      return false;
    } finally {
      set({ isEditingParty: false });
    }
  },

  deleteParty: async (partyId) => {
    set({ isDeletingParty: true });
    try {
      const res = await axiosInstance.delete(`/election/deleteParty/${partyId}`);
      toast.success(res.data?.message || "Political party deleted successfully");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete political party");
      return false;
    } finally {
      set({ isDeletingParty: false });
    }
  },
}));
