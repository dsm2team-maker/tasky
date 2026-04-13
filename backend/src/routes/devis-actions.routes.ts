import { Router } from "express";
import {
  accepterDevisHandler,
  refuserDevisHandler,
} from "../controllers/devis.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.patch("/:id/accept", authMiddleware, accepterDevisHandler);
router.patch("/:id/refuse", authMiddleware, refuserDevisHandler);

export default router;
