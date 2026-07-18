import { AppError } from "../../utils/errors.js";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";

export const DeleteVoter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const voterId = req.params.voterId as string;

    if (!voterId) {
      return next(new AppError(400, "INVALID_INPUT", `Invalid officer Id`));
    }

    const voter = await prisma.voter.findUnique({
      where: {
        id: voterId,
      },
    });

    if (!voter) {
      return next(new AppError(404, "RESOURCE_NOT_FOUND", `voter not found`));
    }
    await prisma.voter.delete({
      where: {
        id: voterId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "voter deleted successfully",
    });
  } catch (error) {
    console.log("Error deleting voter", error);

    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Error deleting voter`));
  }
};
