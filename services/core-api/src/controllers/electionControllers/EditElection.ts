import { AppError } from "../../utils/errors.js";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";

export const EditElection = async (req: Request, res: Response, next: NextFunction) => {
  const { electionId } = req.params as { electionId: string };
  const { title, description, startDate, endDate, status } = req.body;

  try {
    const election = await prisma.election.findUnique({
      where: {
        id: electionId,
      },
    });

    if (!election) {
      return next(new AppError(404, "RESOURCE_NOT_FOUND", `Election not found`));
    }

    const updatedElection = await prisma.election.update({
      where: {
        id: electionId,
      },
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Election updated successfully",
      data: updatedElection,
    });
  } catch (error) {
    console.error("Error editing election:", error);

    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Failed to edit election`));
  }
};
