import { Router } from "express";
import {
  registerClient,
  registerPrestataire,
  login,
  logout,
  refreshToken,
  getMe,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  checkEmail,
  checkPhone,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Inscription
router.post("/register/client", registerClient);
router.post("/register/prestataire", registerPrestataire);

// Connexion
router.post("/login", login);
router.post("/refresh", refreshToken);

// Verification email
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// Mot de passe
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Checks disponibilite
router.get("/check-email", checkEmail);
router.get("/check-phone", checkPhone);

// Routes protegees
router.get("/me", authMiddleware, getMe);
router.post("/logout", authMiddleware, logout);

export default router;
