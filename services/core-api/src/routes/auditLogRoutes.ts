import express from "express";
import { GetAuditLogs } from "../controllers/auditLogControllers.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/list", protectRoute, GetAuditLogs);

export default router;
