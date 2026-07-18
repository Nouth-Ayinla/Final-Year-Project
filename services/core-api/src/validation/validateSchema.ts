import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "../utils/errors.js";

export const validateSchema = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((issue) => ({
          field: issue.path.join("."),
          issue: issue.code.toUpperCase(),
          message: issue.message,
        }));
        return next(new AppError(400, "VALIDATION_ERROR", "Validation failed", details));
      }
      return next(error);
    }
  };
};
