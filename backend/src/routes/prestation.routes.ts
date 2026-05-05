import { Router } from "express";
import {
  getMesPrestationsHandler,
  getPrestationDetailHandler,
  creerEtatDesLieuxHandler,
  validerEtatDesLieuxHandler,
  marquerTermineHandler,
  validerPrestationHandler,
  contesterPrestationHandler,
  getMesPrestationsClientHandler,
} from "../controllers/prestation.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// ─── Client ───────────────────────────────────────────────────────────────────
router.get("/client", authMiddleware, getMesPrestationsClientHandler);
router.patch("/:id/valider", authMiddleware, validerPrestationHandler);
router.patch("/:id/contester", authMiddleware, contesterPrestationHandler);
router.patch(
  "/:id/etat-des-lieux/valider",
  authMiddleware,
  validerEtatDesLieuxHandler,
);

// ─── Prestataire ──────────────────────────────────────────────────────────────
router.get("/", authMiddleware, getMesPrestationsHandler);
router.get("/:id", authMiddleware, getPrestationDetailHandler);
router.post("/:id/etat-des-lieux", authMiddleware, creerEtatDesLieuxHandler);
router.patch("/:id/terminer", authMiddleware, marquerTermineHandler);

export default router;
