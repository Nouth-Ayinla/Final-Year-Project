-- Add encryption fields to Vote table
-- This migration adds support for vote encryption while maintaining backward compatibility

-- Add new columns for encryption
ALTER TABLE "Vote" ADD COLUMN "encryptedVotePayload" TEXT;
ALTER TABLE "Vote" ADD COLUMN "voterTokenHash" TEXT;
ALTER TABLE "Vote" ADD COLUMN "voteHash" TEXT;
ALTER TABLE "Vote" ADD COLUMN "encryptionIv" TEXT;

-- Create indexes for improved query performance
CREATE INDEX "Vote_voterTokenHash_idx" ON "Vote"("voterTokenHash");
CREATE INDEX "Vote_voteHash_idx" ON "Vote"("voteHash");

-- Add unique constraint on voteHash to ensure vote integrity
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_voteHash_key" UNIQUE("voteHash");

-- Note: Existing votes will have NULL values in these fields
-- A data migration script can be run to encrypt existing votes
-- See: docs/VOTE_ENCRYPTION.md for migration guidance
