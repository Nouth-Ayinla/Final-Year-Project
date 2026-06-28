import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export const GetVoterElection = async (req: Request, res: Response) => {
  try {


const data = await prisma.election.findMany({
  where: {
    status: {
      not: "DRAFT",
    },
  },
  select: {
    id: true,
    title: true,
    description: true,
    startDate: true,
    endDate: true,
    status: true,
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
    console.error("Error fetching elections:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch elections",
    });
  }
};
