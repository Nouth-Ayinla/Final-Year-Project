import { Response, NextFunction } from "express";
import { AuthRequest } from "../lib/authType.js";
import { AppError } from "../utils/errors.js";

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new AppError(401, "UNAUTHORIZED", "Not authenticated"));
  }

  if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "ELECTION_ADMIN") {
    return next(new AppError(403, "FORBIDDEN", "Access denied: Admins only"));
  }

  next();
};