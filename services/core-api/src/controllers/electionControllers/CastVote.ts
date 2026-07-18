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
    candidateId: string;
  };
}

export const CastVote = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { candidateId } = req.params;
    const voterId = req.user?.id;

    if (!voterId) {
      return next(new AppError(401, "UNAUTHORIZED", `Unauthorized`));
    }

    const candidate = await prisma.candidate.findUnique({
      where: {
        id: candidateId,
      },
      include: {
        election: true,
      },
    });

    if (!candidate) {
      return next(new AppError(404, "RESOURCE_NOT_FOUND", `Candidate not found`));
    }

    const election = candidate.election;

    if (!election) {
      return next(new AppError(404, "RESOURCE_NOT_FOUND", `Election not found`));
    }

    const now = new Date();

    if (now < election.startDate) {
      return next(new AppError(400, "INVALID_INPUT", `Election has not started`));
    }

    if (now > election.endDate) {
      return next(new AppError(400, "INVALID_INPUT", `Election has ended`));
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        voterId_electionId: {
          voterId,
          electionId: election.id,
        },
      },
    });

    if (existingVote) {
      await prisma.duplicateVoteAttempt.create({
        data: {
          voterId,
          electionId: election.id,
          candidateId,
        },
      });

      return next(new AppError(400, "INVALID_INPUT", `You have already voted in this election`));
    }

    // Generate anonymous voter token hash (preserves secret ballot)
    const voterTokenHash = voteEncryption.generateVoterTokenHash(voterId, election.id);

    // Encrypt the vote payload
    const encryptionKey = process.env.VOTE_ENCRYPTION_KEY;
    if (!encryptionKey) {
      console.error("Missing VOTE_ENCRYPTION_KEY environment variable");
      return next(
        new AppError(500, "INTERNAL_SERVER_ERROR", `Encryption key not configured`)
      );
    }

    const { encryptedVotePayload, iv } = voteEncryption.encryptVote(
      candidateId,
      election.id,
      encryptionKey
    );

    // Generate vote hash for integrity verification
    const voteHash = voteEncryption.generateVoteHash(candidateId, voterTokenHash);

    const vote = await prisma.vote.create({
      data: {
        voterId,
        electionId: election.id,
        candidateId,
        // Encryption & Privacy Fields
        encryptedVotePayload,
        voterTokenHash,
        voteHash,
        encryptionIv: iv,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Vote cast successfully",
      vote,
    });
  } catch (error) {
    console.error("Cast Vote Error:", error);

    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Internal server error`));
  }
};