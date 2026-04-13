import { Router } from "express";
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
} from "../controllers/devis.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// ─── Demandes client ──────────────────────────────────────────────────────────
router.post("/", authMiddleware, createDemandeHandler);
router.get("/", authMiddleware, getMyDemandesHandler);

// ─── Prestataire — doit être AVANT /:id ──────────────────────────────────────
router.get("/available", authMiddleware, getDemandesDisponiblesHandler);

// ─── Routes avec :id ─────────────────────────────────────────────────────────
router.get("/:id", authMiddleware, getDemandeHandler);
router.get("/:id/detail", authMiddleware, getDemandeDetailHandler);
router.get("/:id/devis", authMiddleware, getDevisDemandeHandler);
router.post("/:id/devis", authMiddleware, envoyerDevisHandler);
router.delete("/:id", authMiddleware, deleteDemandeHandler);

export default router;
