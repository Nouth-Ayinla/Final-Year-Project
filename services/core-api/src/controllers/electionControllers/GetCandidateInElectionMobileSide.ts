import { AppError } from "../../utils/errors.js";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";

interface Params {
  electionId: string;
}

export const GetCandidateInElectionMobileSide = async (req: Request<Params>, res: Response, next: NextFunction) => {
  const { electionId } = req.params;

  try {
    const data = await prisma.candidate.findMany({
      where: {
        electionId,
      },
      select: {
        id: true,
        firstName: true,
        surname: true,
        otherName: true,
        party: true,
        imageUrl: true,
        bio: true,
        electionId: true,
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching candidates:", error);

    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Failed to fetch election candidates`));
  }
};
