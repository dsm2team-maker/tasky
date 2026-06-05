import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { creerSignalementHandler } from "../controllers/signalement.controller";

const router = Router();

router.post("/", authMiddleware, creerSignalementHandler);

export default router;
