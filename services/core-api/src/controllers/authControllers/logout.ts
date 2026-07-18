import { AppError } from "../../utils/errors.js";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";
import { logAudit } from "../../utils/auditLogger.js";

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.jwt;
    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "my-super-secret-key");
        if (decoded && decoded.userId) {
          const admin = await prisma.admin.findUnique({ where: { id: decoded.userId } });
          if (admin) {
            await logAudit(admin.email, "LOGOUT", "Admin", admin.adminId);
          }
        }
      } catch (err) {
        console.error("Error decoding token in logout:", err);
      }
    }

    res.cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    });

    return res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error: any) {
    console.log("Error in LogOutController", error.message);

    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Internal Server Error`));
  }
};
