import { AppError } from "../../utils/errors.js";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";

export const GetRegisteredOfficers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.admin.findMany({
      select: {
        id: true,
        firstName: true,
        surname: true,
        email: true,
        adminId: true,
        state: true,
      },
    });

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    console.error("Error fetching officers:", error);

    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Failed to fetch officers`));
  }
};