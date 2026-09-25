import { Router } from "express";
import rateLimit from "express-rate-limit";
import { registerClient, registerPrestataire, login, logout, refreshToken, getMe, checkEmail, checkPhone } from "../controllers/auth.controller";
import { verifyEmail, resendVerificationEmail } from "../controllers/auth.verify.controller";
import { forgotPassword, resetPassword, recoverEmailSendOtpHandler, recoverEmailVerifyOtpHandler } from "../controllers/auth.recovery.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Anti brute-force dédié — bien plus strict que le rate-limiter global (1000 req/15min partagé sur toute l'API)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Trop de tentatives de connexion, réessayez dans 15 minutes" },
});

// Inscription
router.post("/register/client", registerClient);
router.post("/register/prestataire", registerPrestataire);

// Connexion
router.post("/login", loginLimiter, login);
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

// Récupération email perdu (sans auth)
router.post("/recover-email/send-otp", recoverEmailSendOtpHandler);
router.post("/recover-email/verify-otp", recoverEmailVerifyOtpHandler);

// Routes protegees
router.get("/me", authMiddleware, getMe);
router.post("/logout", authMiddleware, logout);

export default router;
