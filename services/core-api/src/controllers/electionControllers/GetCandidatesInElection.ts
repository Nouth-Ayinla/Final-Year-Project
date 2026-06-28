import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export const GetCandidatesInElection = async (req: Request, res: Response) => {
  const { electionId } = req.params;

  if (!electionId || typeof electionId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid election ID",
    });
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

    return res.status(500).json({
      success: false,
      message: "Failed to fetch election candidates",
    });
  }
};