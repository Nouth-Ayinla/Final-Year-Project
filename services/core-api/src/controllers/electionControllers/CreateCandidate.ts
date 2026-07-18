import { AppError } from "../../utils/errors.js";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

export const CreateCandidate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const electionId: string | undefined =
    typeof req.params.electionId === "string"
      ? req.params.electionId
      : undefined;

  if (!electionId) {
    return next(new AppError(400, "INVALID_INPUT", `Invalid election ID`));
  }

  const {
    firstName,
    surname,
    otherName,
    DOB,
    sex,
    maritalStatus,
    state,
    LGA,
    education,
    bio,
    party,
  } = req.body;

  if (
    !firstName ||
    !surname ||
    !DOB ||
    !sex ||
    !maritalStatus ||
    !state ||
    !LGA ||
    !education ||
    !bio ||
    !party
  ) {
    return next(new AppError(400, "INVALID_INPUT", `All required fields must be provided`));
  }

  const file = req.file;

  if (!file) {
    return next(new AppError(400, "INVALID_INPUT", `Profile image is required`));
  }

  try {
    const uploadedImage: any = await uploadToCloudinary(file.buffer);

    if (!uploadedImage?.secure_url) {
      return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Image upload failed`));
    }

    const profilePicture = uploadedImage.secure_url;

    const admin = await prisma.admin.findUnique({
      where: {
        id: req.user?.id,
      },
    });

    if (!admin) {
      return next(new AppError(404, "RESOURCE_NOT_FOUND", `Admin not found`));
    }

    if (!admin.isActivated) {
      return next(new AppError(403, "FORBIDDEN", `Account not activated`));
    }

    if (admin.role !== "SUPER_ADMIN" && admin.role !== "ELECTION_ADMIN") {
      return next(new AppError(403, "FORBIDDEN", `Only admins can create candidates`));
    }

    const election = await prisma.election.findUnique({
      where: {
        id: electionId,
      },
    });

    if (!election) {
      return next(new AppError(404, "RESOURCE_NOT_FOUND", `Election not found`));
    }

    if (election.status !== "DRAFT") {
      return next(new AppError(400, "INVALID_INPUT", `Candidates can only be added while the election is in DRAFT state`));
    }

    const candidate = await prisma.candidate.create({
      data: {
        firstName: firstName.trim(),
        surname: surname.trim(),
        otherName: otherName?.trim() || null,
        DOB,
        sex,
        maritalStatus,
        state: state.trim(),
        LGA: LGA.trim(),
        education,
        bio: bio.trim(),
        imageUrl: profilePicture,
        partyId: party.trim(),
        electionId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Candidate created successfully",
      candidate,
    });
  } catch (error) {
    console.error("Create Candidate Error:", error);

    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Internal server error`));
  }
};
