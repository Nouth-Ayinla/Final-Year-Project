import { AppError } from "../../utils/errors.js";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role?: string;
  };
}

export const getMeVoter = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return next(new AppError(401, "UNAUTHORIZED", `Unauthorized`));
    }

    const user = await prisma.voter.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
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
        education: true,
        residentialAddress: true,
        voterId : true,
        role: true,
      },
    });

    if (!user) {
      return next(new AppError(404, "RESOURCE_NOT_FOUND", `User not found`));
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("GetMe error:", err);
    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Server error`));
  }
};