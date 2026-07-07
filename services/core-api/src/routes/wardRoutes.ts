import express from "express";
import { CreateWard, GetWards } from "../controllers/wardControllers.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { adminOnly } from "../middleware/adminMiddleWare.js";
import { validateSchema } from "../validation/validateSchema.js";
import { CreateWardSchema } from "../validation/zodSchemas.js";

const router = express.Router();

router.post("/create", protectRoute, adminOnly, validateSchema(CreateWardSchema), CreateWard);
router.get("/list", protectRoute, GetWards);

export default router;
