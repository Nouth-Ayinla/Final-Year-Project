import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export const DeleteCandidate = async (req: Request, res: Response) => {
  try {
    const candidateId = req.params.candidateId as string;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID",
      });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        election: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (candidate.election.status !== "DRAFT") {
      return res.status(403).json({
        success: false,
        message:
          "Candidates can only be removed while the election is in draft state",
      });
    }

    await prisma.candidate.delete({
      where: {
        id: candidateId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Candidate removed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove candidate",
    });
  }
};
