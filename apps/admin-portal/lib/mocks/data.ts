import {
  Election,
  LGA,
  Ward,
  PollingUnit,
  Party,
  Candidate,
  Voter,
  BiometricProfile,
  AuditLog,
  TurnoutStats,
} from '../types';

// Mock Elections
export const mockElections: Election[] = [
  {
    id: 'election-1',
    title: 'Ondo State Governorship Election 2024',
    description: 'General election for Governor of Ondo State',
    status: 'PUBLISHED',
    electionDate: '2024-11-16',
    registrationWindowStart: '2024-09-01',
    registrationWindowEnd: '2024-10-15',
    votingWindowStart: '2024-11-16T08:00:00Z',
    votingWindowEnd: '2024-11-16T16:00:00Z',
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-09-01T00:00:00Z',
    createdBy: 'admin-1',
  },
  {
    id: 'election-2',
    title: 'Local Council Development Area Election 2024',
    description: 'LCDA election',
    status: 'DRAFT',
    electionDate: '2024-12-14',
    registrationWindowStart: '2024-10-01',
    registrationWindowEnd: '2024-11-15',
    votingWindowStart: '2024-12-14T08:00:00Z',
    votingWindowEnd: '2024-12-14T16:00:00Z',
    createdAt: '2024-09-15T00:00:00Z',
    updatedAt: '2024-09-15T00:00:00Z',
    createdBy: 'admin-1',
  },
];

// Mock LGAs
export const mockLGAs: LGA[] = [
  { id: 'lga-1', name: 'Akure', code: 'AKR', isActive: true, createdAt: '2024-01-01' },
  { id: 'lga-2', name: 'Ado-Ekiti', code: 'ADO', isActive: true, createdAt: '2024-01-01' },
  { id: 'lga-3', name: 'Owo', code: 'OWO', isActive: true, createdAt: '2024-01-01' },
];

// Mock Wards
export const mockWards: Ward[] = [
  { id: 'ward-1', name: 'Akure South 1', code: 'AKR-S1', lgaId: 'lga-1', isActive: true, createdAt: '2024-01-01' },
  { id: 'ward-2', name: 'Akure South 2', code: 'AKR-S2', lgaId: 'lga-1', isActive: true, createdAt: '2024-01-01' },
  { id: 'ward-3', name: 'Akure North 1', code: 'AKR-N1', lgaId: 'lga-1', isActive: true, createdAt: '2024-01-01' },
];

// Mock Polling Units
export const mockPollingUnits: PollingUnit[] = [
  {
    id: 'pu-1',
    name: 'Primary School 1, Akure',
    code: 'PS1-AKR',
    wardId: 'ward-1',
    lgaId: 'lga-1',
    isActive: true,
    createdAt: '2024-01-01',
  },
  {
    id: 'pu-2',
    name: 'Primary School 2, Akure',
    code: 'PS2-AKR',
    wardId: 'ward-1',
    lgaId: 'lga-1',
    isActive: true,
    createdAt: '2024-01-01',
  },
];

// Mock Parties
export const mockParties: Party[] = [
  {
    id: 'party-1',
    name: 'Peoples Democratic Party',
    abbreviation: 'PDP',
    description: 'Major opposition party',
    primaryColor: '#FF0000',
    secondaryColor: '#FFFFFF',
    isActive: true,
    createdAt: '2024-01-01',
  },
  {
    id: 'party-2',
    name: 'All Progressives Congress',
    abbreviation: 'APC',
    description: 'Ruling party',
    primaryColor: '#0066CC',
    secondaryColor: '#FFFFFF',
    isActive: true,
    createdAt: '2024-01-01',
  },
  {
    id: 'party-3',
    name: 'Labour Party',
    abbreviation: 'LP',
    description: 'Third force party',
    primaryColor: '#FF6600',
    secondaryColor: '#FFFFFF',
    isActive: true,
    createdAt: '2024-01-01',
  },
];

// Mock Candidates
export const mockCandidates: Candidate[] = [
  {
    id: 'cand-1',
    firstName: 'Rotimi',
    lastName: 'Akeredolu',
    email: 'rotimi@apc.ng',
    partyId: 'party-2',
    electionId: 'election-1',
    status: 'APPROVED',
    ballotOrder: 1,
    createdAt: '2024-08-15',
  },
  {
    id: 'cand-2',
    firstName: 'Eyitayo',
    lastName: 'Jegede',
    email: 'eyitayo@pdp.ng',
    partyId: 'party-1',
    electionId: 'election-1',
    status: 'APPROVED',
    ballotOrder: 2,
    createdAt: '2024-08-15',
  },
];

// Mock Voters
export const mockVoters: Voter[] = [
  {
    id: 'voter-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phoneNumber: '+2348012345678',
    nin: '12345678901',
    lgaId: 'lga-1',
    wardId: 'ward-1',
    pollingUnitId: 'pu-1',
    status: 'APPROVED',
    registeredAt: '2024-09-10T10:30:00Z',
  },
  {
    id: 'voter-2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    phoneNumber: '+2349012345678',
    lgaId: 'lga-1',
    wardId: 'ward-2',
    pollingUnitId: 'pu-2',
    status: 'PENDING',
    registeredAt: '2024-09-15T14:20:00Z',
  },
];

// Mock Biometric Profiles
export const mockBiometricProfiles: BiometricProfile[] = [
  {
    id: 'bio-1',
    voterId: 'voter-1',
    faceEnrollmentStatus: 'ENROLLED',
    faceEnrollmentDate: '2024-09-11T09:00:00Z',
    fingerprintEnrollmentStatus: 'ENROLLED',
    fingerprintEnrollmentDate: '2024-09-11T09:15:00Z',
    lastVerificationAttempt: '2024-09-12T10:00:00Z',
    verificationAttempts: 1,
    createdAt: '2024-09-11T08:30:00Z',
  },
  {
    id: 'bio-2',
    voterId: 'voter-2',
    faceEnrollmentStatus: 'PENDING',
    fingerprintEnrollmentStatus: 'PENDING',
    verificationAttempts: 0,
    createdAt: '2024-09-15T14:20:00Z',
  },
];

// Mock Audit Logs
export const mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    adminId: 'admin-1',
    adminEmail: 'admin@ondo.gov.ng',
    action: 'ELECTION_PUBLISH',
    resourceType: 'Election',
    resourceId: 'election-1',
    electionId: 'election-1',
    details: { title: 'Ondo State Governorship Election 2024' },
    timestamp: '2024-09-01T10:00:00Z',
  },
  {
    id: 'audit-2',
    adminId: 'admin-1',
    adminEmail: 'admin@ondo.gov.ng',
    action: 'VOTER_APPROVE',
    resourceType: 'Voter',
    resourceId: 'voter-1',
    electionId: 'election-1',
    timestamp: '2024-09-11T09:00:00Z',
  },
];

// Mock Turnout Stats
export const mockTurnoutStats: TurnoutStats = {
  electionId: 'election-1',
  totalRegisteredVoters: 2500000,
  totalVotesCast: 1875000,
  failedBiometricAttempts: 125,
  duplicateVoteAttempts: 3,
  updatedAt: new Date().toISOString(),
};
