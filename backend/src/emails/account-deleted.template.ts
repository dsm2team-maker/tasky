import { emailLayout, paragraph, calloutBox } from "./base.template";

interface AccountDeletedProps {
  firstName: string;
}

export const accountDeletedTemplate = ({ firstName }: AccountDeletedProps): string => {
  const content = `
    ${paragraph(`Bonjour <strong>${firstName}</strong>,`)}
    ${paragraph("Nous vous confirmons que votre compte Tasky a bien été supprimé. Vos données personnelles ont été anonymisées conformément à notre politique de confidentialité et au RGPD.")}
    ${calloutBox("👋 Nous sommes tristes de vous voir partir. Si vous changez d'avis, vous pourrez toujours créer un nouveau compte Tasky.", "info")}
    ${calloutBox("Si vous n'êtes pas à l'origine de cette suppression, contactez immédiatement notre équipe support.", "warning")}
  `;

  return emailLayout({
    title: "Compte supprimé — Tasky",
    previewText: `${firstName}, votre compte Tasky a bien été supprimé.`,
    accent: "warning",
    badgeLabel: "🗑️ Suppression de compte",
    emoji: "✅",
    headline: "Votre compte a bien été supprimé",
    subline: "Cette action est définitive",
    content,
    footerNote: "Ceci est le dernier email que vous recevrez de notre part concernant ce compte.",
  });
};
