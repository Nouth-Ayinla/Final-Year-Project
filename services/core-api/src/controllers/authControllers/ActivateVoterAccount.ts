import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../lib/generateToken.js";

export const ActivateVoterAccount = async (req: Request, res: Response) => {
  const { voterId, activationPin, password } = req.body;

  try {
    if (!voterId || !activationPin || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
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
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "Voter not found",
      });
    }

    if (user.isActivated) {
      return res.status(400).json({
        message: "Account already activated",
      });
    }

    const isPinCorrect = await bcrypt.compare(
      activationPin,
      user.activationPin,
    );

    if (!isPinCorrect) {
      return res.status(400).json({
        message: "Invalid activation pin",
      });
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

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
