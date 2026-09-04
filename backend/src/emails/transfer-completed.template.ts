import { emailLayout, paragraph, infoCard, calloutBox } from "./base.template";

interface TransferCompletedProps {
  firstName: string;
  demandeReference: string;
  demandeTitre: string;
  montant: number;
  earningsUrl: string;
}

export const transferCompletedTemplate = ({
  firstName,
  demandeReference,
  demandeTitre,
  montant,
  earningsUrl,
}: TransferCompletedProps): string => {
  const content = `
    ${paragraph(`Bonjour <strong>${firstName}</strong>,`)}
    ${paragraph("Le virement correspondant à cette prestation vient d'être envoyé vers votre compte bancaire.")}
    ${infoCard(
      [
        { label: "Référence", value: demandeReference },
        { label: "Prestation", value: demandeTitre },
        { label: "Montant viré", value: `${montant.toFixed(2)} €`, big: true, color: "#10b981" },
      ],
      { label: "💸 Envoyé", color: "success" },
    )}
    ${calloutBox("🏦 Le montant apparaîtra sur votre compte bancaire sous 1 à 2 jours ouvrés selon votre banque.", "info")}
  `;

  return emailLayout({
    title: "Virement envoyé — Tasky",
    previewText: `Un virement de ${montant.toFixed(2)} € a été envoyé pour la prestation ${demandeReference}.`,
    accent: "prestataire",
    badgeLabel: "🛠️ PRESTATAIRE",
    emoji: "💸",
    headline: "Virement envoyé !",
    subline: "Votre paiement est en route vers votre compte",
    content,
    ctaText: "Voir mes revenus →",
    ctaUrl: earningsUrl,
    footerNote: "Vous recevez cet email car vous êtes prestataire sur Tasky.",
  });
};
