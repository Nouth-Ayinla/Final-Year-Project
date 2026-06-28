import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { Generatepin, GenerateVoterId } from "../../utils/utilities.js";
import { sendEmail } from "../../lib/email.service.js";
import { RegisterVoterTemplate } from "../../utils/emailTemplates.js";
import bcrypt from "bcrypt";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary.js";

export const RegisterVoter = async (req: Request, res: Response) => {
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
  } = req.body;
  try {
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

    const existingUser = await prisma.voter.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const generatedVoterId = GenerateVoterId();
    const generatedActivationPin = Generatepin();

    const hashedPin = await bcrypt.hash(generatedActivationPin, 10);

    const newVoter = await prisma.voter.create({
      data: {
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
        profilePicture: profilePicture,
        voterId: generatedVoterId,
        activationPin: hashedPin,
      },
    });
    await sendEmail({
      to: email,
      subject: "Votosi Registration",
      html: RegisterVoterTemplate(
        firstName,
        generatedVoterId,
        generatedActivationPin,
      ),
    });

    return res.status(201).json({
      data: newVoter,
      message: "Voter registered successfully",
    });
  } catch (error: any) {
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
