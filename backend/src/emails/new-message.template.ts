import { emailLayout, paragraph, calloutBox } from "./base.template";

interface NewMessageProps {
  firstName: string;
  senderName: string;
  messageCount: number;
  conversationUrl: string;
  variant?: "client" | "prestataire";
}

export const newMessageTemplate = ({
  firstName,
  senderName,
  messageCount,
  conversationUrl,
  variant = "client",
}: NewMessageProps): string => {
  const isMultiple = messageCount > 1;
  const isPrestataire = variant === "prestataire";

  const content = `
    ${paragraph(`Bonjour <strong>${firstName}</strong>,`)}
    ${paragraph(`<strong>${senderName}</strong> vous a envoyé ${isMultiple ? `<strong>${messageCount} messages</strong>` : "un message"} sur Tasky.`)}
    ${paragraph("Répondez directement depuis la messagerie Tasky pour garder vos échanges sécurisés.")}
    ${calloutBox("🔒 Tous vos échanges restent privés et sécurisés via Tasky. Ne partagez jamais vos coordonnées en dehors de la plateforme.", "info")}
  `;

  return emailLayout({
    title: `${isMultiple ? `${messageCount} nouveaux messages` : "Nouveau message"} — Tasky`,
    previewText: `${senderName} vous a envoyé ${isMultiple ? `${messageCount} messages` : "un message"} sur Tasky.`,
    accent: isPrestataire ? "prestataire" : "client",
    badgeLabel: "💬 Messagerie",
    headline: isMultiple ? `Vous avez ${messageCount} nouveaux messages` : "Vous avez un nouveau message",
    content,
    ctaText: "Voir le message",
    ctaUrl: conversationUrl,
    footerNote: `Vous recevez cet email car vous êtes ${isPrestataire ? "prestataire" : "client"} sur Tasky.`,
  });
};
