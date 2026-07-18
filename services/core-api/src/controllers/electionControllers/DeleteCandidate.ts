import { AppError } from "../../utils/errors.js";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";

export const DeleteCandidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidateId = req.params.candidateId as string;

    if (!candidateId) {
      return next(new AppError(400, "INVALID_INPUT", `Invalid candidate ID`));
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
      return next(new AppError(404, "RESOURCE_NOT_FOUND", `Candidate not found`));
    }

    if (candidate.election.status !== "DRAFT") {
      return next(new AppError(403, "FORBIDDEN", `Candidates can only be removed while the election is in draft state`));
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
    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Failed to remove candidate`));
  }
};
