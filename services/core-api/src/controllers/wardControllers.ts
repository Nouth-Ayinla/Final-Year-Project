import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const CreateWard = async (req: Request, res: Response) => {
  const { name, code, lgaName } = req.body;

  try {
    if (!name || !code || !lgaName) {
      return res.status(400).json({
        success: false,
        message: "name, code, and lgaName are required fields.",
      });
    }

    const existingWard = await prisma.ward.findUnique({
      where: { code },
    });

    if (existingWard) {
      return res.status(400).json({
        success: false,
        message: `Ward with code '${code}' already exists.`,
      });
    }

    const newWard = await prisma.ward.create({
      data: {
        name,
        code,
        lgaName,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Ward created successfully",
      data: newWard,
    });
  } catch (error: any) {
    console.error("Error in CreateWard controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const GetWards = async (req: Request, res: Response) => {
  const { lgaName } = req.query;

  try {
    const filter: any = {};
    if (lgaName && typeof lgaName === "string") {
      filter.lgaName = lgaName;
    }

    const wards = await prisma.ward.findMany({
      where: filter,
      orderBy: { name: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: wards,
    });
  } catch (error: any) {
    console.error("Error in GetWards controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
