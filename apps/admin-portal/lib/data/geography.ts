import { mockLGAs, mockPollingUnits, mockWards } from '../mocks/data';
import type { LGA, PollingUnit, Ward } from '../types';

export type GeographyState = {
  lgas: LGA[];
  wards: Ward[];
  pollingUnits: PollingUnit[];
};

const GEOGRAPHY_STORAGE_KEY = 'ondo-vote-geography-state';

export const initialGeographyState: GeographyState = {
  lgas: mockLGAs,
  wards: mockWards,
  pollingUnits: mockPollingUnits,
};

export function loadGeographyState(): GeographyState {
  try {
    const raw = window.localStorage.getItem(GEOGRAPHY_STORAGE_KEY);
    if (!raw) {
      return initialGeographyState;
    }

    const parsed = JSON.parse(raw) as Partial<GeographyState>;

    return {
      lgas: Array.isArray(parsed.lgas) ? (parsed.lgas as LGA[]) : initialGeographyState.lgas,
      wards: Array.isArray(parsed.wards) ? (parsed.wards as Ward[]) : initialGeographyState.wards,
      pollingUnits: Array.isArray(parsed.pollingUnits)
        ? (parsed.pollingUnits as PollingUnit[])
        : initialGeographyState.pollingUnits,
    };
  } catch {
    return initialGeographyState;
  }
}

export function saveGeographyState(state: GeographyState) {
  window.localStorage.setItem(GEOGRAPHY_STORAGE_KEY, JSON.stringify(state));
}
