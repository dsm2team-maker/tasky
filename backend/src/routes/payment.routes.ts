import { Router } from "express";
import { authMiddleware, requireVerifiedEmail } from "../middleware/auth.middleware";
import { createPaymentIntentHandler, confirmPaymentHandler, stripeWebhookHandler } from "../controllers/payment.controller";

const router = Router();

router.post("/create-intent", authMiddleware, requireVerifiedEmail, createPaymentIntentHandler);
router.post("/confirm", authMiddleware, confirmPaymentHandler);

export { stripeWebhookHandler };
export default router;
