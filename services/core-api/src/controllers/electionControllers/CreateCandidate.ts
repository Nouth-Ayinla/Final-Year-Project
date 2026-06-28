import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

export const CreateCandidate = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const electionId: string | undefined =
    typeof req.params.electionId === "string"
      ? req.params.electionId
      : undefined;

  if (!electionId) {
    return res.status(400).json({
      message: "Invalid election ID",
    });
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
    return res.status(400).json({
      message: "All required fields must be provided",
    });
  }

  const file = req.file;

  if (!file) {
    return res.status(400).json({
      message: "Profile image is required",
    });
  }

  try {
    const uploadedImage: any = await uploadToCloudinary(file.buffer);

    if (!uploadedImage?.secure_url) {
      return res.status(500).json({
        message: "Image upload failed",
      });
    }

    const profilePicture = uploadedImage.secure_url;

    const admin = await prisma.admin.findUnique({
      where: {
        id: req.user?.id,
      },
    });

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    if (!admin.isActivated) {
      return res.status(403).json({
        message: "Account not activated",
      });
    }

    if (admin.role !== "SUPER_ADMIN" && admin.role !== "ELECTION_ADMIN") {
      return res.status(403).json({
        message: "Only admins can create candidates",
      });
    }

    const election = await prisma.election.findUnique({
      where: {
        id: electionId,
      },
    });

    if (!election) {
      return res.status(404).json({
        message: "Election not found",
      });
    }

    if (election.status !== "DRAFT") {
      return res.status(400).json({
        message:
          "Candidates can only be added while the election is in DRAFT state",
      });
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

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
