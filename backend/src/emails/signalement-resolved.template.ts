import { emailLayout, paragraph, infoCard, calloutBox } from "./base.template";

interface SignalementResolvedProps {
  firstName: string;
  demandeReference: string;
  demandeTitre: string;
  note?: string;
  demandeUrl: string;
}

export const signalementResolvedTemplate = ({
  firstName,
  demandeReference,
  demandeTitre,
  note,
  demandeUrl,
}: SignalementResolvedProps): string => {
  const content = `
    ${paragraph(`Bonjour <strong>${firstName}</strong>,`)}
    ${paragraph("Le signalement que vous avez déposé a été examiné et traité par notre équipe.")}
    ${infoCard(
      [
        { label: "Référence", value: demandeReference },
        { label: "Demande", value: demandeTitre },
      ],
      { label: "✅ Résolu", color: "success" },
    )}
    ${note ? calloutBox(`<strong>Note de l'équipe Tasky :</strong><br/>${note}`, "info") : ""}
  `;

  return emailLayout({
    title: "Signalement traité — Tasky",
    previewText: `Votre signalement sur la demande ${demandeReference} a été traité.`,
    accent: "client",
    badgeLabel: "👤 CLIENT",
    emoji: "✅",
    headline: "Votre signalement a été traité",
    subline: "Merci pour votre vigilance",
    content,
    ctaText: "Voir ma demande →",
    ctaUrl: demandeUrl,
    footerNote: "Vous recevez cet email car vous avez déposé ce signalement sur Tasky.",
  });
};
