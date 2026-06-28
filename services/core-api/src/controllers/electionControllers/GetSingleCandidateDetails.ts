import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export const GetSingleCandidateDetails = async (
  req: Request,
  res: Response,
) => {
  const { electionId, candidateId } = req.params;

  if (!electionId || typeof electionId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid election ID",
    });
  }

  if (!candidateId || typeof candidateId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid candidate ID",
    });
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
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching candidate:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch election candidate",
    });
  }
};
