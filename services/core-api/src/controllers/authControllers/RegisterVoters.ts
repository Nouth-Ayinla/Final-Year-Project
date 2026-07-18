import { AppError } from "../../utils/errors.js";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { Generatepin, GenerateVoterId } from "../../utils/utilities.js";
import { sendEmail } from "../../lib/email.service.js";
import { RegisterVoterTemplate } from "../../utils/emailTemplates.js";
import bcrypt from "bcrypt";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary.js";
import axios from 'axios';

export const RegisterVoter = async (req: Request, res: Response, next: NextFunction) => {
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
    ward,
    education,
    residentialAddress,
  } = req.body;

  try {
    /* -------------------------------------------------------------------------- */
    /*                               Validate Input                               */
    /* -------------------------------------------------------------------------- */

    if (
      !firstName ||
      !surname ||
      !email ||
      !DOB ||
      !sex ||
      !maritalStatus ||
      !state ||
      !LGA ||
      !ward ||
      !education ||
      !residentialAddress
    ) {
      return next(new AppError(400, "INVALID_INPUT", `All required fields must be provided`));
    }

    const file = req.file;

    if (!file) {
      return next(new AppError(400, "INVALID_INPUT", `Profile image is required`));
    }

    /* -------------------------------------------------------------------------- */
    /*                            Upload Profile Image                            */
    /* -------------------------------------------------------------------------- */

    const uploadedImage: any = await uploadToCloudinary(file.buffer);
    const profilePicture = uploadedImage.secure_url;

    /* -------------------------------------------------------------------------- */
    /*                          Check Existing Voter                              */
    /* -------------------------------------------------------------------------- */

    const existingUser = await prisma.voter.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return next(new AppError(400, "INVALID_INPUT", `User already exists`));
    }

    /* -------------------------------------------------------------------------- */
    /*                     Generate Credentials                                   */
    /* -------------------------------------------------------------------------- */

    const generatedVoterId = GenerateVoterId();
    const generatedActivationPin = Generatepin();

    const hashedPin = await bcrypt.hash(generatedActivationPin, 10);

    /* -------------------------------------------------------------------------- */
    /*                           Face Enrollment                                  */
    /* -------------------------------------------------------------------------- */

    try {
      const blob = new Blob([new Uint8Array(file.buffer)]);

      const formData = new FormData();

      formData.append("voter_id", generatedVoterId);
      formData.append("image", blob, file.originalname);

      console.log("Jesus is lord");

      const faceServiceResponse = await axios.post(
        `${process.env.FACE_SERVICE_URL}/face/enroll`,
        formData,
        {
          timeout: 30000,
        }
      );

      console.log(
        "Face enrollment successful:",
        faceServiceResponse.data
      );
    } catch (faceError) {
      console.error("Face enrollment failed:", faceError);

      return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Voter registration failed: face enrollment error`));
    }

    /* -------------------------------------------------------------------------- */
    /*                     Create Voter in Database                               */
    /* -------------------------------------------------------------------------- */

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
        ward,
        education,
        residentialAddress,
        profilePicture,
        voterId: generatedVoterId,
        activationPin: hashedPin,
      },
    });

    /* -------------------------------------------------------------------------- */
    /*                              Send Email                                    */
    /* -------------------------------------------------------------------------- */

    await sendEmail({
      to: email,
      subject: "Votosi Registration",
      html: RegisterVoterTemplate(
        firstName,
        generatedVoterId,
        generatedActivationPin
      ),
    });

    /* -------------------------------------------------------------------------- */
    /*                              Success Response                              */
    /* -------------------------------------------------------------------------- */

    return res.status(201).json({
      data: newVoter,
      message: "Voter registered successfully",
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2002") {
      return next(new AppError(400, "INVALID_INPUT", `Admin ID already exists`));
    }

    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Internal server error`));
  }
};

