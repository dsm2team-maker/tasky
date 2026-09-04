import { emailLayout, paragraph, infoCard, calloutBox } from "./base.template";

interface QuoteReceivedProps {
  firstName: string;
  demandeReference: string;
  demandeTitre: string;
  prestataireNom: string;
  montant: number;
  devisUrl: string;
}

export const quoteReceivedTemplate = ({
  firstName,
  demandeReference,
  demandeTitre,
  prestataireNom,
  montant,
  devisUrl,
}: QuoteReceivedProps): string => {
  const content = `
    ${paragraph(`Bonjour <strong>${firstName}</strong>,`)}
    ${paragraph(`Bonne nouvelle ! <strong>${prestataireNom}</strong> a soumis un devis pour votre demande.`)}
    ${infoCard([
      { label: "Référence", value: demandeReference },
      { label: "Demande", value: demandeTitre },
      { label: "Prestataire", value: prestataireNom },
      { label: "Montant proposé", value: `${montant.toFixed(2)} €`, big: true, color: "#ec4899" },
    ])}
    ${calloutBox("💡 <strong>Vous payez exactement ce montant</strong> — la commission Tasky est à la charge du prestataire, pas de vous.", "info")}
  `;

  return emailLayout({
    title: "Nouveau devis reçu — Tasky",
    previewText: `${prestataireNom} vous a envoyé un devis de ${montant.toFixed(2)} € pour votre demande ${demandeReference}.`,
    accent: "client",
    badgeLabel: "👤 CLIENT",
    headline: "Nouveau devis reçu !",
    subline: "Un prestataire a répondu à votre demande",
    content,
    ctaText: "Voir le devis →",
    ctaUrl: devisUrl,
    footerNote: "Vous recevez cet email car vous êtes client sur Tasky.",
  });
};
