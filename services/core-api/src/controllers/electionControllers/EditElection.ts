import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export const EditElection = async (req: Request, res: Response) => {
  const { electionId } = req.params as { electionId: string };
  const { title, description, startDate, endDate, status } = req.body;

  try {
    const election = await prisma.election.findUnique({
      where: {
        id: electionId,
      },
    });

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
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

    return res.status(500).json({
      success: false,
      message: "Failed to edit election",
    });
  }
};
