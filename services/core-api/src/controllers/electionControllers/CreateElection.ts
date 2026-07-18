import { AppError } from "../../utils/errors.js";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const CreateElection = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { title, description, startDate, endDate } = req.body;

  if (!title || !description || !startDate || !endDate) {
    return next(new AppError(400, "INVALID_INPUT", `All fields are required`));
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: {
        id: req.user.id,
      },
    });

    if (!admin) {
      return next(new AppError(404, "RESOURCE_NOT_FOUND", `Admin not found`));
    }

    if (!admin.isActivated) {
      return next(new AppError(403, "FORBIDDEN", `Account not activated`));
    }

    if (admin.role !== "SUPER_ADMIN" && admin.role !== "ELECTION_ADMIN") {
      return next(new AppError(403, "FORBIDDEN", `Only super admins and election admins can create elections`));
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return next(new AppError(400, "INVALID_INPUT", `Invalid date format`));
    }

    if (start >= end) {
      return next(new AppError(400, "INVALID_INPUT", `End date must be after start date`));
    }

    const existingElection = await prisma.election.findFirst({
      where: {
        title,
      },
    });

    if (existingElection) {
      return next(new AppError(409, "CONFLICT", `Election already exists`));
    }

    const election = await prisma.election.create({
      data: {
        title,
        description,
        startDate: start,
        endDate: end,
      },
    });

    return res.status(201).json({
      message: "Election created successfully",
      election,
    });
  } catch (error) {
    console.error(error);

    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Internal server error`));
  }
};
