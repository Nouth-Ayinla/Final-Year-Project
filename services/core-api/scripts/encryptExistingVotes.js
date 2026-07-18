#!/usr/bin/env node

/**
 * Vote Encryption Migration Script
 * 
 * This script encrypts all existing plaintext votes in the database.
 * 
 * Usage:
 *   node encryptExistingVotes.js
 * 
 * Requirements:
 *   - VOTE_ENCRYPTION_KEY environment variable must be set
 *   - Database must be accessible
 */

import { prisma } from '../src/lib/prisma.js';
import { voteEncryption } from '../src/utils/voteEncryption.js';
import dotenv from 'dotenv';

dotenv.config();

async function encryptExistingVotes() {
  try {
    const encryptionKey = process.env.VOTE_ENCRYPTION_KEY;
    
    if (!encryptionKey) {
      console.error('❌ ERROR: VOTE_ENCRYPTION_KEY environment variable not set');
      process.exit(1);
    }

    console.log('🔐 Starting vote encryption migration...\n');

    // Find all votes that don't have encryption fields
    const unencryptedVotes = await prisma.vote.findMany({
      where: {
        encryptedVotePayload: null,
      },
    });

    if (unencryptedVotes.length === 0) {
      console.log('✅ All votes are already encrypted.');
      process.exit(0);
    }

    console.log(`📊 Found ${unencryptedVotes.length} votes to encrypt\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const vote of unencryptedVotes) {
      try {
        // Encrypt vote payload
        const { encryptedVotePayload, iv } = voteEncryption.encryptVote(
          vote.candidateId,
          vote.electionId,
          encryptionKey
        );

        // Generate voter anonymization token
        const voterTokenHash = voteEncryption.generateVoterTokenHash(
          vote.voterId,
          vote.electionId
        );

        // Generate vote integrity hash
        const voteHash = voteEncryption.generateVoteHash(
          vote.candidateId,
          voterTokenHash
        );

        // Update vote with encryption fields
        await prisma.vote.update({
          where: { id: vote.id },
          data: {
            encryptedVotePayload,
            encryptionIv: iv,
            voterTokenHash,
            voteHash,
          },
        });

        successCount++;
        if (successCount % 100 === 0) {
          console.log(`✓ Encrypted ${successCount}/${unencryptedVotes.length} votes`);
        }
      } catch (error) {
        errorCount++;
        console.error(`✗ Failed to encrypt vote ${vote.id}:`, error);
      }
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`   Encrypted: ${successCount} votes`);
    console.log(`   Errors: ${errorCount} votes`);

    if (errorCount === 0) {
      console.log('\n🎉 All votes encrypted successfully!');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

encryptExistingVotes();
