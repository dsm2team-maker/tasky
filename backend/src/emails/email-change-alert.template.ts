import { emailLayout, paragraph, calloutBox } from "./base.template";

interface EmailChangeAlertProps {
  firstName: string;
  newEmail: string; // Partiellement masqué ex: "je**@outlook.com"
}

export const emailChangeAlertTemplate = ({
  firstName,
  newEmail,
}: EmailChangeAlertProps): string => {
  const content = `
    ${paragraph(`Bonjour <strong>${firstName}</strong>,`)}
    ${paragraph("L'adresse email associée à votre compte Tasky vient d'être modifiée avec succès.")}
    ${calloutBox(`✅ Nouvelle adresse : <strong>${newEmail}</strong>`, "success")}
    ${paragraph("Vous serez automatiquement déconnecté de tous vos appareils. Reconnectez-vous avec votre nouvelle adresse email.")}
    ${calloutBox("⚠️ Si vous n'êtes pas à l'origine de ce changement, contactez notre support immédiatement depuis le bouton ci-dessous.", "danger")}
  `;

  return emailLayout({
    title: "Alerte sécurité — Email modifié",
    previewText: `${firstName}, l'adresse email de votre compte Tasky a été modifiée.`,
    accent: "security",
    badgeLabel: "🔔 Alerte sécurité",
    headline: "Votre adresse email a été modifiée",
    content,
    ctaText: "Contacter le support",
    ctaUrl: `${process.env.FRONTEND_URL}/contact`,
    footerNote: "Vous recevez cet email car une modification a été effectuée sur votre compte Tasky.",
  });
};
