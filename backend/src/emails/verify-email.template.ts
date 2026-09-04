import { emailLayout, paragraph, calloutBox } from "./base.template";

interface VerifyEmailProps {
  firstName: string;
  verificationUrl: string;
  variant?: "client" | "prestataire";
}

export const verifyEmailTemplate = ({
  firstName,
  verificationUrl,
  variant = "client",
}: VerifyEmailProps): string => {
  const isPrestataire = variant === "prestataire";
  const roleLabel = isPrestataire ? "PRESTATAIRE" : "CLIENT";
  const badgeEmoji = isPrestataire ? "🛠️" : "👤";

  const roleFeatures = isPrestataire
    ? [
        "Proposer vos services",
        "Recevoir des demandes de clients",
        "Développer votre activité",
        "Gérer vos opportunités depuis votre espace",
      ]
    : [
        "Publier vos besoins ou projets",
        "Trouver des prestataires qualifiés",
        "Comparer les profils et les avis",
        "Contacter facilement les prestataires",
      ];

  const featuresHtml = roleFeatures
    .map((f, i) => `
      <li style="padding:6px 0;${i < roleFeatures.length - 1 ? "border-bottom:1px solid rgba(0,0,0,0.06);" : ""}color:#374151;font-size:14px;">✦ &nbsp;${f}</li>
    `)
    .join("");

  const content = `
    ${paragraph(`Bonjour <strong>${firstName}</strong>,`)}
    ${paragraph(`Merci de vous être inscrit sur Tasky. Votre compte a été créé avec succès sur la plateforme en tant que <strong style="color:#111827;">${roleLabel}</strong>.`)}
    ${paragraph("Tasky est une plateforme qui met en relation des clients et des prestataires de services pour réaliser facilement des projets près de chez vous.")}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="background:${isPrestataire ? "#f0fdf4" : "#fdf2f8"};border:1px solid ${isPrestataire ? "#6ee7b7" : "#fbcfe8"};border-radius:12px;padding:20px 24px;">
          <p style="margin:0 0 14px;color:#111827;font-size:14px;font-weight:700;">En tant que ${roleLabel.toLowerCase()}, vous pourrez :</p>
          <ul style="margin:0;padding:0;list-style:none;">${featuresHtml}</ul>
        </td>
      </tr>
    </table>

    ${calloutBox(`<strong>🔐 Activation de votre compte</strong><br/>Avant de commencer, vous devez confirmer votre adresse email. Cliquez sur le bouton ci-dessous pour activer votre compte.`, "info")}

    <p style="margin:0 0 24px;text-align:center;color:#9ca3af;font-size:12px;">🔒 Ce lien est valable pendant <strong>24 heures</strong>.</p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;">
          <p style="margin:0 0 8px;color:#6b7280;font-size:12px;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
          <p style="margin:0;word-break:break-all;"><a href="${verificationUrl}" style="color:#7c3aed;font-size:11px;text-decoration:none;">${verificationUrl}</a></p>
        </td>
      </tr>
    </table>
  `;

  return emailLayout({
    title: `Bienvenue sur Tasky, ${firstName} !`,
    previewText: `Bienvenue ${firstName} ! Confirmez votre email pour activer votre compte Tasky.`,
    accent: isPrestataire ? "prestataire" : "client",
    badgeLabel: `${badgeEmoji} ${roleLabel}`,
    headline: `Bienvenue sur Tasky,<br/>${firstName} ! 🎉`,
    content,
    ctaText: "Confirmer mon email →",
    ctaUrl: verificationUrl,
    footerNote: "Vous recevez cet email car vous avez créé un compte sur la plateforme Tasky. Si vous n'êtes pas à l'origine de cette inscription, vous pouvez simplement ignorer cet email.",
  });
};
