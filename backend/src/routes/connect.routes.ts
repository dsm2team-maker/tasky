import { Router } from "express";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";
import {
  createAccountHandler,
  createAccountSessionHandler,
  getConnectStatusHandler,
  stripeConnectWebhookHandler,
} from "../controllers/connect.controller";

const router = Router();

router.post("/account", authMiddleware, requireRole("PRESTATAIRE"), createAccountHandler);
router.post("/account-session", authMiddleware, requireRole("PRESTATAIRE"), createAccountSessionHandler);
router.get("/status", authMiddleware, requireRole("PRESTATAIRE"), getConnectStatusHandler);

export { stripeConnectWebhookHandler };
export default router;
