import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export const DeleteVoter = async (req: Request, res: Response) => {
  try {
    const voterId = req.params.voterId as string;

    if (!voterId) {
      return res.status(400).json({
        success: false,
        message: "Invalid officer Id",
      });
    }

    const voter = await prisma.voter.findUnique({
      where: {
        id: voterId,
      },
    });

    if (!voter) {
      return res.status(404).json({
        success: false,
        message: "voter not found",
      });
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

    return res.status(500).json({
      success: false,
      message: "Error deleting voter",
    });
  }
};
