import { emailLayout, paragraph, infoCard, calloutBox } from "./base.template";

interface DevisAccepteProps {
  firstName: string;
  demandeReference: string; // ex: TSK-000003
  demandeTitre: string;
  prestationUrl: string;
}

export const devisAccepteTemplate = ({
  firstName,
  demandeReference,
  demandeTitre,
  prestationUrl,
}: DevisAccepteProps): string => {
  const content = `
    ${paragraph(`Bonjour <strong>${firstName}</strong>,`)}
    ${paragraph("Bonne nouvelle : le client a accepté votre devis !")}
    ${infoCard(
      [
        { label: "Référence", value: demandeReference },
        { label: "Demande", value: demandeTitre },
      ],
      { label: "🎉 Devis accepté", color: "success" },
    )}
    ${calloutBox("💡 Rendez-vous sur votre espace prestataire pour suivre les prochaines étapes de cette prestation.", "success")}
  `;

  return emailLayout({
    title: "Votre devis a été accepté — Tasky",
    previewText: `Votre devis pour ${demandeReference} a été accepté par le client.`,
    accent: "prestataire",
    badgeLabel: "🛠️ PRESTATAIRE",
    emoji: "🎉",
    headline: "Votre devis a été accepté !",
    content,
    ctaText: "Voir ma prestation →",
    ctaUrl: prestationUrl,
    footerNote: "Vous recevez cet email car vous êtes prestataire sur Tasky.",
  });
};
