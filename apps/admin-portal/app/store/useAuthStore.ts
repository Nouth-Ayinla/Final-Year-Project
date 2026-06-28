import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "sonner";

type Profile = {
  firstName: string;
  surname: string;
  otherName?: string | null;
  email: string;
  profilePicture?: string | null;
  DOB: string;
  sex: "male" | "female" | "other";
  maritalStatus: "single" | "married" | "divorced" | "widowed";
  state: string;
  LGA: string;
  education: string;
  residentialAddress: string;
  adminId: string;
  role: "SUPER_ADMIN" | "ELECTION_ADMIN" | "REGISTRATION_OFFICER" | "MONITORING_OFFICER" | "RESULTS_OFFICER" | "VOTER";
};

type AuthStore = {
  authUser: Profile | null;
  isCheckingAuth: boolean;
  isLoggingIn: boolean;
  isRegisteringOfficer: boolean;
  isRegisteringVoter: boolean;
  isGettingOfficers: boolean;
  isGettingVoters: boolean;
  isDeletingOfficers: boolean;
  isDeletingVoter: boolean;
  isActivatingAccount: boolean;

  adminLogin: (data: {
    identifier: string;
    password: string;
  }) => Promise<boolean>;

  activateAdminAccount: (data: {
    adminId: string;
    password: string;
    confirmPassword: string;
    activationPin: string;
  }) => Promise<boolean>;

  logout: () => Promise<void>;

  checkAuth: () => Promise<boolean>;

  registerOfficer: (formData: FormData) => Promise<boolean>;
  registerVoter: (formData: FormData) => Promise<boolean>;
  officers: any[];
  getRegisteredOfficers: () => Promise<any[]>;
  getRegisteredVoters: () => Promise<any[]>;
  voters: any[];
  DeleteOfficers: (officerId: string) => Promise<boolean>;
  DeleteVoter: (voterId: string) => Promise<boolean>;
  isGettingAdmin: boolean;
  getMeAdmin: () => Promise<boolean>;
  profile: Profile | null;
};

export const useAuthStore = create<AuthStore>((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isLoggingIn: false,
  isRegisteringOfficer: false,
  isRegisteringVoter: false,
  isGettingOfficers: false,
  officers: [],
  isGettingVoters: false,
  voters: [],
  isDeletingOfficers: false,
  isDeletingVoter: false,
  isActivatingAccount: false,
  isGettingAdmin: false,
  profile: null,

  activateAdminAccount: async (data) => {
    try {
      set({ isActivatingAccount: true });

      const res = await axiosInstance.post("/admin/activateAdminAccount", data);

      toast.success(res.data?.message || "Account activated successfully");

      // optional: auto-login after activation
      set({ authUser: res.data?.data });

      return true;
    } catch (error: any) {
      console.log("Error activating account", error);

      toast.error(error.response?.data?.message || "Activation failed");

      return false;
    } finally {
      set({ isActivatingAccount: false });
    }
  },

  adminLogin: async (data) => {
    try {
      set({ isLoggingIn: true });

      const res = await axiosInstance.post("/admin/adminLogin", data);

      set({ authUser: res.data.data });
      await useAuthStore.getState().getMeAdmin();

      toast.success("Login successful");
      return true;
    } catch (error: any) {
      console.log("Error in adminLogin", error);

      set({ authUser: null });

      toast.error(error.response?.data?.message || "Login failed");

      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/admin/logout");

      set({ authUser: null });

      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/admin/check");

      set({ authUser: res.data.user ?? res.data });
      return true;
    } catch (error) {
      set({ authUser: null });
      return false;
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  registerOfficer: async (formData: FormData) => {
    try {
      set({ isRegisteringOfficer: true });

      const res = await axiosInstance.post("/admin/registerOfficer", formData);

      toast.success(res.data?.message || "Officer registered successfully");

      return true;
    } catch (error: any) {
      console.log("Error registering officer", error);

      toast.error(
        error.response?.data?.message || "Failed to register officer",
      );

      return false;
    } finally {
      set({ isRegisteringOfficer: false });
    }
  },

  registerVoter: async (formData: FormData) => {
    try {
      set({ isRegisteringVoter: true });

      const res = await axiosInstance.post("/admin/registerVoter", formData);

      toast.success(res.data?.message || "Officer registered successfully");

      return true;
    } catch (error: any) {
      console.log("Error registering officer", error);

      toast.error(
        error.response?.data?.message || "Failed to register officer",
      );

      return false;
    } finally {
      set({ isRegisteringVoter: false });
    }
  },

  getRegisteredOfficers: async () => {
    set({ isGettingOfficers: true });
    try {
      const res = await axiosInstance.get("/admin/getRegisteredOfficers");
      const officers = res.data?.data ?? [];
      set({ officers });
      return officers;
    } catch (error: any) {
      console.log("Error getting officer", error);

      toast.error(
        error.response?.data?.message || "Failed to Get registered officer",
      );

      return [];
    } finally {
      set({ isGettingOfficers: false });
    }
  },

  getRegisteredVoters: async () => {
    set({ isGettingVoters: true });
    try {
      const res = await axiosInstance.get("/admin/getRegisteredVoters");
      const voters = res.data?.data ?? [];
      set({ voters });
      return voters;
    } catch (error: any) {
      console.log("Error getting officer", error);

      toast.error(
        error.response?.data?.message || "Failed to Get registered officer",
      );

      return [];
    } finally {
      set({ isGettingVoters: false });
    }
  },

  DeleteOfficers: async (officerId: string) => {
    set({ isDeletingOfficers: true });
    try {
      await axiosInstance.delete(`/admin/deleteOfficer/${officerId}`);

      set((state) => ({
        officers: state.officers.filter((officer) => officer.id !== officerId),
      }));

      toast.success("Officer deleted successfully");

      return true;
    } catch (error: any) {
      console.log("Error deleting officer", error);

      toast.error(error.response?.data?.message || "Failed to delete officer");

      return false;
    } finally {
      set({ isDeletingOfficers: false });
    }
  },

  DeleteVoter: async (voterId: string) => {
    set({ isDeletingVoter: true });
    try {
      await axiosInstance.delete(`/admin/deleteVoter/${voterId}`);

      set((state) => ({
        voters: state.voters.filter((voters) => voters.id !== voterId),
      }));

      toast.success("Voter deleted successfully");

      return true;
    } catch (error: any) {
      console.log("Error deleting Voter", error);

      toast.error(error.response?.data?.message || "Failed to delete Voter");

      return false;
    } finally {
      set({ isDeletingVoter: false });
    }
  },
  getMeAdmin: async () => {
    try {
      set({ isGettingAdmin: true });

      const res = await axiosInstance.get("/admin/getMeAdmin");

      set({ profile: res.data.user ?? res.data });

      return true;
    } catch (error: any) {
      console.log("Error fetching admin profile", error);

      set({ profile: null });

      return false;
    } finally {
      set({ isGettingAdmin: false });
    }
  },
}));
