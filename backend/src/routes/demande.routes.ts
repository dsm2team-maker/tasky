import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  createDemandeHandler,
  getMyDemandesHandler,
  getDemandeHandler,
  deleteDemandeHandler,
} from "../controllers/demande.controller";
import {
  getDemandesDisponiblesHandler,
  getDemandeDetailHandler,
  envoyerDevisHandler,
  getDevisDemandeHandler,
  ignorerDemandeHandler,
} from "../controllers/devis.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Anti-spam dédié — limite la création de demandes, plus strict que le rate-limiter global
const createDemandeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Trop de demandes créées, réessayez plus tard" },
});

// ─── Demandes client ──────────────────────────────────────────────────────────
router.post("/", authMiddleware, createDemandeLimiter, createDemandeHandler);
router.get("/", authMiddleware, getMyDemandesHandler);

// ─── Prestataire — doit être AVANT /:id ──────────────────────────────────────
router.get("/available", authMiddleware, getDemandesDisponiblesHandler);

// ─── Routes avec :id ─────────────────────────────────────────────────────────
router.get("/:id", authMiddleware, getDemandeHandler);
router.get("/:id/detail", authMiddleware, getDemandeDetailHandler);
router.get("/:id/devis", authMiddleware, getDevisDemandeHandler);
router.post("/:id/devis", authMiddleware, envoyerDevisHandler);
router.post("/:id/ignorer", authMiddleware, ignorerDemandeHandler);
router.delete("/:id", authMiddleware, deleteDemandeHandler);

export default router;
