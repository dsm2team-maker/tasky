import { emailLayout, paragraph, infoCard, calloutBox } from "./base.template";

interface TransferFailedProps {
  demandeReference: string;
  demandeTitre: string;
  prestataireNom: string;
  montant: number;
  failureReason: string;
  paiementsUrl: string;
}

export const transferFailedTemplate = ({
  demandeReference,
  demandeTitre,
  prestataireNom,
  montant,
  failureReason,
  paiementsUrl,
}: TransferFailedProps): string => {
  const content = `
    ${paragraph("Bonjour,")}
    ${paragraph(`Le virement Stripe vers <strong>${prestataireNom}</strong> a échoué et nécessite une intervention manuelle.`)}
    ${infoCard(
      [
        { label: "Référence", value: demandeReference },
        { label: "Prestation", value: demandeTitre },
        { label: "Prestataire", value: prestataireNom },
        { label: "Montant", value: `${montant.toFixed(2)} €`, big: true, color: "#dc2626" },
      ],
      { label: "⚠️ Échec", color: "danger" },
    )}
    ${calloutBox(`<strong>Raison de l'échec :</strong><br/>${failureReason}`, "warning")}
  `;

  return emailLayout({
    title: "Échec de virement — Tasky",
    previewText: `Le virement pour la prestation ${demandeReference} a échoué et nécessite une action.`,
    accent: "warning",
    badgeLabel: "🛡️ ADMIN",
    emoji: "⚠️",
    headline: "Échec d'un virement prestataire",
    subline: "Une intervention manuelle est requise",
    content,
    ctaText: "Voir les paiements →",
    ctaUrl: paiementsUrl,
    footerNote: "Vous recevez cet email car vous êtes administrateur sur Tasky.",
  });
};
