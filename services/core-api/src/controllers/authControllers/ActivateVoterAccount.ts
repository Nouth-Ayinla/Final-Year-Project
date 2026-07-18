import { AppError } from "../../utils/errors.js";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../lib/generateToken.js";

export const ActivateVoterAccount = async (req: Request, res: Response, next: NextFunction) => {
  const { voterId, activationPin, password } = req.body;

  try {
    if (!voterId || !activationPin || !password) {
      return next(new AppError(400, "INVALID_INPUT", `All fields are required`));
    }

    const user = await prisma.voter.findUnique({
      where: { voterId },
      select: {
        id: true,
        email: true,
        voterId: true,
        password: true,
        isActivated: true,
        activationPin: true,
        createdAt: true,
      },
    });

    if (!user) {
      return next(new AppError(404, "RESOURCE_NOT_FOUND", `Voter not found`));
    }

    if (user.isActivated) {
      return next(new AppError(400, "INVALID_INPUT", `Account already activated`));
    }

    const pinAgeMs = Date.now() - new Date(user.createdAt).getTime();
    const pinTtlMs = 24 * 60 * 60 * 1000; // 24 hours
    if (pinAgeMs > pinTtlMs) {
      return next(new AppError(400, "INVALID_INPUT", `Activation PIN has expired. Please contact your system administrator to generate a new PIN.`));
    }

    const isPinCorrect = await bcrypt.compare(
      activationPin,
      user.activationPin,
    );

    if (!isPinCorrect) {
      return next(new AppError(400, "INVALID_INPUT", `Invalid activation pin`));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const activatedUser = await prisma.voter.update({
      where: { voterId },
      data: {
        password: hashedPassword,
        isActivated: true,
      },
    });

    generateToken(activatedUser.id, res);

    return res.status(200).json({
      message: "Account activated successfully",
      data: activatedUser,
    });
  } catch (error) {
    console.log("Error in Activate Voter Controller", error);

    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Internal Server Error`));
  }
};
