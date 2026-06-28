import type { Election, ElectionFormValues } from '../types/election';

export const electionStatusLabels = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  CLOSED: 'Closed',
  ARCHIVED: 'Archived',
};

export const electionStatusTones = {
  DRAFT: 'neutral',
  PUBLISHED: 'info',
  ACTIVE: 'success',
  PAUSED: 'warning',
  CLOSED: 'danger',
  ARCHIVED: 'neutral',
} as const;

export const initialElectionForm: ElectionFormValues = {
  title: 'Ondo State Governorship Election 2026',
  description: 'Official governorship election configuration for Ondo State.',
  electionDate: '2026-11-14',
  registrationStartsAt: '2026-08-01T09:00',
  registrationEndsAt: '2026-10-30T17:00',
  votingStartsAt: '2026-11-14T08:00',
  votingEndsAt: '2026-11-14T16:00',
  rules: {
    allowOneVotePerVoter: true,
    requireFaceVerification: true,
    requireFingerprintVerification: true,
    allowResultsBeforeClose: false,
  },
};

export const seedElections: Election[] = [
  {
    id: 'elec-ondo-gov-2026',
    title: 'Ondo State Governorship Election 2026',
    slug: 'ondo-state-governorship-election-2026',
    officeType: 'GOVERNORSHIP',
    state: 'Ondo',
    description: 'Official governorship election configuration for Ondo State.',
    electionDate: '2026-11-14',
    registrationStartsAt: '2026-08-01T09:00',
    registrationEndsAt: '2026-10-30T17:00',
    votingStartsAt: '2026-11-14T08:00',
    votingEndsAt: '2026-11-14T16:00',
    status: 'DRAFT',
    rules: {
      allowOneVotePerVoter: true,
      requireFaceVerification: true,
      requireFingerprintVerification: true,
      allowResultsBeforeClose: false,
    },
    createdBy: 'Super Admin',
    updatedAt: '2026-04-23T09:00',
  },
  {
    id: 'elec-ondo-gov-demo',
    title: 'Ondo Governorship Demo Election',
    slug: 'ondo-governorship-demo-election',
    officeType: 'GOVERNORSHIP',
    state: 'Ondo',
    description: 'Demo election used for testing registration, biometric review, and ballot flow.',
    electionDate: '2026-07-18',
    registrationStartsAt: '2026-05-01T09:00',
    registrationEndsAt: '2026-06-30T17:00',
    votingStartsAt: '2026-07-18T08:00',
    votingEndsAt: '2026-07-18T16:00',
    status: 'PUBLISHED',
    rules: {
      allowOneVotePerVoter: true,
      requireFaceVerification: true,
      requireFingerprintVerification: false,
      allowResultsBeforeClose: false,
    },
    createdBy: 'Election Admin',
    updatedAt: '2026-04-22T15:30',
    publishedAt: '2026-04-22T16:00',
  },
];
