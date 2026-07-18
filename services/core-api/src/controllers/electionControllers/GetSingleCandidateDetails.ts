import { AppError } from "../../utils/errors.js";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";

export const GetSingleCandidateDetails = async (req: Request, res: Response, next: NextFunction) => {
  const { electionId, candidateId } = req.params;

  if (!electionId || typeof electionId !== "string") {
    return next(new AppError(400, "INVALID_INPUT", `Invalid election ID`));
  }

  if (!candidateId || typeof candidateId !== "string") {
    return next(new AppError(400, "INVALID_INPUT", `Invalid candidate ID`));
  }

  try {
    const data = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        electionId: electionId,
      },
      select: {
        id: true,
        firstName: true,
        surname: true,
        otherName: true,
        DOB: true,
        sex: true,
        maritalStatus: true,
        state: true,
        LGA: true,
        education: true,
        bio: true,
        imageUrl: true,
        party: true,
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    if (!data) {
      return next(new AppError(404, "RESOURCE_NOT_FOUND", `Candidate not found`));
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching candidate:", error);

    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Failed to fetch election candidate`));
  }
};
