import { splitMontant } from "../config/commission.config";
import { emailLayout, paragraph, infoCard, calloutBox } from "./base.template";

interface OrderCompletedProps {
  firstName: string;
  demandeReference: string;
  demandeTitre: string;
  montant: number;
  role: "client" | "prestataire";
  isAutoValidated?: boolean;
  prestationUrl: string;
}

export const orderCompletedTemplate = ({
  firstName,
  demandeReference,
  demandeTitre,
  montant,
  role,
  isAutoValidated = false,
  prestationUrl,
}: OrderCompletedProps): string => {
  const isClient = role === "client";

  const headline = isClient ? "Prestation terminée !" : "Prestation validée — Paiement en cours !";
  const subline = isClient
    ? isAutoValidated
      ? "La prestation a été automatiquement validée (délai de 3 jours écoulé)."
      : "Vous avez validé la prestation. Merci d'avoir utilisé Tasky !"
    : "La prestation est terminée et validée. Votre paiement va être traité.";
  const montantLabel = isClient ? "Montant total payé" : "Net à percevoir";
  const montantAffiche = isClient ? montant : splitMontant(montant).montantPrestataire;

  const content = `
    ${paragraph(`Bonjour <strong>${firstName}</strong>,<br/>${subline}`)}
    ${infoCard(
      [
        { label: "Référence", value: demandeReference },
        { label: "Prestation", value: demandeTitre },
        {
          label: montantLabel,
          value: `${montantAffiche.toFixed(2)} €${!isClient ? ` <span style="font-size:12px;color:#9ca3af;font-weight:400;">(commission Tasky 15% déduite)</span>` : ""}`,
          big: true,
          color: isClient ? "#ec4899" : "#10b981",
        },
      ],
      { label: "✅ Terminée", color: "success" },
    )}
    ${isClient
      ? calloutBox("⭐ <strong>Donnez votre avis</strong><br/>Votre retour aide les autres clients à choisir les meilleurs prestataires. Prenez 30 secondes pour noter votre expérience !", "info")
      : calloutBox("💳 <strong>Virement en cours</strong><br/>Le paiement sera versé sur votre compte sous 1 à 2 jours ouvrés. Merci pour votre excellent travail !", "success")}
  `;

  return emailLayout({
    title: `${headline} — Tasky`,
    previewText: subline,
    accent: isClient ? "client" : "prestataire",
    badgeLabel: isClient ? "👤 CLIENT" : "🛠️ PRESTATAIRE",
    emoji: "🎉",
    headline,
    subline,
    content,
    ctaText: isClient ? "Laisser un avis →" : "Voir mes prestations →",
    ctaUrl: prestationUrl,
    footerNote: `Vous recevez cet email car vous êtes ${isClient ? "client" : "prestataire"} sur Tasky.`,
  });
};
