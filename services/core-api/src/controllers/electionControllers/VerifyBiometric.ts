import { AppError } from "../../utils/errors.js";
import { Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { AuthRequest } from "../../lib/authType.js";

export const VerifyBiometric = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const file = req.file;
  const { electionId } = req.body;
  const voterId = req.user?.id;

  if (!voterId) {
    return next(new AppError(401, "UNAUTHORIZED", `Unauthorized`));
  }

  if (!electionId) {
    return next(new AppError(400, "INVALID_INPUT", `Election ID is required.`));
  }

  if (!file) {
    return next(new AppError(400, "INVALID_INPUT", `Verification image is required.`));
  }

  try {
    // 1. Fetch voter record and verify profile picture exists
    const voter = await prisma.voter.findUnique({
      where: { id: voterId },
    });

    if (!voter) {
      return next(new AppError(404, "RESOURCE_NOT_FOUND", `Voter record not found.`));
    }

    if (!voter.profilePicture) {
      return next(new AppError(400, "INVALID_INPUT", `Voter does not have an enrolled profile picture to match against.`));
    }

    // 2. Resolve target election ID dynamically if missing
    let targetElectionId = electionId;
    if (!targetElectionId) {
      const activeElection = await prisma.election.findFirst({
        where: { status: "ACTIVE" },
      }) || await prisma.election.findFirst({
        orderBy: { createdAt: "desc" },
      });
      targetElectionId = activeElection?.id;
    }

    if (!targetElectionId) {
      return next(new AppError(400, "INVALID_INPUT", `No active election configured to record biometric verification logs.`));
    }

    const election = await prisma.election.findUnique({
      where: { id: targetElectionId },
    });

    if (!election) {
      return next(new AppError(404, "RESOURCE_NOT_FOUND", `Election not found.`));
    }

    // 2. Prepare FormData payload for Python face microservice
    const formData = new FormData();
    formData.append("voter_id", voter.voterId);
    
    const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
    formData.append("image", blob, file.originalname);

    // 3. Make internal request to face-service verification endpoint
    const faceServiceUrl = process.env.FACE_SERVICE_URL || "http://127.0.0.1:8000";
    console.log(`Forwarding photo for voter ${voterId} to face-service: ${faceServiceUrl}/api/v1/face/verify`);
    
    let faceResponse = await fetch(`${faceServiceUrl}/api/v1/face/verify`, {
      method: "POST",
      body: formData,
    });

    if (!faceResponse.ok) {
      const errText = await faceResponse.text();
      console.error(`Face service responded with error status ${faceResponse.status}: ${errText}`);
      throw new Error(`Face service returned status ${faceResponse.status}`);
    }

    let faceResult = await faceResponse.json();

    // 4. Auto-enrollment fallback: if template doesn't exist, retrieve from Cloudinary, enroll, and retry
    if (!faceResult.matched && faceResult.message?.includes("No enrolled face template found")) {
      console.log(`Face template missing in microservice for voter ${voterId}. Auto-enrolling from database photo: ${voter.profilePicture}`);
      
      const imageDownload = await fetch(voter.profilePicture);
      if (!imageDownload.ok) {
        throw new Error(`Failed to download profile photo from Cloudinary: ${imageDownload.status}`);
      }
      const photoBlob = await imageDownload.blob();

      // Submit enrollment to Python service
      const enrollForm = new FormData();
      enrollForm.append("voter_id", voter.voterId);
      enrollForm.append("image", photoBlob, "profile.jpg");

      const enrollResponse = await fetch(`${faceServiceUrl}/api/v1/face/enroll`, {
        method: "POST",
        body: enrollForm,
      });

      if (!enrollResponse.ok) {
        const enrollErr = await enrollResponse.text();
        console.error(`Face enrollment failed with status ${enrollResponse.status}: ${enrollErr}`);
        throw new Error("Failed to auto-enroll facial template.");
      }

      console.log(`Auto-enrollment success for voter ${voterId}. Retrying matching verification...`);

      // Retry verification
      faceResponse = await fetch(`${faceServiceUrl}/api/v1/face/verify`, {
        method: "POST",
        body: formData,
      });

      if (!faceResponse.ok) {
        throw new Error(`Face service verify retry returned status ${faceResponse.status}`);
      }

      faceResult = await faceResponse.json();
    }

    const matched = faceResult.matched === true;
    const similarity = faceResult.similarity ?? 0.0;

    // 5. Log the biometric attempt in PostgreSQL database
    const statusLabel = matched ? "SUCCESS" : "FAILED";
    await prisma.biometricAttempt.create({
      data: {
        voterId,
        electionId,
        status: statusLabel,
      },
    });

    // 6. Send results back to the client
    return res.status(200).json({
      success: true,
      matched,
      similarity,
      message: matched 
        ? "Facial recognition match successful. Access granted."
        : "Face did not match the enrolled profile template. Access denied.",
    });

  } catch (error: any) {
    console.error("Biometric verification error:", error);
    
    // Log verification as FAILED in database on microservice timeouts
    try {
      await prisma.biometricAttempt.create({
        data: {
          voterId,
          electionId,
          status: "FAILED",
        },
      });
    } catch (dbErr) {
      console.error("Error creating failed biometric attempt log:", dbErr);
    }

    return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Biometric matching failed due to microservice communication error.`));
  }
};
