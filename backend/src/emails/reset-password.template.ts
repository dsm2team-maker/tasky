import { emailLayout, paragraph, calloutBox } from "./base.template";

interface ResetPasswordProps {
  firstName: string;
  resetUrl: string;
}

export const resetPasswordTemplate = ({
  firstName,
  resetUrl,
}: ResetPasswordProps): string => {
  const content = `
    ${paragraph(`Bonjour <strong>${firstName}</strong>,`)}
    ${paragraph("Vous avez demandé à réinitialiser votre mot de passe Tasky. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.")}
    ${paragraph("Ce lien est valable <strong>1 heure</strong>.")}
    ${calloutBox("⚠️ Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe ne sera pas modifié.", "danger")}
  `;

  return emailLayout({
    title: "Réinitialisation mot de passe — Tasky",
    previewText: `${firstName}, réinitialisez votre mot de passe Tasky.`,
    accent: "security",
    badgeLabel: "🔐 Sécurité",
    headline: "Réinitialisation de votre mot de passe",
    content,
    ctaText: "Réinitialiser mon mot de passe",
    ctaUrl: resetUrl,
    footerNote: "Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.",
  });
};
