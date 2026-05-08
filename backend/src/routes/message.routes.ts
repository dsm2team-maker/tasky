import { Router } from "express";
import { getMessagesHandler, sendMessageHandler, getUnreadCountHandler, getUnreadByPrestationHandler } from "../controllers/message.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/unread-count", authMiddleware, getUnreadCountHandler);
router.get("/unread-by-prestation", authMiddleware, getUnreadByPrestationHandler);
router.get("/:prestationId", authMiddleware, getMessagesHandler);
router.post("/:prestationId", authMiddleware, sendMessageHandler);

export default router;
