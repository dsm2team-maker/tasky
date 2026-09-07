import { emailLayout, paragraph, calloutBox, otpBlock } from "./base.template";

interface PhoneChangeOtpProps {
  firstName: string;
  otp: string;
  newPhone: string; // Numéro masqué ex: "06•• •• •• 78"
  isAlert?: boolean; // true = email d'alerte après changement réussi
}

export const phoneChangeOtpTemplate = ({
  firstName,
  otp,
  newPhone,
  isAlert = false,
}: PhoneChangeOtpProps): string => {
  if (isAlert) {
    const content = `
      ${paragraph(`Bonjour <strong>${firstName}</strong>,`)}
      ${paragraph("Le numéro de téléphone associé à votre compte Tasky vient d'être modifié.")}
      ${calloutBox(`✅ Nouveau numéro : <strong>${newPhone}</strong>`, "success")}
      ${calloutBox("⚠️ Si vous n'êtes pas à l'origine de ce changement, contactez notre support immédiatement.", "danger")}
    `;

    return emailLayout({
      title: "Alerte sécurité — Téléphone modifié",
      previewText: `${firstName}, votre numéro de téléphone Tasky a été modifié.`,
      accent: "security",
      badgeLabel: "🔔 Alerte sécurité",
      headline: "Votre numéro de téléphone a été modifié",
      content,
      ctaText: "Contacter le support",
      ctaUrl: `${process.env.FRONTEND_URL}/contact`,
      footerNote: "Vous recevez cet email car une modification a été effectuée sur votre compte Tasky.",
    });
  }

  const content = `
    ${paragraph(`Bonjour <strong>${firstName}</strong>,`)}
    ${paragraph(`Vous avez demandé à modifier votre numéro de téléphone vers <strong>${newPhone}</strong>. Voici votre code de vérification :`)}
    ${otpBlock(otp)}
    ${calloutBox("⚠️ Si vous n'avez pas demandé ce changement, ignorez cet email et votre téléphone ne sera pas modifié.", "danger")}
  `;

  return emailLayout({
    title: "Code de vérification — Tasky",
    previewText: `${firstName}, votre code de vérification Tasky : ${otp}`,
    accent: "security",
    badgeLabel: "📱 Changement de téléphone",
    headline: "Votre code de vérification",
    content,
    footerNote: "Ce code est confidentiel. Tasky ne vous demandera jamais votre code par téléphone.",
  });
};
