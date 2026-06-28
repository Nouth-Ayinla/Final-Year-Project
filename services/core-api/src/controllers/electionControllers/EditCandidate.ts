import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary.js";
import {
  Sex,
  MaritalStatus,
  EducationLevel,
} from "@prisma/client";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

export const EditCandidate = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const candidateId = req.params.candidateId as string;

  if (!candidateId) {
    return res.status(400).json({
      message: "Candidate ID is required",
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
    !party
  ) {
    return res.status(400).json({
      message: "All required structural fields must be provided",
    });
  }

  try {
    // Verify admin
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
        message: "Only admins can modify candidates",
      });
    }

    const existingCandidate = await prisma.candidate.findUnique({
      where: {
        id: candidateId,
      },
    });

    if (!existingCandidate) {
      return res.status(404).json({
        message: "Candidate not found",
      });
    }

   
    const election = await prisma.election.findUnique({
      where: {
        id: existingCandidate.electionId,
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
          "Candidates can only be modified while the election is in DRAFT state",
      });
    }

    let profilePicture = existingCandidate.imageUrl;

    const file = req.file;

    if (file) {
      const uploadedImage: any = await uploadToCloudinary(file.buffer);

      if (!uploadedImage?.secure_url) {
        return res.status(500).json({
          message: "New image upload failed",
        });
      }

      profilePicture = uploadedImage.secure_url;
    }

    const updatedCandidate = await prisma.candidate.update({
      where: {
        id: candidateId,
      },
      data: {
        firstName: firstName.trim(),
        surname: surname.trim(),
        otherName: otherName?.trim() || null,
        DOB,
        sex: sex as Sex,
        maritalStatus: maritalStatus as MaritalStatus,
        state: state.trim(),
        LGA: LGA.trim(),
        education: education as EducationLevel,
        bio: bio?.trim() || "",
        imageUrl: profilePicture,
        partyId: party,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Candidate updated successfully",
      candidate: updatedCandidate,
    });
  } catch (error) {
    console.error("Update Candidate Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};