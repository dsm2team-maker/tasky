import { baseTemplate } from "./base.template";

interface ResetPasswordProps {
  firstName: string;
  resetUrl: string;
}

export const resetPasswordTemplate = ({
  firstName,
  resetUrl,
}: ResetPasswordProps): string => {
  const content = `
    <div class="badge">🔐 Sécurité</div>
    <h1 class="title">Réinitialisation de votre mot de passe</h1>
    <p class="text">Bonjour <strong>${firstName}</strong>,</p>
    <p class="text">
      Vous avez demandé à réinitialiser votre mot de passe Tasky.
      Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
    </p>
    <p class="text">Ce lien est valable <strong>1 heure</strong>.</p>
    <div style="background:#fef2f2;border-radius:8px;padding:12px 16px;margin-bottom:16px;">
      <p style="font-size:13px;color:#dc2626;">
        ⚠️ Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
        Votre mot de passe ne sera pas modifié.
      </p>
    </div>
  `;

  return baseTemplate({
    title: "Réinitialisation mot de passe — Tasky",
    previewText: `${firstName}, réinitialisez votre mot de passe Tasky.`,
    content,
    ctaText: "Réinitialiser mon mot de passe",
    ctaUrl: resetUrl,
    variant: "default",
    footerText: "Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.",
  });
};
