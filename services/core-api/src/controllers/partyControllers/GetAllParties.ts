import { AppError } from "../../utils/errors.js";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";

export const GetAllParties = async (req: Request, res: Response, next: NextFunction) => {
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
    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Failed to load political parties due to internal server error.`));
  }
};
