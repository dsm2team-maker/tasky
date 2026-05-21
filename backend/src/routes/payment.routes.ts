import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { createPaymentIntentHandler, confirmPaymentHandler, stripeWebhookHandler } from "../controllers/payment.controller";

const router = Router();

router.post("/create-intent", authMiddleware, createPaymentIntentHandler);
router.post("/confirm", authMiddleware, confirmPaymentHandler);

export { stripeWebhookHandler };
export default router;
