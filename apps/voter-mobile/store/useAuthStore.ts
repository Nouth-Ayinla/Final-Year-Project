/**
 * Global auth state management using Zustand.
 *
 * Profile data strategy:
 *
 * The VoterLogin endpoint only returns { id, email, voterId, isActivated }.
 * The ActivateVoterAccount endpoint returns the full voter row (all profile fields).
 * getMeVoter cannot be used because protectRoute only checks the Admin table.
 *
 * Solution:
 *  - On activation  → full profile data is stored in SecureStore.
 *  - On subsequent login → merge the minimal login response over the stored profile
 *    so name, state, LGA etc. are preserved across sessions.
 *  - On initialize  → restore the full merged profile from SecureStore.
 */
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authService, VoterData, LoginPayload, ActivatePayload } from '@/services/authService';
import { TOKEN_KEY } from '@/services/apiClient';

const VOTER_STORE_KEY = 'ondodecide_voter';

/** Strip the hashed password the backend mistakenly includes in responses. */
function sanitiseVoter(v: any): VoterData {
  const { password, activationPin, ...safe } = v ?? {};
  return safe as VoterData;
}

/**
 * Merge new (possibly minimal) voter data onto any existing stored profile.
 * Fields present in `next` overwrite the existing ones; fields absent in `next`
 * are preserved from the stored copy (so profile info survives across logins).
 */
async function mergeAndStore(next: Partial<VoterData>): Promise<VoterData> {
  let existing: VoterData = {} as VoterData;
  try {
    const raw = await SecureStore.getItemAsync(VOTER_STORE_KEY);
    if (raw) existing = JSON.parse(raw) as VoterData;
  } catch { /* ignore */ }

  const merged = sanitiseVoter({ ...existing, ...next });
  await SecureStore.setItemAsync(VOTER_STORE_KEY, JSON.stringify(merged));
  return merged;
}

interface AuthState {
  voter: VoterData | null;
  isAuthenticated: boolean;
  isBiometricVerified: boolean;
  biometricSkipped: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;

  login:               (payload: LoginPayload)    => Promise<boolean>;
  activate:            (payload: ActivatePayload) => Promise<boolean>;
  logout:              ()                          => Promise<void>;
  refreshProfile:      (data: Partial<VoterData>) => Promise<void>;
  setBiometricVerified:(verified: boolean)         => void;
  setBiometricSkipped: (skipped: boolean)          => void;
  clearError:          ()                          => void;
  initialize:          ()                          => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  voter:               null,
  isAuthenticated:     false,
  isBiometricVerified: false,
  biometricSkipped:     false,
  isLoading:           false,
  isInitializing:      true,
  error:               null,

  // ── Initialize ────────────────────────────────────────────────────────────
  initialize: async () => {
    try {
      const token     = await SecureStore.getItemAsync(TOKEN_KEY);
      const voterJson = await SecureStore.getItemAsync(VOTER_STORE_KEY);
      if (token && voterJson) {
        const voter = sanitiseVoter(JSON.parse(voterJson));
        set({ voter, isAuthenticated: true, isBiometricVerified: false, isInitializing: false });
      } else {
        set({ isInitializing: false });
      }
    } catch {
      set({ isInitializing: false });
    }
  },

  // ── Login ─────────────────────────────────────────────────────────────────
  // VoterLogin only returns { id, email, voterId, isActivated } — merge over stored profile.
  login: async (payload: LoginPayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(payload);
      if (response.data) {
        const voter = await mergeAndStore(response.data);
        set({ voter, isAuthenticated: true, isBiometricVerified: false, biometricSkipped: false, isLoading: false });
        return true;
      }
      set({ isLoading: false, error: response.message });
      return false;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Network error. Please check your connection.';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  // ── Activate ──────────────────────────────────────────────────────────────
  // ActivateVoterAccount returns the full voter row — store everything.
  activate: async (payload: ActivatePayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.activate(payload);
      if (response.data) {
        const voter = await mergeAndStore(response.data);
        set({ voter, isAuthenticated: true, isBiometricVerified: false, biometricSkipped: false, isLoading: false });
        return true;
      }
      set({ isLoading: false, error: response.message });
      return false;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Network error. Please check your connection.';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  // ── Logout ────────────────────────────────────────────────────────────────
  logout: async () => {
    try { await authService.logout(); } catch { /* always clear local state */ }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(VOTER_STORE_KEY);
    set({ voter: null, isAuthenticated: false, isBiometricVerified: false, biometricSkipped: false, isLoading: false, error: null });
  },

  setBiometricVerified: (verified) => set({ isBiometricVerified: verified }),
  setBiometricSkipped:  (skipped)  => set({ biometricSkipped: skipped }),
  clearError:           ()         => set({ error: null }),

  // Call with fresh full voter data whenever it becomes available
  refreshProfile: async (data: Partial<VoterData>) => {
    const voter = await mergeAndStore(data);
    set({ voter });
  },
}));
