import crypto from 'crypto';

/**
 * Vote Encryption Utility
 * Provides encryption/decryption for votes and voter anonymization
 */

export const voteEncryption = {
  /**
   * Encrypt vote payload (candidate ID + election ID)
   * Uses AES-256-CBC for symmetric encryption
   */
  encryptVote: (candidateId: string, electionId: string, key: string) => {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(key, 'hex'),
        iv
      );

      const votePayload = JSON.stringify({
        candidateId,
        electionId,
        timestamp: Date.now(),
      });

      let encrypted = cipher.update(votePayload, 'utf-8', 'hex');
      encrypted += cipher.final('hex');

      return {
        encryptedVotePayload: encrypted,
        iv: iv.toString('hex'),
      };
    } catch (error) {
      throw new Error(
        `Vote encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  /**
   * Decrypt vote payload (for admins viewing results)
   * Requires proper encryption key
   */
  decryptVote: (encryptedData: string, iv: string, key: string) => {
    try {
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(key, 'hex'),
        Buffer.from(iv, 'hex')
      );

      let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
      decrypted += decipher.final('utf-8');

      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error(
        `Vote decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  /**
   * Generate anonymous voter token hash
   * Protects voter privacy by breaking direct voter-to-vote link
   * Uses voter ID + election ID combination hashed with SHA-256
   */
  generateVoterTokenHash: (voterId: string, electionId: string): string => {
    return crypto
      .createHash('sha256')
      .update(`${voterId}:${electionId}:${process.env.VOTER_TOKEN_SALT || 'default'}`)
      .digest('hex');
  },

  /**
   * Generate vote integrity hash
   * Prevents vote tampering by creating unique hash of vote
   * Uses candidate ID + voter token hash
   */
  generateVoteHash: (candidateId: string, voterTokenHash: string): string => {
    return crypto
      .createHash('sha256')
      .update(`${candidateId}:${voterTokenHash}:${process.env.VOTE_HASH_SALT || 'default'}`)
      .digest('hex');
  },

  /**
   * Verify vote integrity
   * Compares stored vote hash with recalculated hash
   */
  verifyVoteIntegrity: (
    candidateId: string,
    voterTokenHash: string,
    storedHash: string
  ): boolean => {
    const calculatedHash = voteEncryption.generateVoteHash(
      candidateId,
      voterTokenHash
    );
    return crypto.timingSafeEqual(
      Buffer.from(calculatedHash),
      Buffer.from(storedHash)
    );
  },

  /**
   * Generate encryption key if not provided
   * Should be called during app initialization
   */
  generateEncryptionKey: (): string => {
    return crypto.randomBytes(32).toString('hex');
  },
};

/**
 * Validate encryption key format
 */
export const validateEncryptionKey = (key: string): boolean => {
  // Key should be 64 characters (32 bytes in hex)
  return /^[a-f0-9]{64}$/.test(key);
};

export default voteEncryption;
