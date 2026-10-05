import { Router } from "express";
import {
  startConversationHandler,
  getConversationsHandler,
  getUnreadByConversationHandler,
  getConversationMessagesHandler,
  sendConversationMessageHandler,
} from "../controllers/message.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { messageLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

router.get("/unread-by-conversation", authMiddleware, getUnreadByConversationHandler);
router.post("/", authMiddleware, messageLimiter, startConversationHandler);
router.get("/", authMiddleware, getConversationsHandler);
router.get("/:conversationId", authMiddleware, getConversationMessagesHandler);
router.post("/:conversationId", authMiddleware, messageLimiter, sendConversationMessageHandler);

export default router;
