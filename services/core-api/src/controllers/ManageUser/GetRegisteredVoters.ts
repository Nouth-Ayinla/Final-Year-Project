import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export const GetRegisteredVoters = async (req: Request, res: Response) => {
  try {
    const data = await prisma.voter.findMany({
      select: {
        id: true,
        firstName: true,
        surname: true,
        email: true,
        voterId: true,
        state: true,
      },
    });

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    console.error("Error fetching voters:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch voters",
    });
  }
};