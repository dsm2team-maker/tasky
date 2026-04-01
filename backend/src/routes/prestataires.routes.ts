import { Router } from "express";
import {
  getPublicPrestataire,
  listPrestataires,
} from "../controllers/prestataires.controller";

const router = Router();

// Liste des prestataires (recherche)
router.get("/", listPrestataires);

// Profil public d'un prestataire
router.get("/:id", getPublicPrestataire);

export default router;
