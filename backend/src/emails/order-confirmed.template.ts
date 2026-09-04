import { splitMontant } from "../config/commission.config";
import { emailLayout, paragraph, infoCard, calloutBox } from "./base.template";

interface OrderConfirmedProps {
  firstName: string;
  demandeReference: string;
  demandeTitre: string;
  montant: number;
  role: "client" | "prestataire";
  prestationUrl: string;
}

export const orderConfirmedTemplate = ({
  firstName,
  demandeReference,
  demandeTitre,
  montant,
  role,
  prestationUrl,
}: OrderConfirmedProps): string => {
  const isClient = role === "client";

  const headline = isClient ? "Paiement confirmé — Prestation lancée !" : "Nouvelle prestation confirmée !";
  const subline = isClient
    ? "Votre paiement a bien été reçu. La prestation est maintenant en cours."
    : "Un client vient de confirmer son paiement. Votre prestation démarre.";
  const ctaLabel = isClient ? "Suivre ma demande →" : "Voir ma prestation →";
  const montantLabel = isClient ? "Montant payé" : "Montant à percevoir (net)";
  const montantAffiche = isClient ? montant : splitMontant(montant).montantPrestataire;

  const content = `
    ${paragraph(`Bonjour <strong>${firstName}</strong>,<br/>${subline}`)}
    ${infoCard(
      [
        { label: "Référence", value: demandeReference },
        { label: "Prestation", value: demandeTitre },
        {
          label: montantLabel,
          value: `${montantAffiche.toFixed(2)} €${!isClient ? ` <span style="font-size:12px;color:#9ca3af;font-weight:400;">(après commission Tasky 15%)</span>` : ""}`,
          big: true,
          color: isClient ? "#ec4899" : "#10b981",
        },
      ],
      { label: "✅ En cours", color: "success" },
    )}
    ${calloutBox(
      isClient
        ? "💬 Utilisez la messagerie de la plateforme pour rester en contact avec votre prestataire."
        : "💡 Vous avez <strong>3 jours</strong> après livraison pour que le client valide la prestation. Passé ce délai, elle sera validée automatiquement.",
      isClient ? "info" : "success",
    )}
  `;

  return emailLayout({
    title: `${headline} — Tasky`,
    previewText: subline,
    accent: isClient ? "client" : "prestataire",
    badgeLabel: isClient ? "👤 CLIENT" : "🛠️ PRESTATAIRE",
    emoji: "✅",
    headline,
    subline,
    content,
    ctaText: ctaLabel,
    ctaUrl: prestationUrl,
    footerNote: `Vous recevez cet email car vous êtes ${isClient ? "client" : "prestataire"} sur Tasky.`,
  });
};
