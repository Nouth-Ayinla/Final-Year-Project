import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import electionRoutes from "./routes/electionRoutes.js";
import voterRoutes from "./routes/voterRoutes.js";
import wardRoutes from "./routes/wardRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import biometricReviewRoutes from "./routes/biometricReviewRoutes.js";
import { startElectionScheduler } from "./lib/electionSchedular.js";

const PORT = process.env.PORT || 5000;
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  next();
});

app.use("/api/admin", authRoutes);
app.use("/api/voter", voterRoutes);
app.use("/api/election", electionRoutes);
app.use("/api/ward", wardRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/biometrics", biometricReviewRoutes);

app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log("Database connected");

    // PgBouncer-compatible raw schema bootstrap
    console.log("Ensuring geopolitical and audit tables exist...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Ward" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "lgaName" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Ward_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Ward_code_key" ON "Ward"("code");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" TEXT NOT NULL,
        "adminEmail" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "resourceType" TEXT NOT NULL,
        "resourceId" TEXT NOT NULL,
        "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log("Database schema synced successfully.");
    console.log(`Server running on port ${PORT}`);
    startElectionScheduler();
  } catch (error) {
    console.log(error);
  }
});
