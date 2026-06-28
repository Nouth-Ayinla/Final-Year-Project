import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export const GetRegisteredOfficers = async (req: Request, res: Response) => {
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

    return res.status(500).json({
      success: false,
      message: "Failed to fetch officers",
    });
  }
};