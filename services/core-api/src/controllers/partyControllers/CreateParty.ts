import { Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { AuthRequest } from "../../lib/authType.js";

export const CreateParty = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Role verification
    if (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "ELECTION_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Only administrators can register political parties.",
      });
    }

    const { name, abbreviation, primaryColor, secondaryColor, description } = req.body;

    if (!name || !abbreviation) {
      return res.status(400).json({
        success: false,
        message: "Party name and abbreviation are required.",
      });
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
      return res.status(400).json({
        success: false,
        message: `A political party with name "${name}" or abbreviation "${abbrUpper}" already exists.`,
      });
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
    return res.status(500).json({
      success: false,
      message: "Failed to register political party due to internal server error.",
    });
  }
};
