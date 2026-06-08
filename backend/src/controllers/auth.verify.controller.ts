import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authService } from "../modules/auth/auth.service";

// ─── Vérification email ───────────────────────────────────────────────────────

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query as { token: string };
    if (!token) return res.status(400).json({ success: false, message: "Token manquant" });
    await authService.verifyEmailToken(token);
    return res.status(200).json({ success: true, message: "Email vérifié avec succès !" });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || "Token invalide ou expiré" });
  }
};

// ─── Renvoyer email de vérification ──────────────────────────────────────────

export const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json({ success: true, message: "Si ce compte existe, un email a été envoyé." });
    if (user.emailVerified) return res.status(400).json({ success: false, message: "Cet email est déjà vérifié." });
    await authService.sendVerificationEmail(user.id, user.email, user.firstName, user.role === "PRESTATAIRE" ? "prestataire" : "client");
    return res.status(200).json({ success: true, message: "Email de vérification renvoyé." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
