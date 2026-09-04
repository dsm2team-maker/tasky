import { emailLayout, paragraph, calloutBox, otpBlock } from "./base.template";

interface DeleteAccountOtpProps {
  firstName: string;
  otp: string;
}

export const deleteAccountOtpTemplate = ({
  firstName,
  otp,
}: DeleteAccountOtpProps): string => {
  const content = `
    ${paragraph(`Bonjour <strong>${firstName}</strong>,`)}
    ${paragraph("Vous avez demandé la suppression définitive de votre compte Tasky. Voici votre code de confirmation :")}
    ${otpBlock(otp, "warning")}
    ${calloutBox("⚠️ Cette action est <strong>irréversible</strong>. Vos données personnelles seront anonymisées. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email — votre compte restera actif.", "danger")}
  `;

  return emailLayout({
    title: "Confirmation de suppression — Tasky",
    previewText: `${firstName}, votre code de suppression de compte Tasky : ${otp}`,
    accent: "warning",
    badgeLabel: "🗑️ Suppression de compte",
    headline: "Confirmation de suppression",
    content,
    footerNote: "Ce code est confidentiel. Tasky ne vous demandera jamais votre code par téléphone.",
  });
};
