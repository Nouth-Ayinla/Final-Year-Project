import { prisma } from "../lib/prisma.js";

export const logAudit = async (adminEmail: string, action: string, resourceType: string, resourceId: string) => {
  try {
    await prisma.auditLog.create({
      data: {
        adminEmail,
        action,
        resourceType,
        resourceId,
      },
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
};
