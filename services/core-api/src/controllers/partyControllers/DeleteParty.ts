import { AppError } from "../../utils/errors.js";
import { Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { AuthRequest } from "../../lib/authType.js";

export const DeleteParty = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Role verification
    if (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "ELECTION_ADMIN") {
      return next(new AppError(403, "FORBIDDEN", `Access denied: Only administrators can delete political parties.`));
    }

    const partyId = req.params.partyId as string;

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

    // 2. Prevent deletion if candidates are linked (for structural integrity)
    const candidatesCount = await prisma.candidate.count({
      where: { partyId: partyId },
    });

    if (candidatesCount > 0) {
      // Toggle to inactive instead
      await prisma.party.update({
        where: { id: partyId },
        data: { isActive: false },
      });

      return res.status(200).json({
        success: true,
        message: "Party cannot be deleted because candidates are assigned to it. It has been deactivated instead.",
      });
    }

    // 3. Perform hard delete if no candidates are linked
    await prisma.party.delete({
      where: { id: partyId },
    });

    return res.status(200).json({
      success: true,
      message: "Political party deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Party Error:", error);
    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Failed to delete political party due to internal server error.`));
  }
};
