import { Request, Response } from "express";

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const checkAuth = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
       return res.status(401).json({ message: "Not authenticated" });
    }
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};