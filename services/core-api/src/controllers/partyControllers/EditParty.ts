import { AppError } from "../../utils/errors.js";
import { Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { AuthRequest } from "../../lib/authType.js";

export const EditParty = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Role verification
    if (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "ELECTION_ADMIN") {
      return next(new AppError(403, "FORBIDDEN", `Access denied: Only administrators can update political parties.`));
    }

    const partyId = req.params.partyId as string;
    const { name, primaryColor, secondaryColor, description, isActive } = req.body;

    if (!partyId) {
      return next(new AppError(400, "INVALID_INPUT", `Party ID is required.`));
    }

    // Check if party exists
    const party = await prisma.party.findUnique({
      where: { id: partyId },
    });

    if (!party) {
      return next(new AppError(404, "RESOURCE_NOT_FOUND", `Political party not found.`));
    }

    // Validate unique name if name is changed
    if (name && name.trim() !== party.name) {
      const nameExists = await prisma.party.findUnique({
        where: { name: name.trim() },
      });
      if (nameExists) {
        return next(new AppError(400, "INVALID_INPUT", `A party with name "${name}" already exists.`));
      }
    }

    const updatedParty = await prisma.party.update({
      where: { id: partyId },
      data: {
        name: name ? name.trim() : party.name,
        primaryColor: primaryColor ? primaryColor.trim() : party.primaryColor,
        secondaryColor: secondaryColor ? secondaryColor.trim() : party.secondaryColor,
        description: description !== undefined ? description.trim() : party.description,
        isActive: isActive !== undefined ? isActive : party.isActive,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Political party updated successfully.",
      party: updatedParty,
    });
  } catch (error) {
    console.error("Edit Party Error:", error);
    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Failed to update political party due to internal server error.`));
  }
};
