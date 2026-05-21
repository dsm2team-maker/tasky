import { Router, Request, Response } from "express";
import { resend, emailConfig } from "../config/resend.config";
import { contactTemplate } from "../emails/contact.template";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "dsm2team@gmail.com";

const SUJETS = [
  "Question générale",
  "Litige en cours",
  "Problème technique",
  "Signalement",
  "Autre",
];

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { sujet, message, reference } = req.body;

    if (!sujet || !SUJETS.includes(sujet))
      return res.status(400).json({ success: false, message: "Sujet invalide" });
    if (!message || message.trim().length < 20)
      return res.status(400).json({ success: false, message: "Message trop court (min 20 caractères)" });

    const user = req.user!;
    const firstName = user.email.split("@")[0];
    const role = user.role === "PRESTATAIRE" ? "Prestataire" : "Client";

    const { error } = await resend.emails.send({
      from: emailConfig.from.noreply,
      to: SUPPORT_EMAIL,
      replyTo: user.email,
      subject: `[Tasky Contact] ${sujet}${reference ? ` — ${reference}` : ""} — ${firstName}`,
      html: contactTemplate({
        firstName,
        email: user.email,
        role,
        sujet,
        reference: reference?.trim() || "",
        message: message.trim(),
      }),
    });

    if (error) throw new Error(error.message);

    return res.json({ success: true, message: "Message envoyé" });
  } catch (error: any) {
    console.error("Erreur contact:", error);
    return res.status(500).json({ success: false, message: "Erreur lors de l'envoi" });
  }
});

export default router;
