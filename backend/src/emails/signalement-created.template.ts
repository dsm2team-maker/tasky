import { emailLayout, paragraph, infoCard, calloutBox } from "./base.template";

interface SignalementCreatedProps {
  demandeReference: string;
  demandeTitre: string;
  auteurNom: string;
  message: string;
  signalementUrl: string;
}

export const signalementCreatedTemplate = ({
  demandeReference,
  demandeTitre,
  auteurNom,
  message,
  signalementUrl,
}: SignalementCreatedProps): string => {
  const content = `
    ${paragraph("Bonjour,")}
    ${paragraph(`Un nouveau signalement vient d'être déposé par <strong>${auteurNom}</strong> et nécessite une vérification.`)}
    ${infoCard(
      [
        { label: "Référence", value: demandeReference },
        { label: "Demande", value: demandeTitre },
        { label: "Auteur", value: auteurNom },
      ],
      { label: "🚩 Nouveau", color: "warning" },
    )}
    ${calloutBox(`<strong>Message du signalement :</strong><br/>${message}`, "warning")}
  `;

  return emailLayout({
    title: "Nouveau signalement — Tasky",
    previewText: `Un signalement a été déposé par ${auteurNom} sur la demande ${demandeReference}.`,
    accent: "warning",
    badgeLabel: "🛡️ ADMIN",
    emoji: "🚩",
    headline: "Nouveau signalement à traiter",
    subline: "Une action de modération est requise",
    content,
    ctaText: "Voir le signalement →",
    ctaUrl: signalementUrl,
    footerNote: "Vous recevez cet email car vous êtes administrateur sur Tasky.",
  });
};
