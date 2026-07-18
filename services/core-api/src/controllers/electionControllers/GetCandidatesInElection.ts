import { AppError } from "../../utils/errors.js";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";

export const GetCandidatesInElection = async (req: Request, res: Response, next: NextFunction) => {
  const { electionId } = req.params;

  if (!electionId || typeof electionId !== "string") {
    return next(new AppError(400, "INVALID_INPUT", `Invalid election ID`));
  }

  try {
    const data = await prisma.candidate.findMany({
      where: {
        electionId,
      },
      select: {
        id : true,
        firstName: true,
        surname: true,
        otherName: true,
        party: true,
        election : true,
        electionId : true,
        state :true,
        imageUrl : true,
        DOB: true,
        sex: true,
        _count:{
          select: {
            votes: true
          }
        }
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