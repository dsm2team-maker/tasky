import { Router } from "express";
import { getMessagesHandler, sendMessageHandler, getUnreadCountHandler, getUnreadByPrestationHandler, getTaskyInfoMessagesHandler, getUnreadTaskyInfoCountHandler } from "../controllers/message.controller";
import { authMiddleware, requireVerifiedEmail } from "../middleware/auth.middleware";
import { messageLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

router.get("/unread-count", authMiddleware, getUnreadCountHandler);
router.get("/unread-by-prestation", authMiddleware, getUnreadByPrestationHandler);
router.get("/tasky-info/unread-count", authMiddleware, getUnreadTaskyInfoCountHandler);
router.get("/tasky-info", authMiddleware, getTaskyInfoMessagesHandler);
router.get("/:prestationId", authMiddleware, getMessagesHandler);
router.post("/:prestationId", authMiddleware, requireVerifiedEmail, messageLimiter, sendMessageHandler);

export default router;
