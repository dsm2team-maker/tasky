import { emailLayout, paragraph, calloutBox, otpBlock } from "./base.template";

interface EmailChangeOtpProps {
  firstName: string;
  otp: string;
  newEmail: string;
}

export const emailChangeOtpTemplate = ({
  firstName,
  otp,
  newEmail,
}: EmailChangeOtpProps): string => {
  const content = `
    ${paragraph(`Bonjour <strong>${firstName}</strong>,`)}
    ${paragraph(`Vous avez demandé à modifier votre adresse email vers <strong>${newEmail}</strong>. Voici votre code de vérification :`)}
    ${otpBlock(otp)}
    ${calloutBox("⚠️ Si vous n'avez pas demandé ce changement, ignorez cet email et votre adresse email ne sera pas modifiée.", "danger")}
  `;

  return emailLayout({
    title: "Code de vérification — Tasky",
    previewText: `${firstName}, votre code de vérification Tasky : ${otp}`,
    accent: "security",
    badgeLabel: "✉️ Changement d'email",
    headline: "Votre code de vérification",
    content,
    footerNote: "Ce code est confidentiel. Tasky ne vous demandera jamais votre code par téléphone.",
  });
};
