import { AppError } from "../../utils/errors.js";
import { prisma } from "../../lib/prisma.js";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { generateToken } from "../../lib/generateToken.js";
import { logAudit } from "../../utils/auditLogger.js";

export const AdminLogin = async (req: Request, res: Response, next: NextFunction) => {
  const { identifier, password } = req.body;

  try {
    if (!identifier || !password) {
      return next(new AppError(400, "INVALID_INPUT", `All fields are required`));
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
      await logAudit(identifier, "LOGIN_FAILURE", "Admin", "unknown");
      return next(new AppError(400, "INVALID_INPUT", `Invalid credentials`));
    }

    if (!user.isActivated) {
      await logAudit(user.email, "LOGIN_FAILURE", "Admin", user.adminId);
      return next(new AppError(400, "INVALID_INPUT", `Account not activated`));
    }

    if (!user.password) {
      await logAudit(user.email, "LOGIN_FAILURE", "Admin", user.adminId);
      return next(new AppError(400, "INVALID_INPUT", `No password set for this account`));
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      await logAudit(user.email, "LOGIN_FAILURE", "Admin", user.adminId);
      return next(new AppError(400, "INVALID_INPUT", `Incorrect password`));
    }

    generateToken(user.id, res);

    await logAudit(user.email, "LOGIN_SUCCESS", "Admin", user.adminId);

    return res.status(200).json({
      message: "Login successful",
      data: user,
    });
  } catch (error) {
    console.log("Error in Admin Login", error);

    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Internal Server Error`));
  }
};
