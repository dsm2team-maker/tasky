import { emailLayout, paragraph, infoCard, calloutBox } from "./base.template";

interface PrestationContestedProps {
  firstName: string;
  demandeReference: string;
  demandeTitre: string;
  motif: string;
  prestationUrl: string;
}

export const prestationContestedTemplate = ({
  firstName,
  demandeReference,
  demandeTitre,
  motif,
  prestationUrl,
}: PrestationContestedProps): string => {
  const content = `
    ${paragraph(`Bonjour <strong>${firstName}</strong>,`)}
    ${paragraph("Le client a contesté la validation de cette prestation. Elle repasse en cours afin que vous puissiez échanger avec lui et régulariser la situation.")}
    ${infoCard(
      [
        { label: "Référence", value: demandeReference },
        { label: "Prestation", value: demandeTitre },
      ],
      { label: "⚠️ Contestée", color: "danger" },
    )}
    ${calloutBox(`<strong>Motif de la contestation :</strong><br/>${motif}`, "warning")}
    ${calloutBox("💬 Utilisez la messagerie de la plateforme pour échanger avec le client et résoudre le point bloquant au plus vite.", "info")}
  `;

  return emailLayout({
    title: "Prestation contestée — Tasky",
    previewText: `Le client a contesté la prestation ${demandeReference}. Une action de votre part est requise.`,
    accent: "warning",
    badgeLabel: "🛠️ PRESTATAIRE",
    emoji: "⚠️",
    headline: "Prestation contestée",
    subline: "Le client a signalé un problème sur cette prestation",
    content,
    ctaText: "Voir la prestation →",
    ctaUrl: prestationUrl,
    footerNote: "Vous recevez cet email car vous êtes prestataire sur Tasky.",
  });
};
