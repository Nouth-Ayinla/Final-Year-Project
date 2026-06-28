import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export const DeleteElection = async (req: Request, res: Response) => {
    try{
        const electionId = req.params.electionId as string;

        if (!electionId) {
            return res.status(400).json({
                success: false,
                message: "Invalid election Id",
            });
        }
        const election = await prisma.election.findUnique({
            where: {
                id: electionId,
            },
        });
        if (!election) {
            return res.status(404).json({
                success: false,
                message: "Election not found",
            });
        }
        if(election.status !== "DRAFT"){
               return res.status(404).json({
                success: false,
                message: "Only drafted election can be deleted",
            });
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
        return res.status(500).json({
            success: false,
            message: "Failed to delete election",
        });
    }
}