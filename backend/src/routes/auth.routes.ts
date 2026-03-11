import { Router } from "express";
import {
  registerClient,
  registerPrestataire,
  login,
  getMe,
  logout,
  refreshToken,
  checkEmail,
  checkPhone,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Routes publiques
router.post("/register/client", registerClient);
router.post("/register/prestataire", registerPrestataire);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.get("/check-email", checkEmail);
router.get("/check-phone", checkPhone);

// Routes protégées
router.get("/me", authMiddleware, getMe);
router.post("/logout", authMiddleware, logout);

export default router;
