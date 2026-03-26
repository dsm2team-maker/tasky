import { baseTemplate } from "./base.template";

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
  // ── Mode alerte : changement déjà effectué ──────────────────────────────────
  if (isAlert) {
    const content = `
      <div class="badge">🔔 Alerte sécurité</div>
      <h1 class="title">Votre numéro de téléphone a été modifié</h1>
      <p class="text">Bonjour <strong>${firstName}</strong>,</p>
      <p class="text">
        Le numéro de téléphone associé à votre compte Tasky vient d'être modifié.
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;margin-bottom:16px;">
        <p style="font-size:13px;color:#166534;">
          ✅ Nouveau numéro : <strong>${newPhone}</strong>
        </p>
      </div>
      <div style="background:#fef2f2;border-radius:8px;padding:12px 16px;margin-bottom:16px;">
        <p style="font-size:13px;color:#dc2626;">
          ⚠️ Si vous n'êtes pas à l'origine de ce changement, contactez notre support immédiatement.
        </p>
      </div>
    `;

    return baseTemplate({
      title: "Alerte sécurité — Téléphone modifié",
      previewText: `${firstName}, votre numéro de téléphone Tasky a été modifié.`,
      content,
      ctaText: "Contacter le support",
      ctaUrl: `${process.env.FRONTEND_URL}/support`,
      variant: "default",
      footerText:
        "Vous recevez cet email car une modification a été effectuée sur votre compte Tasky.",
    });
  }

  // ── Mode OTP : code de vérification ────────────────────────────────────────
  const content = `
    <div class="badge">📱 Changement de téléphone</div>
    <h1 class="title">Votre code de vérification</h1>
    <p class="text">Bonjour <strong>${firstName}</strong>,</p>
    <p class="text">
      Vous avez demandé à modifier votre numéro de téléphone vers <strong>${newPhone}</strong>.
      Voici votre code de vérification :
    </p>
    <div style="text-align:center;margin:28px 0;">
      <div style="display:inline-block;background:#f5f3ff;border:2px solid #7c3aed;border-radius:12px;padding:16px 40px;">
        <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#7c3aed;">${otp}</span>
      </div>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:12px;margin-bottom:24px;">
      🔒 Ce code est valable <strong>10 minutes</strong> et à usage unique.
    </p>
    <div style="background:#fef2f2;border-radius:8px;padding:12px 16px;">
      <p style="font-size:13px;color:#dc2626;">
        ⚠️ Si vous n'avez pas demandé ce changement, ignorez cet email et votre téléphone ne sera pas modifié.
      </p>
    </div>
  `;

  return baseTemplate({
    title: "Code de vérification — Tasky",
    previewText: `${firstName}, votre code de vérification Tasky : ${otp}`,
    content,
    variant: "default",
    footerText:
      "Ce code est confidentiel. Tasky ne vous demandera jamais votre code par téléphone.",
  });
};
