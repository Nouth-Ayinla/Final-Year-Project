import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

interface Params {
  electionId: string;
}

export const GetCandidateInElectionMobileSide = async (
  req: Request<Params>,
  res: Response,
) => {
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

    return res.status(500).json({
      success: false,
      message: "Failed to fetch election candidates",
    });
  }
};
