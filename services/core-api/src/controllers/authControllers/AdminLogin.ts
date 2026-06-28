import { prisma } from "../../lib/prisma.js";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { generateToken } from "../../lib/generateToken.js";

export const AdminLogin = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  try {
    if (!identifier || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const user = await prisma.admin.findFirst({
      where: {
        OR: [{ email: identifier }, { adminId: identifier }],
      },
      select: {
        id: true,
        email: true,
        adminId: true,
        password: true,
        isActivated: true,
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    if (!user.isActivated) {
      return res.status(400).json({
        message: "Account not activated",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "No password set for this account",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Incorrect password",
      });
    }

    generateToken(user.id, res);

    return res.status(200).json({
      message: "Login successful",
      data: user,
    });
  } catch (error) {
    console.log("Error in Admin Login", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
