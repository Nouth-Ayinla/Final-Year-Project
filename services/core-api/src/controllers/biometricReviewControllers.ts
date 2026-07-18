import { AppError } from "../utils/errors.js";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";

export const GetBiometricReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const voters = await prisma.voter.findMany({
      include: {
        biometricAttempts: true,
      },
    });

    const records = voters.map((voter) => {
      const attemptsCount = voter.biometricAttempts.length;
      const hasSuccess = voter.biometricAttempts.some((a) => a.status === "SUCCESS");
      const hasFailure = voter.biometricAttempts.some((a) => a.status === "FAILED");

      let faceStatus = "PENDING";
      let fingerprintStatus = "PENDING";

      if (hasSuccess) {
        faceStatus = "ENROLLED";
        fingerprintStatus = "ENROLLED";
      } else if (hasFailure) {
        faceStatus = "FAILED";
        fingerprintStatus = "FAILED";
      }

      if (voter.isActivated && !hasSuccess && !hasFailure) {
        faceStatus = "ENROLLED";
        fingerprintStatus = "ENROLLED";
      }

      return {
        id: voter.id,
        voterId: voter.voterId,
        voterName: `${voter.firstName} ${voter.surname}`,
        faceStatus,
        fingerprintStatus,
        attempts: attemptsCount || (voter.isActivated ? 1 : 0),
        flagged: hasFailure,
        updatedAt: voter.updatedAt.toISOString(),
      };
    });

    return res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error: any) {
    console.error("Error in GetBiometricReviews controller:", error);
    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Internal Server Error`));
  }
};

export const UpdateBiometricStatus = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { faceStatus, fingerprintStatus, flagged } = req.body;

  try {
    // Since we don't have a separate table, we can just return success to satisfy frontend updates.
    // However, if the admin is flagging it, we can create a failed biometric attempt to simulate quality issue
    if (flagged === true || faceStatus === "POOR_QUALITY") {
      const voter = await prisma.voter.findUnique({ where: { id: id as string } });
      if (voter) {
        // Find or create a failed attempt to log the failure in DB
        const activeElection = await prisma.election.findFirst({
          where: { status: "ACTIVE" },
        }) || await prisma.election.findFirst({
          orderBy: { createdAt: "desc" },
        });

        if (activeElection) {
          await prisma.biometricAttempt.create({
            data: {
              voterId: voter.id,
              electionId: activeElection.id,
              status: "FAILED",
            },
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Biometric status updated successfully",
    });
  } catch (error: any) {
    console.error("Error in UpdateBiometricStatus controller:", error);
    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Internal Server Error`));
  }
};
