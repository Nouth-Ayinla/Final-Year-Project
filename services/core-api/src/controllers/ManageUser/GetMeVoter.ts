import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role?: string;
  };
}

export const getMeVoter = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
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
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("GetMe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};