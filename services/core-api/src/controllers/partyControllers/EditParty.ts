import { Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { AuthRequest } from "../../lib/authType.js";

export const EditParty = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Role verification
    if (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "ELECTION_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Only administrators can update political parties.",
      });
    }

    const partyId = req.params.partyId as string;
    const { name, primaryColor, secondaryColor, description, isActive } = req.body;

    if (!partyId) {
      return res.status(400).json({
        success: false,
        message: "Party ID is required.",
      });
    }

    // Check if party exists
    const party = await prisma.party.findUnique({
      where: { id: partyId },
    });

    if (!party) {
      return res.status(404).json({
        success: false,
        message: "Political party not found.",
      });
    }

    // Validate unique name if name is changed
    if (name && name.trim() !== party.name) {
      const nameExists = await prisma.party.findUnique({
        where: { name: name.trim() },
      });
      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: `A party with name "${name}" already exists.`,
        });
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
    return res.status(500).json({
      success: false,
      message: "Failed to update political party due to internal server error.",
    });
  }
};
