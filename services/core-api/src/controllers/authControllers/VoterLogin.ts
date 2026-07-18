import { AppError } from "../../utils/errors.js";
import { prisma } from "../../lib/prisma.js";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { generateToken } from "../../lib/generateToken.js";

export const VoterLogin = async (req: Request, res: Response, next: NextFunction) => {
  const { identifier, password } = req.body;

  try {
    if (!identifier || !password) {
      return next(new AppError(400, "INVALID_INPUT", `All fields are required`));
    }

    const user = await prisma.voter.findFirst({
      where: {
        OR: [{ email: identifier }, { voterId: identifier }],
      },
      select: {
        id: true,
        email: true,
        voterId: true,
        password: true,
        isActivated: true,
        firstName: true,
        surname: true,
        otherName: true,
        profilePicture: true,
        DOB: true,
        sex: true,
        maritalStatus: true,
        state: true,
        LGA: true,
        education: true,
        residentialAddress: true,
      },
    });

    if (!user) {
      return next(new AppError(400, "INVALID_INPUT", `Invalid credentials`));
    }

    if (!user.isActivated) {
      return next(new AppError(400, "INVALID_INPUT", `Account not activated`));
    }

    if (!user.password) {
      return next(new AppError(400, "INVALID_INPUT", `No password set for this account`));
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return next(new AppError(400, "INVALID_INPUT", `Incorrect password`));
    }

    generateToken(user.id, res);

    return res.status(200).json({
      message: "Login successful",
      data: user,
    });
  } catch (error) {
    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Internal Server Error`));
  }
};
