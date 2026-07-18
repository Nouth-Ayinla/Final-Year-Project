import { AppError } from "../../utils/errors.js";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";

export const GetRegisteredVoters = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.voter.findMany({
      select: {
        id: true,
        firstName: true,
        surname: true,
        otherName: true,
        email: true,
        profilePicture: true,
        DOB: true,
        sex: true,
        maritalStatus: true,
        state: true,
        LGA: true,
        ward: true,
        education: true,
        residentialAddress: true,
        voterId: true,
        isActivated: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    console.error("Error fetching voters:", error);

    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Failed to fetch voters`));
  }
};