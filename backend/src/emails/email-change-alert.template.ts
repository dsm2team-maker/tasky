import { baseTemplate } from "./base.template";

interface EmailChangeAlertProps {
  firstName: string;
  newEmail: string; // Partiellement masqué ex: "je**@outlook.com"
}

export const emailChangeAlertTemplate = ({
  firstName,
  newEmail,
}: EmailChangeAlertProps): string => {
  const content = `
    <div class="badge">🔔 Alerte sécurité</div>
    <h1 class="title">Votre adresse email a été modifiée</h1>
    <p class="text">Bonjour <strong>${firstName}</strong>,</p>
    <p class="text">
      L'adresse email associée à votre compte Tasky vient d'être modifiée avec succès.
    </p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;margin-bottom:16px;">
      <p style="font-size:13px;color:#166534;">
        ✅ Nouvelle adresse : <strong>${newEmail}</strong>
      </p>
    </div>
    <p class="text">
      Vous serez automatiquement déconnecté de tous vos appareils.
      Reconnectez-vous avec votre nouvelle adresse email.
    </p>
    <div style="background:#fef2f2;border-radius:8px;padding:12px 16px;margin-bottom:16px;">
      <p style="font-size:13px;color:#dc2626;">
        ⚠️ Si vous n'êtes pas à l'origine de ce changement, contactez notre support immédiatement
        depuis le bouton ci-dessous.
      </p>
    </div>
  `;

  return baseTemplate({
    title: "Alerte sécurité — Email modifié",
    previewText: `${firstName}, l'adresse email de votre compte Tasky a été modifiée.`,
    content,
    ctaText: "Contacter le support",
    ctaUrl: `${process.env.FRONTEND_URL}/support`,
    variant: "default",
    footerText:
      "Vous recevez cet email car une modification a été effectuée sur votre compte Tasky.",
  });
};
