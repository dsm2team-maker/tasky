import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { creerSignalement } from "../modules/signalements/signalement.service";

export const creerSignalementHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { demandeId, message } = req.body;

    if (!demandeId || !message)
      return res.status(400).json({ success: false, message: "demandeId et message requis" });

    const signalement = await creerSignalement(userId, demandeId, message);
    return res.status(201).json({ success: true, data: signalement });
  } catch (err: any) {
    const codes: Record<string, [number, string]> = {
      DEMANDE_NOT_FOUND:    [404, "Demande introuvable"],
      FORBIDDEN:            [403, "Accès refusé"],
      STATUT_INVALIDE:      [400, "Impossible de signaler une demande dans ce statut"],
      MESSAGE_TROP_COURT:   [400, "Le message doit faire au moins 10 caractères"],
      SIGNALEMENT_EXISTANT: [409, "Un signalement est déjà en cours pour cette demande"],
    };
    const [status, message] = codes[err.message] ?? [500, "Erreur serveur"];
    return res.status(status).json({ success: false, message });
  }
};
