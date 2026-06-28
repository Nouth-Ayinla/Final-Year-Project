import {
  mockAuditLogs,
  mockBiometricProfiles,
  mockCandidates,
  mockElections,
  mockLGAs,
  mockParties,
  mockPollingUnits,
  mockTurnoutStats,
  mockVoters,
  mockWards,
} from '../mocks/data';

export type DashboardMetric = {
  label: string;
  value: string;
  hint: string;
};

export type DashboardAlert = {
  label: string;
  value: string;
  tone: 'neutral' | 'info' | 'warning' | 'danger';
};

export type DashboardActivity = {
  title: string;
  detail: string;
  time: string;
};

export const dashboardMetrics: DashboardMetric[] = [
  {
    label: 'Elections configured',
    value: String(mockElections.length),
    hint: `${mockElections.filter((item) => item.status === 'PUBLISHED').length} published`,
  },
  {
    label: 'Registered voters',
    value: mockVoters.length.toLocaleString(),
    hint: `${mockVoters.filter((item) => item.status === 'APPROVED').length} approved`,
  },
  {
    label: 'Geography records',
    value: String(mockLGAs.length + mockWards.length + mockPollingUnits.length),
    hint: `${mockLGAs.length} LGAs, ${mockWards.length} wards, ${mockPollingUnits.length} polling units`,
  },
  {
    label: 'Active parties',
    value: String(mockParties.filter((item) => item.isActive).length),
    hint: `${mockParties.length} total parties`,
  },
  {
    label: 'Approved candidates',
    value: String(mockCandidates.filter((item) => item.status === 'APPROVED').length),
    hint: `${mockCandidates.length} total candidates`,
  },
  {
    label: 'Biometric reviews',
    value: String(mockBiometricProfiles.length),
    hint: `${mockBiometricProfiles.filter((item) => item.faceEnrollmentStatus === 'ENROLLED').length} face enrolled`,
  },
];

export const dashboardAlerts: DashboardAlert[] = [
  {
    label: 'Turnout coverage',
    value: `${Math.round((mockTurnoutStats.totalVotesCast / mockTurnoutStats.totalRegisteredVoters) * 100)}%`,
    tone: 'info',
  },
  {
    label: 'Failed biometric attempts',
    value: String(mockTurnoutStats.failedBiometricAttempts),
    tone: mockTurnoutStats.failedBiometricAttempts > 100 ? 'warning' : 'info',
  },
  {
    label: 'Duplicate vote attempts',
    value: String(mockTurnoutStats.duplicateVoteAttempts),
    tone: mockTurnoutStats.duplicateVoteAttempts > 0 ? 'warning' : 'neutral',
  },
  {
    label: 'Recent audit events',
    value: String(mockAuditLogs.length),
    tone: 'info',
  },
];

export const dashboardActivities: DashboardActivity[] = [
  {
    title: 'Latest election update',
    detail: `${mockElections[0]?.title ?? 'No election'} was last updated by ${mockElections[0]?.createdBy ?? 'system'}.`,
    time: mockElections[0]?.updatedAt ?? 'N/A',
  },
  {
    title: 'Latest voter approval',
    detail: `${mockVoters[0]?.firstName ?? 'No voter'} ${mockVoters[0]?.lastName ?? ''} is approved for voting.`,
    time: mockVoters[0]?.registeredAt ?? 'N/A',
  },
  {
    title: 'Biometric review queue',
    detail: `${mockBiometricProfiles.filter((item) => item.faceEnrollmentStatus !== 'ENROLLED').length} profile(s) still need review.`,
    time: mockBiometricProfiles[1]?.createdAt ?? 'N/A',
  },
];
