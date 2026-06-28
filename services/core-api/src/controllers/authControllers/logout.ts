import { Request, Response } from "express";

export const logout = async (req: Request, res: Response) => {
  try {
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

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
