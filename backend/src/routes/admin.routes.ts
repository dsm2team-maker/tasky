import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getDashboardStatsHandler,
  getUsersHandler,
  suspendUserHandler,
  reactivateUserHandler,
  getPrestationsHandler,
  getPrestationDetailHandler,
  getSignalementsHandler,
  resolveSignalementHandler,
  getPaiementsHandler,
} from "../controllers/admin.controller";

const router = Router();

router.use(authMiddleware);

router.get("/dashboard", getDashboardStatsHandler);
router.get("/users", getUsersHandler);
router.patch("/users/:id/suspend", suspendUserHandler);
router.patch("/users/:id/reactivate", reactivateUserHandler);
router.get("/prestations", getPrestationsHandler);
router.get("/prestations/:id", getPrestationDetailHandler);
router.get("/signalements", getSignalementsHandler);
router.patch("/signalements/:id/resolve", resolveSignalementHandler);
router.get("/paiements", getPaiementsHandler);

export default router;
