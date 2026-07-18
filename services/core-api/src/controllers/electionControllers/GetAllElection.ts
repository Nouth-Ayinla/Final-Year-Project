import { AppError } from "../../utils/errors.js";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";

export const GetAllElection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.election.findMany({
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
    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Failed to fetch elections`));
  }
};
