import { Router } from "express";
import {
  startConversationHandler,
  getConversationsHandler,
  getUnreadByConversationHandler,
  getConversationMessagesHandler,
  sendConversationMessageHandler,
} from "../controllers/message.controller";
import { authMiddleware, requireVerifiedEmail } from "../middleware/auth.middleware";
import { messageLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

router.get("/unread-by-conversation", authMiddleware, getUnreadByConversationHandler);
router.post("/", authMiddleware, requireVerifiedEmail, messageLimiter, startConversationHandler);
router.get("/", authMiddleware, getConversationsHandler);
router.get("/:conversationId", authMiddleware, getConversationMessagesHandler);
router.post("/:conversationId", authMiddleware, requireVerifiedEmail, messageLimiter, sendConversationMessageHandler);

export default router;
