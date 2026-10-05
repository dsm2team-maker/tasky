import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { signalementLimiter } from "../middleware/rateLimit.middleware";
import { creerSignalementHandler } from "../controllers/signalement.controller";

const router = Router();

router.post("/", authMiddleware, signalementLimiter, creerSignalementHandler);

export default router;
