import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as adminService from "../modules/admin/admin.service";

const isAdmin = (req: AuthRequest, res: Response): boolean => {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({ success: false, message: "Accès réservé aux administrateurs" });
    return false;
  }
  return true;
};

export const getDashboardStatsHandler = async (req: AuthRequest, res: Response) => {
  if (!isAdmin(req, res)) return;
  try {
    const data = await adminService.getDashboardStats();
    res.json({ success: true, data });
  } catch { res.status(500).json({ success: false, message: "Erreur serveur" }); }
};

export const getUsersHandler = async (req: AuthRequest, res: Response) => {
  if (!isAdmin(req, res)) return;
  try {
    const page = parseInt(req.query.page as string) || 1;
    const search = (req.query.search as string) || "";
    const data = await adminService.getUsers(page, search);
    res.json({ success: true, data });
  } catch { res.status(500).json({ success: false, message: "Erreur serveur" }); }
};

export const suspendUserHandler = async (req: AuthRequest, res: Response) => {
  if (!isAdmin(req, res)) return;
  try {
    await adminService.suspendUser(req.params.id);
    res.json({ success: true, message: "Utilisateur suspendu" });
  } catch { res.status(500).json({ success: false, message: "Erreur serveur" }); }
};

export const reactivateUserHandler = async (req: AuthRequest, res: Response) => {
  if (!isAdmin(req, res)) return;
  try {
    await adminService.reactivateUser(req.params.id);
    res.json({ success: true, message: "Utilisateur réactivé" });
  } catch { res.status(500).json({ success: false, message: "Erreur serveur" }); }
};

export const getPrestationsHandler = async (req: AuthRequest, res: Response) => {
  if (!isAdmin(req, res)) return;
  try {
    const page = parseInt(req.query.page as string) || 1;
    const status = (req.query.status as string) || "";
    const data = await adminService.getPrestations(page, status);
    res.json({ success: true, data });
  } catch { res.status(500).json({ success: false, message: "Erreur serveur" }); }
};

export const getPrestationDetailHandler = async (req: AuthRequest, res: Response) => {
  if (!isAdmin(req, res)) return;
  try {
    const data = await adminService.getPrestationDetail(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Introuvable" });
    res.json({ success: true, data });
  } catch { res.status(500).json({ success: false, message: "Erreur serveur" }); }
};

export const getSignalementsHandler = async (req: AuthRequest, res: Response) => {
  if (!isAdmin(req, res)) return;
  try {
    const page = parseInt(req.query.page as string) || 1;
    const data = await adminService.getSignalements(page);
    res.json({ success: true, data });
  } catch { res.status(500).json({ success: false, message: "Erreur serveur" }); }
};

export const resolveSignalementHandler = async (req: AuthRequest, res: Response) => {
  if (!isAdmin(req, res)) return;
  try {
    const { note } = req.body;
    await adminService.resolveSignalement(req.params.id, note || "");
    res.json({ success: true, message: "Signalement résolu" });
  } catch { res.status(500).json({ success: false, message: "Erreur serveur" }); }
};

export const getPaiementsHandler = async (req: AuthRequest, res: Response) => {
  if (!isAdmin(req, res)) return;
  try {
    const page = parseInt(req.query.page as string) || 1;
    const data = await adminService.getPaiements(page);
    res.json({ success: true, data });
  } catch { res.status(500).json({ success: false, message: "Erreur serveur" }); }
};
