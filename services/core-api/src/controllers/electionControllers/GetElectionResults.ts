import { AppError } from "../../utils/errors.js";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { voteEncryption } from "../../utils/voteEncryption.js";

interface AuthenticatedUser {
  id: string;
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  params: {
    electionId: string;
  };
}

/**
 * Get election results with decrypted vote counts
 * ⚠️  ADMIN ONLY - Requires proper authorization
 * Decrypts votes to tally results
 */
export const GetElectionResults = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { electionId } = req.params;

    if (!electionId) {
      return next(new AppError(400, "INVALID_INPUT", "Election ID is required"));
    }

    const encryptionKey = process.env.VOTE_ENCRYPTION_KEY;
    if (!encryptionKey) {
      return next(new AppError(500, "INTERNAL_SERVER_ERROR", "Encryption key not configured"));
    }

    // Verify election exists
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: {
        candidates: {
          include: {
            party: true,
          },
        },
      },
    });

    if (!election) {
      return next(new AppError(404, "RESOURCE_NOT_FOUND", "Election not found"));
    }

    // Get all votes for this election
    const votes = await prisma.vote.findMany({
      where: { electionId },
    });

    // Initialize candidate vote counts
    const voteCounts: Record<string, number> = {};
    election.candidates.forEach((candidate) => {
      voteCounts[candidate.id] = 0;
    });

    // Decrypt and tally votes
    let decryptionErrors = 0;
    for (const vote of votes) {
      try {
        // Verify vote integrity first
        if (
          vote.voteHash &&
          vote.candidateId &&
          vote.voterTokenHash &&
          !voteEncryption.verifyVoteIntegrity(vote.candidateId, vote.voterTokenHash, vote.voteHash)
        ) {
          console.warn(`Vote ${vote.id} failed integrity check`);
          decryptionErrors++;
          continue;
        }

        // If encrypted, decrypt; otherwise use candidateId directly (for backward compatibility)
        let candidateId = vote.candidateId;
        if (vote.encryptedVotePayload && vote.encryptionIv) {
          const decrypted = voteEncryption.decryptVote(
            vote.encryptedVotePayload,
            vote.encryptionIv,
            encryptionKey
          );
          candidateId = decrypted.candidateId;
        }

        if (voteCounts.hasOwnProperty(candidateId)) {
          voteCounts[candidateId]++;
        }
      } catch (error) {
        console.error(`Failed to process vote ${vote.id}:`, error);
        decryptionErrors++;
      }
    }

    // Build results summary
    const results = election.candidates.map((candidate) => ({
      id: candidate.id,
      firstName: candidate.firstName,
      surname: candidate.surname,
      party: {
        id: candidate.party.id,
        name: candidate.party.name,
        abbreviation: candidate.party.abbreviation,
      },
      votes: voteCounts[candidate.id] || 0,
      percentage: votes.length > 0 ? ((voteCounts[candidate.id] || 0) / votes.length) * 100 : 0,
    }));

    // Sort by votes descending
    results.sort((a, b) => b.votes - a.votes);

    return res.status(200).json({
      success: true,
      data: {
        election: {
          id: election.id,
          title: election.title,
          status: election.status,
          startDate: election.startDate,
          endDate: election.endDate,
        },
        totalVotes: votes.length,
        results,
        metadata: {
          decryptionErrors,
          processedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Get Election Results Error:", error);
    return next(new AppError(500, "INTERNAL_SERVER_ERROR", "Failed to retrieve election results"));
  }
};

/**
 * Get detailed vote audit log (for verification purposes)
 * ⚠️  ADMIN ONLY - Returns anonymized but decrypted votes
 */
export const GetVoteAuditLog = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { electionId } = req.params;
    const encryptionKey = process.env.VOTE_ENCRYPTION_KEY;

    if (!encryptionKey) {
      return next(new AppError(500, "INTERNAL_SERVER_ERROR", "Encryption key not configured"));
    }

    const votes = await prisma.vote.findMany({
      where: { electionId },
      select: {
        id: true,
        candidateId: true,
        encryptedVotePayload: true,
        encryptionIv: true,
        voterTokenHash: true,
        voteHash: true,
        createdAt: true,
      },
    });

    const auditLog = votes.map((vote) => {
      try {
        const decrypted =
          vote.encryptedVotePayload && vote.encryptionIv
            ? voteEncryption.decryptVote(
                vote.encryptedVotePayload,
                vote.encryptionIv,
                encryptionKey
              )
            : { candidateId: vote.candidateId };

        return {
          voteId: vote.id,
          candidateId: decrypted.candidateId,
          voterTokenHash: vote.voterTokenHash, // Anonymized
          voteHash: vote.voteHash,
          integrityVerified: vote.voteHash
            ? voteEncryption.verifyVoteIntegrity(
                decrypted.candidateId,
                vote.voterTokenHash || "",
                vote.voteHash
              )
            : false,
          castAt: vote.createdAt,
        };
      } catch (error) {
        return {
          voteId: vote.id,
          error: "Failed to decrypt vote",
          castAt: vote.createdAt,
        };
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        electionId,
        totalVotes: auditLog.length,
        auditLog,
      },
    });
  } catch (error) {
    console.error("Get Vote Audit Log Error:", error);
    return next(new AppError(500, "INTERNAL_SERVER_ERROR", "Failed to retrieve audit log"));
  }
};
