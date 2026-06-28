import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export const DeleteOfficer = async (req: Request, res: Response) => {
  try {
    const officerId = req.params.officerId as string;

    if (!officerId) {
      return res.status(400).json({
        success: false,
        message: "Invalid officer Id",
      });
    }

    const officer = await prisma.admin.findUnique({
      where: {
        id: officerId,
      },
    });

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer not found",
      });
    }
    if (officer.role === "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "System admin cannot be deleted",
      });
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

    return res.status(500).json({
      success: false,
      message: "Error deleting Officer",
    });
  }
};
