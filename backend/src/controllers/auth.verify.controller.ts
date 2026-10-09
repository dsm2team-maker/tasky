import { Request, Response } from "express";
import { findUserByEmail } from "../utils/email.utils";
import { authService } from "../modules/auth/auth.service";
import { handleError } from "../utils/errorHandler";

// ─── Vérification email ───────────────────────────────────────────────────────

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query as { token: string };
    if (!token) return res.status(400).json({ success: false, message: "Token manquant" });
    await authService.verifyEmailToken(token);
    return res.status(200).json({ success: true, message: "Email vérifié avec succès !" });
  } catch (error) {
    return handleError(error, res);
  }
};

// ─── Renvoyer email de vérification ──────────────────────────────────────────

// Réponse identique que le compte existe, soit déjà vérifié ou non (SEC-014)
const RESEND_GENERIC = "Si un compte en attente de vérification existe pour cette adresse, un nouvel email a été envoyé.";

export const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (typeof email !== "string" || !email.includes("@"))
      return res.status(400).json({ success: false, message: "Email invalide" });
    const user = await findUserByEmail(email);
    if (user && !user.emailVerified && user.isActive && !user.deletedAt) {
      await authService.sendVerificationEmail(user.id, user.email, user.firstName, user.role === "PRESTATAIRE" ? "prestataire" : "client");
    }
    return res.status(200).json({ success: true, message: RESEND_GENERIC });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
