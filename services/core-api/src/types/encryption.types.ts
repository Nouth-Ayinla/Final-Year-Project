/**
 * Vote Encryption Type Definitions
 * Provides TypeScript interfaces for encryption operations
 */

export interface VotePayload {
  candidateId: string;
  electionId: string;
  timestamp: number;
}

export interface EncryptedVoteData {
  encryptedVotePayload: string;
  iv: string;
}

export interface VoteRecord {
  id: string;
  voterId: string;
  electionId: string;
  candidateId: string;
  encryptedVotePayload?: string;
  encryptionIv?: string;
  voterTokenHash?: string;
  voteHash?: string;
  createdAt: Date;
}

export interface CandidateResult {
  id: string;
  firstName: string;
  surname: string;
  otherName?: string;
  party: {
    id: string;
    name: string;
    abbreviation: string;
  };
  votes: number;
  percentage: number;
}

export interface ElectionResults {
  election: {
    id: string;
    title: string;
    description?: string;
    status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'UPCOMING';
    startDate: Date;
    endDate: Date;
  };
  totalVotes: number;
  results: CandidateResult[];
  metadata: {
    decryptionErrors: number;
    processedAt: string;
  };
}

export interface VoteAuditEntry {
  voteId: string;
  candidateId?: string;
  voterTokenHash?: string;
  voteHash?: string;
  integrityVerified?: boolean;
  castAt: Date;
  error?: string;
}

export interface VoteAuditLog {
  electionId: string;
  totalVotes: number;
  auditLog: VoteAuditEntry[];
}

export interface VoteCastResponse {
  success: boolean;
  message: string;
  vote?: {
    id: string;
    electionId: string;
    createdAt: Date;
  };
  error?: string;
}

export interface EncryptionKeyConfig {
  voteEncryptionKey: string;
  voterTokenSalt: string;
  voteHashSalt: string;
}

export interface EncryptionError {
  code: 'INVALID_KEY' | 'ENCRYPTION_FAILED' | 'DECRYPTION_FAILED' | 'INTEGRITY_FAILED';
  message: string;
  voteId?: string;
}
