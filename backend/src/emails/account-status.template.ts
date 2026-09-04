import { emailLayout, paragraph, calloutBox } from "./base.template";

interface AccountStatusProps {
  firstName: string;
  suspended: boolean;
  reason?: string;
  supportUrl: string;
}

export const accountStatusTemplate = ({
  firstName,
  suspended,
  reason,
  supportUrl,
}: AccountStatusProps): string => {
  const headline = suspended ? "Votre compte a été suspendu" : "Votre compte a été réactivé";
  const subline = suspended
    ? "L'accès à votre compte Tasky est temporairement restreint"
    : "Vous pouvez de nouveau utiliser votre compte Tasky normalement";

  const content = `
    ${paragraph(`Bonjour <strong>${firstName}</strong>,`)}
    ${suspended
      ? paragraph("Suite à une vérification de notre équipe, votre compte Tasky a été suspendu. Vous ne pouvez plus accéder à certaines fonctionnalités de la plateforme jusqu'à nouvel ordre.")
      : paragraph("Bonne nouvelle : votre compte Tasky a été réactivé. Vous pouvez de nouveau accéder à l'ensemble des fonctionnalités de la plateforme.")}
    ${suspended && reason ? calloutBox(`<strong>Motif :</strong><br/>${reason}`, "danger") : ""}
    ${suspended
      ? calloutBox("📩 Si vous pensez qu'il s'agit d'une erreur, vous pouvez contacter notre équipe support pour obtenir plus d'informations.", "warning")
      : calloutBox("✅ Merci de votre patience. N'hésitez pas à nous contacter si vous avez la moindre question.", "success")}
  `;

  return emailLayout({
    title: `${headline} — Tasky`,
    previewText: subline,
    accent: suspended ? "warning" : "security",
    badgeLabel: "🛡️ TASKY",
    emoji: suspended ? "⛔" : "✅",
    headline,
    subline,
    content,
    ctaText: "Contacter le support →",
    ctaUrl: supportUrl,
    footerNote: "Vous recevez cet email suite à une action de l'équipe Tasky sur votre compte.",
  });
};
