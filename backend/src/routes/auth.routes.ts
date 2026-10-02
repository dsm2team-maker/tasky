import { Router } from "express";
import rateLimit from "express-rate-limit";
import { registerClient, registerPrestataire, login, logout, refreshToken, getMe, checkEmail, checkPhone } from "../controllers/auth.controller";
import { verifyEmail, resendVerificationEmail } from "../controllers/auth.verify.controller";
import { forgotPassword, resetPassword, recoverEmailSendOtpHandler, recoverEmailVerifyOtpHandler } from "../controllers/auth.recovery.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Anti brute-force dédié — nécessite app.set("trust proxy") (index.ts), sinon req.ip est
// l'IP du proxy Railway et tous les utilisateurs partagent le même compteur.
const loginMessage = { success: false, message: "Trop de tentatives de connexion, réessayez dans 15 minutes" };

// Par couple IP + compte ciblé : ralentit le brute-force d'un compte sans bloquer les autres
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${req.ip}:${String(req.body?.email ?? "").trim().toLowerCase()}`,
  message: loginMessage,
});

// Par IP seule : empêche une même IP de balayer de nombreux comptes
const loginIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: loginMessage,
});

// Inscription
router.post("/register/client", registerClient);
router.post("/register/prestataire", registerPrestataire);

// Connexion
router.post("/login", loginIpLimiter, loginLimiter, login);
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
