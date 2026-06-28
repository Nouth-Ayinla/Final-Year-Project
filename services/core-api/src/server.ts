// server.ts
import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import electionRoutes from "./routes/electionRoutes.js";
import voterRoutes from "./routes/voterRoutes.js";
import { startElectionScheduler } from "./lib/electionSchedular.js";

dotenv.config();

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

app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log("Database connected");
    console.log(`Server running on port ${PORT}`);
    startElectionScheduler()
  } catch (error) {
    console.log(error);
  }
});
