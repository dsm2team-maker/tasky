import { emailLayout, paragraph, calloutBox } from "./base.template";

interface ConnectOnboardingCompleteProps {
  firstName: string;
  earningsUrl: string;
}

export const connectOnboardingCompleteTemplate = ({
  firstName,
  earningsUrl,
}: ConnectOnboardingCompleteProps): string => {
  const content = `
    ${paragraph(`Bonjour <strong>${firstName}</strong>,`)}
    ${paragraph("Votre compte de paiement Stripe est maintenant entièrement configuré. Vous pouvez désormais recevoir vos virements directement sur votre compte bancaire pour chaque prestation validée.")}
    ${calloutBox("💳 <strong>Comment ça marche ?</strong><br/>Dès qu'une prestation est validée par le client, votre part (85% du montant, commission Tasky déduite) est automatiquement transférée sur votre compte sous 1 à 2 jours ouvrés.", "success")}
  `;

  return emailLayout({
    title: "Paiements activés — Tasky",
    previewText: "Votre compte de paiement Stripe est configuré, vous pouvez désormais recevoir vos virements.",
    accent: "prestataire",
    badgeLabel: "🛠️ PRESTATAIRE",
    emoji: "🎉",
    headline: "Vos paiements sont activés !",
    subline: "Votre compte Stripe est prêt à recevoir des virements",
    content,
    ctaText: "Voir mes revenus →",
    ctaUrl: earningsUrl,
    footerNote: "Vous recevez cet email car vous êtes prestataire sur Tasky.",
  });
};
