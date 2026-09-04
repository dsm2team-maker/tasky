import { emailLayout, paragraph, infoCard, calloutBox } from "./base.template";

interface DevisRefuseProps {
  firstName: string;
  demandeReference: string; // ex: TSK-000003
  demandeTitre: string;
  demandesUrl: string;
}

export const devisRefuseTemplate = ({
  firstName,
  demandeReference,
  demandeTitre,
  demandesUrl,
}: DevisRefuseProps): string => {
  const content = `
    ${paragraph(`Bonjour <strong>${firstName}</strong>,`)}
    ${paragraph("Le client a examiné les devis reçus et a choisi de retenir une autre proposition pour cette demande.")}
    ${infoCard(
      [
        { label: "Référence", value: demandeReference },
        { label: "Demande", value: demandeTitre },
      ],
      { label: "⚠️ Devis non retenu", color: "warning" },
    )}
    ${calloutBox("💡 <strong>Ne vous découragez pas</strong><br/>De nouvelles demandes compatibles avec votre profil sont publiées chaque jour. Continuez à répondre rapidement — les clients accordent beaucoup d'importance à la réactivité.", "success")}
  `;

  return emailLayout({
    title: "Votre devis n'a pas été retenu — Tasky",
    previewText: `Votre devis pour ${demandeReference} n'a pas été retenu. D'autres opportunités vous attendent.`,
    accent: "prestataire",
    badgeLabel: "🛠️ PRESTATAIRE",
    headline: "Devis non retenu",
    content,
    ctaText: "Voir les nouvelles demandes →",
    ctaUrl: demandesUrl,
    footerNote: "Vous recevez cet email car vous êtes prestataire sur Tasky. Gérez vos préférences de notification depuis votre espace.",
  });
};
