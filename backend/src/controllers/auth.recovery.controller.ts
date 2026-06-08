import { Request, Response } from "express";
import { authService } from "../modules/auth/auth.service";
import { recoverEmailSendOtp, recoverEmailVerifyOtp } from "../modules/users/user.service";
import { handleOtpError } from "../utils/errorHandler";

// ─── Mot de passe oublié ──────────────────────────────────────────────────────

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email requis" });
    await authService.sendResetPasswordEmail(email);
    return res.status(200).json({ success: true, message: "Si ce compte existe, un email a été envoyé." });
  } catch (error: any) {
    if (error.message === "USER_NOT_FOUND")
      return res.status(404).json({ success: false, message: "Aucun compte trouvé avec cette adresse email." });
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// ─── Réinitialisation mot de passe ────────────────────────────────────────────

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, message: "Données invalides" });
    await authService.resetPassword(token, password);
    return res.status(200).json({ success: true, message: "Mot de passe réinitialisé avec succès." });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || "Token invalide ou expiré" });
  }
};

// ─── Récupération email — étape 1 ────────────────────────────────────────────

export const recoverEmailSendOtpHandler = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@"))
      return res.status(400).json({ success: false, message: "Email invalide" });

    const result = await recoverEmailSendOtp(email.toLowerCase().trim());
    return res.json({ success: true, message: "Code envoyé.", data: result });
  } catch (error: any) {
    if (error.message === "USER_NOT_FOUND")
      return res.status(404).json({ success: false, message: "Aucun compte trouvé avec cette adresse email." });
    if (error.message === "NO_PHONE")
      return res.status(400).json({ success: false, message: "Aucun numéro de téléphone associé à ce compte. Contactez le support." });
    if (error.message?.startsWith("COOLDOWN:")) {
      const seconds = error.message.split(":")[1];
      return res.status(429).json({ success: false, message: `Veuillez attendre ${seconds} secondes` });
    }
    console.error("Erreur recoverEmailSendOtp:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// ─── Récupération email — étape 2 ────────────────────────────────────────────

export const recoverEmailVerifyOtpHandler = async (req: Request, res: Response) => {
  try {
    const { email, otp, newEmail } = req.body;
    if (!email || !otp || !newEmail)
      return res.status(400).json({ success: false, message: "Données manquantes" });

    const result = await recoverEmailVerifyOtp(email.toLowerCase().trim(), otp, newEmail.toLowerCase().trim());
    return res.json({ success: true, message: "Email mis à jour. Un lien de connexion a été envoyé sur votre nouvelle adresse.", data: result });
  } catch (error: any) {
    if (handleOtpError(error, res)) return;
    if (error.message === "SAME_EMAIL")
      return res.status(400).json({ success: false, message: "C'est déjà votre adresse email actuelle" });
    if (error.message === "EMAIL_ALREADY_USED")
      return res.status(409).json({ success: false, message: "Cette adresse est déjà associée à un compte" });
    console.error("Erreur recoverEmailVerifyOtp:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
