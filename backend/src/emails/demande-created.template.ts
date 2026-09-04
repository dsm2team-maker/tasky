import { emailLayout, paragraph, infoCard, calloutBox } from "./base.template";

interface DemandeCreatedProps {
  firstName: string;
  demandeReference: string;
  demandeTitre: string;
  demandeUrl: string;
}

export const demandeCreatedTemplate = ({
  firstName,
  demandeReference,
  demandeTitre,
  demandeUrl,
}: DemandeCreatedProps): string => {
  const content = `
    ${paragraph(`Bonjour <strong>${firstName}</strong>,`)}
    ${paragraph("Votre demande a bien été publiée sur Tasky. Les prestataires disponibles dans votre secteur vont pouvoir la consulter et vous envoyer un devis.")}
    ${infoCard(
      [
        { label: "Référence", value: demandeReference },
        { label: "Demande", value: demandeTitre },
      ],
      { label: "📢 Publiée", color: "success" },
    )}
    ${calloutBox("💡 Vous recevrez un email dès qu'un prestataire vous enverra un devis. Vous pourrez comparer les propositions directement depuis votre espace.", "info")}
  `;

  return emailLayout({
    title: "Demande publiée — Tasky",
    previewText: `Votre demande "${demandeTitre}" a bien été publiée sur Tasky.`,
    accent: "client",
    badgeLabel: "👤 CLIENT",
    emoji: "📢",
    headline: "Votre demande a été publiée !",
    subline: "Les prestataires peuvent désormais y répondre",
    content,
    ctaText: "Voir ma demande →",
    ctaUrl: demandeUrl,
    footerNote: "Vous recevez cet email car vous êtes client sur Tasky.",
  });
};
