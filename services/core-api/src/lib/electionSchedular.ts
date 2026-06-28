import cron from "node-cron";
import { prisma } from "../lib/prisma.js";

export const startElectionScheduler = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      await prisma.election.updateMany({
        where: {
          status: "UPCOMING",
          startDate: { 
            lte: now,
          },
          endDate: {
            gt: now,
          },
        },
        data: {
          status: "ACTIVE",
        },
      });

      await prisma.election.updateMany({
        where: {
          status: "ACTIVE",
          endDate: {
            lte: now,
          },
        },
        data: {
          status: "CLOSED",
        },
      });

      console.log("Election scheduler ran");
    } catch (error) {
      console.error("Election scheduler error:", error);
    }
  });
};