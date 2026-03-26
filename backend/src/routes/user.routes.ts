import { Router } from "express";
import {
  uploadAvatar,
  getMyProfile,
  updateMyProfile,
  requestPhoneChangeHandler,
  verifyPhoneOtpHandler,
  requestEmailChangeHandler,
  verifyEmailOtpHandler,
} from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Avatar
router.post("/avatar", authMiddleware, uploadAvatar);

// Profil
router.get("/profile", authMiddleware, getMyProfile);
router.patch("/profile", authMiddleware, updateMyProfile);

// Changement téléphone
router.post(
  "/profile/request-phone-change",
  authMiddleware,
  requestPhoneChangeHandler,
);
router.post("/profile/verify-phone-otp", authMiddleware, verifyPhoneOtpHandler);

// Changement email
router.post(
  "/profile/request-email-change",
  authMiddleware,
  requestEmailChangeHandler,
);
router.post("/profile/verify-email-otp", authMiddleware, verifyEmailOtpHandler);

export default router;
