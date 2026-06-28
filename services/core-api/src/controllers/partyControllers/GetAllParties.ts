import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export const GetAllParties = async (req: Request, res: Response) => {
  try {
    const parties = await prisma.party.findMany({
      orderBy: {
        abbreviation: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      parties,
    });
  } catch (error) {
    console.error("Get All Parties Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load political parties due to internal server error.",
    });
  }
};
