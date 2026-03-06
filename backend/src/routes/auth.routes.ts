import { Router } from "express";
import {
  registerClient,
  registerArtisan,
  login,
  getMe,
  logout,
  refreshToken,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Routes publiques
router.post("/register/client", registerClient);
router.post("/register/artisan", registerArtisan);
router.post("/login", login);
router.post("/refresh", refreshToken);

// Routes protégées (token requis)
router.get("/me", authMiddleware, getMe);
router.post("/logout", authMiddleware, logout);

export default router;
