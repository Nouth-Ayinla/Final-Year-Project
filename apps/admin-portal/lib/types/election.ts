export type ElectionStatus = 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'ARCHIVED';

export type ElectionRules = {
  allowOneVotePerVoter: boolean;
  requireFaceVerification: boolean;
  requireFingerprintVerification: boolean;
  allowResultsBeforeClose: boolean;
};

export type Election = {
  id: string;
  title: string;
  slug: string;
  officeType: 'GOVERNORSHIP';
  state: string;
  description: string;
  electionDate: string;
  registrationStartsAt: string;
  registrationEndsAt: string;
  votingStartsAt: string;
  votingEndsAt: string;
  status: ElectionStatus;
  rules: ElectionRules;
  createdBy: string;
  updatedAt: string;
  publishedAt?: string;
  closedAt?: string;
};

export type ElectionFormValues = Omit<
  Election,
  'id' | 'slug' | 'officeType' | 'state' | 'status' | 'createdBy' | 'updatedAt' | 'publishedAt' | 'closedAt'
>;
