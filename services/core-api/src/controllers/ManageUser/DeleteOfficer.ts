import { AppError } from "../../utils/errors.js";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";

export const DeleteOfficer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const officerId = req.params.officerId as string;

    if (!officerId) {
      return next(new AppError(400, "INVALID_INPUT", `Invalid officer Id`));
    }

    const officer = await prisma.admin.findUnique({
      where: {
        id: officerId,
      },
    });

    if (!officer) {
      return next(new AppError(404, "RESOURCE_NOT_FOUND", `Officer not found`));
    }
    if (officer.role === "SUPER_ADMIN") {
      return next(new AppError(403, "FORBIDDEN", `System admin cannot be deleted`));
    }
    await prisma.admin.delete({
      where: {
        id: officerId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Officer deleted successfully",
    });
  } catch (error) {
    console.log("Error deleting Officer", error);

    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Error deleting Officer`));
  }
};
