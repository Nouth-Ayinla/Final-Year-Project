import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../lib/authType.js";
import { AppError } from "../utils/errors.js";

export const protectRoute = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    let token = req.cookies?.jwt;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError(401, "UNAUTHORIZED", "User not logged in"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };

    if (!decoded?.userId) {
      return next(new AppError(401, "UNAUTHORIZED", "Invalid token"));
    }

    let user = await prisma.voter.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        firstName: true,
        surname: true,
        email: true,
        profilePicture: true,
      },
    });
    let role: "SUPER_ADMIN" | "ELECTION_ADMIN" | "REGISTRATION_OFFICER" | "MONITORING_OFFICER" | "RESULTS_OFFICER" | "VOTER" = "VOTER";

    if (!user) {
      const adminUser = await prisma.admin.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          firstName: true,
          surname: true,
          email: true,
          profilePicture: true,
          role: true,
        },
      });

      if (!adminUser) {
        return next(new AppError(404, "USER_NOT_FOUND", "User not found"));
      }

      user = adminUser;
      let normRole = adminUser.role as string;
      if (normRole === "ADMIN") normRole = "SUPER_ADMIN";
      if (normRole === "OFFICER") normRole = "REGISTRATION_OFFICER";
      role = normRole as any;
    }

    req.user = {
      ...user,
      role,
    };

    next();
  } catch (error: any) {
    console.log("Error in protectRoute middleware:", error.message);
    return next(new AppError(401, "UNAUTHORIZED", "Authorization failed"));
  }
};
