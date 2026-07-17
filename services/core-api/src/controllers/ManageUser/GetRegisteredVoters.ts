import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export const GetRegisteredVoters = async (req: Request, res: Response) => {
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

    return res.status(500).json({
      success: false,
      message: "Failed to fetch voters",
    });
  }
};