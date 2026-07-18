import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { AppError } from "../utils/errors.js";

export const requestTracer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  (req as any).traceId = crypto.randomUUID();
  next();
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const timestamp = new Date().toISOString();
  const traceId = (req as any).traceId || crypto.randomUUID();

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        details: err.details,
        timestamp,
        traceId,
      },
    });
  }

  // Handle unexpected or library internal errors
  console.error("Unhandled server error:", err);

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred on the server.",
      details: [],
      timestamp,
      traceId,
    },
  });
};
