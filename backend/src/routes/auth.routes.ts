import { Router } from "express";
import { registerClient, registerPrestataire, login, logout, refreshToken, getMe, checkEmail, checkPhone } from "../controllers/auth.controller";
import { verifyEmail, resendVerificationEmail } from "../controllers/auth.verify.controller";
import { forgotPassword, resetPassword, recoverEmailSendOtpHandler, recoverEmailVerifyOtpHandler } from "../controllers/auth.recovery.controller";
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

// Récupération email perdu (sans auth)
router.post("/recover-email/send-otp", recoverEmailSendOtpHandler);
router.post("/recover-email/verify-otp", recoverEmailVerifyOtpHandler);

// Routes protegees
router.get("/me", authMiddleware, getMe);
router.post("/logout", authMiddleware, logout);

export default router;
