import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const CreateElection = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { title, description, startDate, endDate } = req.body;

  if (!title || !description || !startDate || !endDate) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: {
        id: req.user.id,
      },
    });

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    if (!admin.isActivated) {
      return res.status(403).json({
        message: "Account not activated",
      });
    }

    if (admin.role !== "SUPER_ADMIN" && admin.role !== "ELECTION_ADMIN") {
      return res.status(403).json({
        message: "Only super admins and election admins can create elections",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    const existingElection = await prisma.election.findFirst({
      where: {
        title,
      },
    });

    if (existingElection) {
      return res.status(409).json({
        message: "Election already exists",
      });
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

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
