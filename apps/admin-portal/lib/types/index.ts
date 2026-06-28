// Auth & User Types
export type AdminRole = 'SUPER_ADMIN' | 'ELECTION_ADMIN' | 'REGISTRATION_OFFICER' | 'MONITORING_OFFICER' | 'RESULTS_OFFICER';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  lgaAccess?: string[]; // LGA IDs they have access to
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthContext {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}

// Election Types
export type ElectionStatus = 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'ARCHIVED';

export interface Election {
  id: string;
  title: string;
  description: string;
  status: ElectionStatus;
  electionDate: string;
  registrationWindowStart: string;
  registrationWindowEnd: string;
  votingWindowStart: string;
  votingWindowEnd: string;
  rules?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Geography Types
export interface LGA {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
}

export interface Ward {
  id: string;
  name: string;
  code: string;
  lgaId: string;
  isActive: boolean;
  createdAt: string;
}

export interface PollingUnit {
  id: string;
  name: string;
  code: string;
  wardId: string;
  lgaId: string;
  isActive: boolean;
  createdAt: string;
}

// Party Types
export interface Party {
  id: string;
  name: string;
  abbreviation: string;
  description?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isActive: boolean;
  createdAt: string;
}

// Candidate Types
export type CandidateStatus = 'PENDING' | 'APPROVED' | 'DISQUALIFIED' | 'WITHDRAWN';

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  partyId: string;
  electionId: string;
  photoUrl?: string;
  status: CandidateStatus;
  ballotOrder?: number;
  createdAt: string;
}

// Voter Types
export type VoterStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface Voter {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  nin?: string;
  lgaId: string;
  wardId: string;
  pollingUnitId: string;
  status: VoterStatus;
  registeredAt: string;
}

// Biometric Types
export type BiometricStatus = 'PENDING' | 'ENROLLED' | 'POOR_QUALITY' | 'DUPLICATE_ALERT' | 'FAILED';

export interface BiometricProfile {
  id: string;
  voterId: string;
  faceEnrollmentStatus: BiometricStatus;
  faceEnrollmentDate?: string;
  fingerprintEnrollmentStatus: BiometricStatus;
  fingerprintEnrollmentDate?: string;
  lastVerificationAttempt?: string;
  verificationAttempts: number;
  createdAt: string;
}

// Ballot Types
export interface Ballot {
  id: string;
  electionId: string;
  version: number;
  candidateIds: string[]; // Ordered list of candidate IDs
  status: 'DRAFT' | 'PUBLISHED' | 'RETIRED';
  publishedAt?: string;
  createdAt: string;
}

// Vote Types
export interface VoteRecord {
  id: string;
  electionId: string;
  candidateId: string;
  recordedAt: string;
}

export interface VoteReceipt {
  id: string;
  voterId: string;
  electionId: string;
  ballotVersion: number;
  generatedAt: string;
  receiptCode: string;
}

// Audit Log Types
export type AuditAction = 
  | 'LOGIN' | 'LOGOUT' 
  | 'ELECTION_CREATE' | 'ELECTION_UPDATE' | 'ELECTION_PUBLISH' | 'ELECTION_CLOSE'
  | 'VOTER_CREATE' | 'VOTER_UPDATE' | 'VOTER_APPROVE' | 'VOTER_REJECT'
  | 'BIOMETRIC_REVIEW' | 'BIOMETRIC_APPROVE' | 'BIOMETRIC_FLAG'
  | 'BALLOT_GENERATE' | 'BALLOT_PUBLISH'
  | 'RESULTS_ACCESS' | 'EXPORT_DATA';

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  electionId?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Monitoring Types
export interface TurnoutStats {
  electionId: string;
  totalRegisteredVoters: number;
  totalVotesCast: number;
  failedBiometricAttempts: number;
  duplicateVoteAttempts: number;
  updatedAt: string;
}

export interface TurnoutByLGA extends TurnoutStats {
  lgaId: string;
  lgaName: string;
}

export interface TurnoutByWard extends TurnoutStats {
  wardId: string;
  wardName: string;
  lgaId: string;
}

// Results Types
export interface ResultSummary {
  electionId: string;
  candidateId: string;
  partyId: string;
  candidateName: string;
  partyName: string;
  voteCount: number;
  percentage: number;
}

export interface LGAResults {
  lgaId: string;
  lgaName: string;
  results: ResultSummary[];
}

// Common Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Filter Types
export interface FilterOptions {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
