import { baseTemplate } from "./base.template";

interface DeleteAccountOtpProps {
  firstName: string;
  otp: string;
}

export const deleteAccountOtpTemplate = ({
  firstName,
  otp,
}: DeleteAccountOtpProps): string => {
  const content = `
    <div class="badge" style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;">🗑️ Suppression de compte</div>
    <h1 class="title">Confirmation de suppression</h1>
    <p class="text">Bonjour <strong>${firstName}</strong>,</p>
    <p class="text">
      Vous avez demandé la suppression définitive de votre compte Tasky.
      Voici votre code de confirmation :
    </p>
    <div style="text-align:center;margin:28px 0;">
      <div style="display:inline-block;background:#fef2f2;border:2px solid #dc2626;border-radius:12px;padding:16px 40px;">
        <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#dc2626;">${otp}</span>
      </div>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:12px;margin-bottom:24px;">
      🔒 Ce code est valable <strong>10 minutes</strong> et à usage unique.
    </p>
    <div style="background:#fef2f2;border-radius:8px;padding:12px 16px;">
      <p style="font-size:13px;color:#dc2626;">
        ⚠️ Cette action est <strong>irréversible</strong>. Vos données personnelles seront anonymisées.
        Si vous n'êtes pas à l'origine de cette demande, ignorez cet email — votre compte restera actif.
      </p>
    </div>
  `;

  return baseTemplate({
    title: "Confirmation de suppression — Tasky",
    previewText: `${firstName}, votre code de suppression de compte Tasky : ${otp}`,
    content,
    variant: "default",
    footerText:
      "Ce code est confidentiel. Tasky ne vous demandera jamais votre code par téléphone.",
  });
};
