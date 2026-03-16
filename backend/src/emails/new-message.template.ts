import { baseTemplate } from "./base.template";

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

  const content = `
    <div class="badge">💬 Messagerie</div>
    <h1 class="title">
      ${isMultiple
        ? `Vous avez ${messageCount} nouveaux messages`
        : "Vous avez un nouveau message"
      }
    </h1>
    <p class="text">Bonjour <strong>${firstName}</strong>,</p>
    <p class="text">
      <strong>${senderName}</strong> vous a envoyé
      ${isMultiple ? `<strong>${messageCount} messages</strong>` : "un message"}
      sur Tasky.
    </p>
    <p class="text">
      Répondez directement depuis la messagerie Tasky pour garder vos échanges sécurisés.
    </p>
    <div style="background:#f5f3ff;border-radius:8px;padding:12px 16px;margin-bottom:16px;">
      <p style="font-size:13px;color:#7c3aed;">
        🔒 Tous vos échanges restent privés et sécurisés via Tasky.
        Ne partagez jamais vos coordonnées en dehors de la plateforme.
      </p>
    </div>
  `;

  return baseTemplate({
    title: `${isMultiple ? `${messageCount} nouveaux messages` : "Nouveau message"} — Tasky`,
    previewText: `${senderName} vous a envoyé ${isMultiple ? `${messageCount} messages` : "un message"} sur Tasky.`,
    content,
    ctaText: "Voir le message",
    ctaUrl: conversationUrl,
    variant,
  });
};
