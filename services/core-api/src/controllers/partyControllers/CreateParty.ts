import { AppError } from "../../utils/errors.js";
import { Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { AuthRequest } from "../../lib/authType.js";

export const CreateParty = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Role verification
    if (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "ELECTION_ADMIN") {
      return next(new AppError(403, "FORBIDDEN", `Access denied: Only administrators can register political parties.`));
    }

    const { name, abbreviation, primaryColor, secondaryColor, description } = req.body;

    if (!name || !abbreviation) {
      return next(new AppError(400, "INVALID_INPUT", `Party name and abbreviation are required.`));
    }

    const abbrUpper = abbreviation.trim().toUpperCase();

    // 2. Validate uniqueness
    const existing = await prisma.party.findFirst({
      where: {
        OR: [
          { abbreviation: abbrUpper },
          { name: name.trim() },
        ],
      },
    });

    if (existing) {
      return next(new AppError(400, "INVALID_INPUT", `A political party with name "${name}" or abbreviation "${abbrUpper}" already exists.`));
    }

    // 3. Create Party
    const party = await prisma.party.create({
      data: {
        name: name.trim(),
        abbreviation: abbrUpper,
        primaryColor: primaryColor?.trim() || "#78716c",
        secondaryColor: secondaryColor?.trim() || "#1e293b",
        description: description?.trim() || null,
        isActive: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Political party registered successfully.",
      party,
    });
  } catch (error) {
    console.error("Create Party Error:", error);
    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Failed to register political party due to internal server error.`));
  }
};
