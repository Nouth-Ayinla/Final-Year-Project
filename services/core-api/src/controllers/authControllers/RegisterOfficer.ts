import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { AuthRequest } from "../../lib/authType.js";
import { GenerateadminId, Generatepin } from "../../utils/utilities.js";
import { sendEmail } from "../../lib/email.service.js";
import { RegisterOfficerTemplate } from "../../utils/emailTemplates.js";
import bcrypt from "bcrypt";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary.js";

export const RegisterOfficer = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const {
    firstName,
    surname,
    otherName,
    email,
    DOB,
    sex,
    maritalStatus,
    state,
    LGA,
    education,
    residentialAddress,
    role,
  } = req.body;
  try {
    if (role === "SUPER_ADMIN" || role === "ELECTION_ADMIN") {
      const requestingUserRole = authReq.user?.role;
      if (requestingUserRole !== "SUPER_ADMIN") {
        return res.status(403).json({
          message: "Access denied: Only Super Admin can register an Admin",
        });
      }
    }

    if (
      !firstName ||
      !surname ||
      !email ||
      !DOB ||
      !sex ||
      !maritalStatus ||
      !state ||
      !LGA ||
      !education ||
      !residentialAddress
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Profile image is required" });
    }

    const uploadedImage: any = await uploadToCloudinary(file.buffer);
    const profilePicture = uploadedImage.secure_url;

    const existingUser = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const generatedAdminId = GenerateadminId();
    const generatedActivationPin = Generatepin();

    const hashedPin = await bcrypt.hash(generatedActivationPin, 10);

    const newOfficer = await prisma.admin.create({
      data: {
        firstName,
        surname,
        otherName,
        profilePicture: profilePicture,
        email,
        DOB,
        sex,
        maritalStatus,
        state,
        LGA,
        education,
        residentialAddress,
        adminId: generatedAdminId,
        activationPin: hashedPin,
        role: role || "REGISTRATION_OFFICER",
      },
    });

    await sendEmail({
      to: email,
      subject: "OndoDecide Officer Registration",
      html: RegisterOfficerTemplate(
        firstName,
        generatedAdminId,
        generatedActivationPin,
      ),
    });

    return res.status(201).json({
      data: newOfficer,
      message: "Officer registered successfully",
    });
  } catch (error: any) {
    console.error("RegisterOfficer error:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        message: "Admin ID already exists",
      });
    }
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
