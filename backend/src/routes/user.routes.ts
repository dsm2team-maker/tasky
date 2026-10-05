import { Router } from "express";
import {
  uploadAvatar,
  uploadPhoto,
  deleteAvatar,
  getMyProfile,
  updateMyProfile,
  requestPhoneChangeHandler,
  verifyPhoneOtpHandler,
  requestEmailChangeHandler,
  verifyEmailOtpHandler,
  requestDeleteAccountHandler,
  confirmDeleteAccountHandler,
  updatePrestataireProfileHandler,
  getPrestataireCompetencesHandler,
  updatePrestataireCompetencesHandler,
  getPrestataireStatsHandler,
} from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { otpSendLimiter, otpVerifyLimiter, uploadLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

// ─── Avatar ───────────────────────────────────────────────────────────────────
router.post("/avatar", authMiddleware, uploadLimiter, uploadAvatar);
router.delete("/avatar", authMiddleware, deleteAvatar);

// ─── Photo générique (pièces jointes de demande, etc.) ────────────────────────
router.post("/photo", authMiddleware, uploadLimiter, uploadPhoto);

// ─── Profil commun (client + prestataire) ────────────────────────────────────
router.get("/profile", authMiddleware, getMyProfile);
router.patch("/profile", authMiddleware, updateMyProfile);

// ─── Changement téléphone ─────────────────────────────────────────────────────
router.post(
  "/profile/request-phone-change",
  authMiddleware,
  otpSendLimiter,
  requestPhoneChangeHandler,
);
router.post("/profile/verify-phone-otp", authMiddleware, otpVerifyLimiter, verifyPhoneOtpHandler);

// ─── Changement email ─────────────────────────────────────────────────────────
router.post(
  "/profile/request-email-change",
  authMiddleware,
  otpSendLimiter,
  requestEmailChangeHandler,
);
router.post("/profile/verify-email-otp", authMiddleware, otpVerifyLimiter, verifyEmailOtpHandler);

// ─── Suppression de compte ────────────────────────────────────────────────────
router.post(
  "/profile/request-delete-account",
  authMiddleware,
  otpSendLimiter,
  requestDeleteAccountHandler,
);
router.post(
  "/profile/confirm-delete-account",
  authMiddleware,
  otpVerifyLimiter,
  confirmDeleteAccountHandler,
);

// ─── Profil prestataire (bio) ─────────────────────────────────────────────────
router.patch("/prestataire", authMiddleware, updatePrestataireProfileHandler);

// ─── Compétences prestataire ──────────────────────────────────────────────────
router.get(
  "/prestataire/competences",
  authMiddleware,
  getPrestataireCompetencesHandler,
);
router.put(
  "/prestataire/competences",
  authMiddleware,
  updatePrestataireCompetencesHandler,
);

// ─── Stats prestataire ────────────────────────────────────────────────────────
router.get("/prestataire/stats", authMiddleware, getPrestataireStatsHandler);

export default router;
