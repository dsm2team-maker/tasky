import { Router } from "express";
import {
  createDemandeHandler,
  getMyDemandesHandler,
  getDemandeHandler,
  deleteDemandeHandler,
} from "../controllers/demande.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// ─── Demandes client ──────────────────────────────────────────────────────────
router.post("/", authMiddleware, createDemandeHandler);
router.get("/", authMiddleware, getMyDemandesHandler);
router.get("/:id", authMiddleware, getDemandeHandler);
router.delete("/:id", authMiddleware, deleteDemandeHandler);

export default router;
