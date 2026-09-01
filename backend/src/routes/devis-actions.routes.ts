import { Router } from "express";
import {
  accepterDevisHandler,
  refuserDevisHandler,
  getMesStatsDevisHandler,
  getMesDevisRefusesHandler,
  getMesDevisHandler,
  dismisserDevisHandler,
} from "../controllers/devis.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/mes-stats", authMiddleware, getMesStatsDevisHandler);
router.get("/mes-devis-refuses", authMiddleware, getMesDevisRefusesHandler);
router.get("/mes-devis", authMiddleware, getMesDevisHandler);
router.patch("/:id/accept", authMiddleware, accepterDevisHandler);
router.patch("/:id/refuse", authMiddleware, refuserDevisHandler);
router.patch("/:id/dismiss", authMiddleware, dismisserDevisHandler);

export default router;
