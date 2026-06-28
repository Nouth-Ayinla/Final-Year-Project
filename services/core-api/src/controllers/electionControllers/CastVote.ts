import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

interface AuthenticatedUser {
  id: string;
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  params: {
    candidateId: string;
  };
}

export const CastVote = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { candidateId } = req.params;
    const voterId = req.user?.id;

    if (!voterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
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
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    const election = candidate.election;

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    const now = new Date();

    if (now < election.startDate) {
      return res.status(400).json({
        success: false,
        message: "Election has not started",
      });
    }

    if (now > election.endDate) {
      return res.status(400).json({
        success: false,
        message: "Election has ended",
      });
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

      return res.status(400).json({
        success: false,
        message: "You have already voted in this election",
      });
    }

    const vote = await prisma.vote.create({
      data: {
        voterId,
        electionId: election.id,
        candidateId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Vote cast successfully",
      vote,
    });
  } catch (error) {
    console.error("Cast Vote Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};