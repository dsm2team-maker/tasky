import { Request, Response } from "express";
import { getMessages, sendMessage, getUnreadCount, getUnreadByPrestation } from "../modules/messages/message.service";

export const getUnreadByPrestationHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const data = await getUnreadByPrestation(userId);
    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

export const getUnreadCountHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const count = await getUnreadCount(userId);
    res.json({ success: true, data: { count } });
  } catch {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

export const getMessagesHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { prestationId } = req.params;
    const data = await getMessages(prestationId, userId);
    res.json({ success: true, data });
  } catch (error: any) {
    if (error.message === "PRESTATION_NOT_FOUND")
      return res.status(404).json({ success: false, message: "Prestation introuvable" });
    if (error.message === "FORBIDDEN")
      return res.status(403).json({ success: false, message: "Accès refusé" });
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

export const sendMessageHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { prestationId } = req.params;
    const { contenu } = req.body;
    const message = await sendMessage(prestationId, userId, contenu);
    res.status(201).json({ success: true, data: message });
  } catch (error: any) {
    if (error.message === "PRESTATION_NOT_FOUND")
      return res.status(404).json({ success: false, message: "Prestation introuvable" });
    if (error.message === "FORBIDDEN")
      return res.status(403).json({ success: false, message: "Accès refusé" });
    if (error.message === "CONTENU_VIDE")
      return res.status(400).json({ success: false, message: "Le message ne peut pas être vide" });
    if (error.message === "CONTENU_TROP_LONG")
      return res.status(400).json({ success: false, message: "Message trop long (max 1000 caractères)" });
    if (error.message === "CONTACT_INFO_DETECTED")
      return res.status(400).json({ success: false, message: "Les coordonnées personnelles (email, téléphone) ne sont pas autorisées dans les messages" });
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
