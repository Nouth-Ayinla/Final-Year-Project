import { AppError } from "../../utils/errors.js";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";

export const DeleteElection = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const electionId = req.params.electionId as string;

        if (!electionId) {
            return next(new AppError(400, "INVALID_INPUT", `Invalid election Id`));
        }
        const election = await prisma.election.findUnique({
            where: {
                id: electionId,
            },
        });
        if (!election) {
            return next(new AppError(404, "RESOURCE_NOT_FOUND", `Election not found`));
        }
        if(election.status !== "DRAFT"){
               return next(new AppError(404, "RESOURCE_NOT_FOUND", `Only drafted election can be deleted`));
        }

        await prisma.election.delete({
            where: {
                id: electionId,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Election deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting election:", error);
        return next(new AppError(500, "INTERNAL_SERVER_ERROR", `Failed to delete election`));
    }
}