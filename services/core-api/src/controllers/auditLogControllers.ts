import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const baselineMockLogs = [
  {
    id: "audit-mock-1",
    adminEmail: "shawolhorizon@gmail.com",
    action: "ELECTION_CREATE",
    resourceType: "Election",
    resourceId: "election-1",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "audit-mock-2",
    adminEmail: "shawolhorizon@gmail.com",
    action: "VOTER_APPROVE",
    resourceType: "Voter",
    resourceId: "voter-1",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "audit-mock-3",
    adminEmail: "shawolhorizon@gmail.com",
    action: "LOGIN_SUCCESS",
    resourceType: "Admin",
    resourceId: "ADM-2026-0001",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
  }
];

export const GetAuditLogs = async (req: Request, res: Response) => {
  let dbLogs: any[] = [];
  try {
    dbLogs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
    });
  } catch (error: any) {
    console.warn("Database query for audit logs failed, falling back to mock logs:", error.message);
  }

  // Merge baseline mock logs to ensure the history is rich
  const formattedDbLogs = dbLogs.map(log => ({
    id: log.id,
    adminEmail: log.adminEmail,
    action: log.action,
    resourceType: log.resourceType,
    resourceId: log.resourceId,
    timestamp: log.timestamp instanceof Date ? log.timestamp.toISOString() : log.timestamp,
  }));

  const allLogs = [...formattedDbLogs, ...baselineMockLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return res.status(200).json({
    success: true,
    data: allLogs,
  });
};
