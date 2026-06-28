import { Response, NextFunction } from "express";
import { AuthRequest } from "../lib/authType.js";


export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "ELECTION_ADMIN") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }

  next();
};