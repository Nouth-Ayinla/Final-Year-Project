import { AppError } from "../../utils/errors.js";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";

interface Params {
  candidateId: string;
}

export const GetCandidateById = async (req: Request<Params>, res: Response, next: NextFunction) => {
  const { candidateId } = req.params;

  const candidate = await prisma.candidate.findUnique({
    where: {
      id: candidateId,
    },
    select: {
      firstName: true,
      surname: true,
      otherName: true,
      bio: true,
      DOB: true,
      state: true,
      LGA: true,
      sex: true,
      maritalStatus: true,
      education: true,
      party: true,
      imageUrl : true
    },
  });

  if (!candidate) {
    return next(new AppError(404, "RESOURCE_NOT_FOUND", `Candidate not found`));
  }

  return res.status(200).json({
    data: candidate,
  });
};
