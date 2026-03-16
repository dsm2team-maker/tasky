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

  const accentColor = isPrestataire ? "#10b981" : "#ec4899";
  const accentLight = isPrestataire ? "#f0fdf4" : "#fdf2f8";
  const accentBorder = isPrestataire ? "#6ee7b7" : "#fbcfe8";
  const roleLabel = isPrestataire ? "PRESTATAIRE" : "CLIENT";
  const badgeEmoji = isPrestataire ? "🛠️" : "👤";

  const roleFeatures = isPrestataire
    ? `<ul style="margin:0;padding:0;list-style:none;">
        <li style="padding:6px 0;border-bottom:1px solid ${accentBorder};color:#374151;font-size:14px;">✦ &nbsp;Proposer vos services</li>
        <li style="padding:6px 0;border-bottom:1px solid ${accentBorder};color:#374151;font-size:14px;">✦ &nbsp;Recevoir des demandes de clients</li>
        <li style="padding:6px 0;border-bottom:1px solid ${accentBorder};color:#374151;font-size:14px;">✦ &nbsp;Développer votre activité</li>
        <li style="padding:6px 0;color:#374151;font-size:14px;">✦ &nbsp;Gérer vos opportunités depuis votre espace</li>
      </ul>`
    : `<ul style="margin:0;padding:0;list-style:none;">
        <li style="padding:6px 0;border-bottom:1px solid ${accentBorder};color:#374151;font-size:14px;">✦ &nbsp;Publier vos besoins ou projets</li>
        <li style="padding:6px 0;border-bottom:1px solid ${accentBorder};color:#374151;font-size:14px;">✦ &nbsp;Trouver des prestataires qualifiés</li>
        <li style="padding:6px 0;border-bottom:1px solid ${accentBorder};color:#374151;font-size:14px;">✦ &nbsp;Comparer les profils et les avis</li>
        <li style="padding:6px 0;color:#374151;font-size:14px;">✦ &nbsp;Contacter facilement les prestataires</li>
      </ul>`;

  const frontendUrl = process.env.FRONTEND_URL || "https://tasky.fr";
  const imaEnLocal = "tasky";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Bienvenue sur Tasky, ${firstName} !</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <!-- Preview text -->
  <div style="display:none;max-height:0;overflow:hidden;">
    Bienvenue ${firstName} ! Confirmez votre email pour activer votre compte Tasky.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Carte principale -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

              <!-- Header dégradé violet -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#6366f1,#7c3aed);padding:40px 40px 32px;text-align:center;">
                    <!-- Logo dans le header -->
                  <div style="margin-bottom:20px;">
                    <a href="${frontendUrl}" style="text-decoration:none;">
                      <img src="/assets/logo-tasky.png" alt="Tasky" height="40" style="height:40px;width:auto;display:block;margin:0 auto;filter:brightness(0) invert(1);"/>
                    </a>
                  </div>
                  <!-- Badge rôle -->
                    <div style="display:inline-block;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);border-radius:99px;padding:6px 16px;margin-bottom:16px;">
                      <span style="color:#ffffff;font-size:13px;font-weight:600;letter-spacing:0.5px;">${badgeEmoji} ${roleLabel}</span>
                    </div>
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;line-height:1.3;">
                      Bienvenue sur Tasky,<br/>${firstName} ! 🎉
                    </h1>
                  </td>
                </tr>
                <!-- Bande couleur rôle -->
                <tr>
                  <td style="background:${accentColor};height:4px;"></td>
                </tr>
              </table>

              <!-- Corps -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:36px 40px;">

                    <!-- Intro -->
                    <p style="margin:0 0 8px;color:#111827;font-size:15px;font-weight:600;">Bonjour ${firstName},</p>
                    <p style="margin:0 0 16px;color:#6b7280;font-size:14px;line-height:1.7;">
                      Merci de vous être inscrit sur Tasky. Votre compte a été créé avec succès sur la plateforme en tant que <strong style="color:#111827;">${roleLabel}</strong>.
                    </p>
                    <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.7;">
                      Tasky est une plateforme qui met en relation des clients et des prestataires de services pour réaliser facilement des projets près de chez vous.
                    </p>

                    <!-- Bloc rôle -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr>
                        <td style="background:${accentLight};border:1px solid ${accentBorder};border-radius:12px;padding:20px 24px;">
                          <p style="margin:0 0 14px;color:#111827;font-size:14px;font-weight:700;">
                            En tant que ${roleLabel.toLowerCase()}, vous pourrez :
                          </p>
                          ${roleFeatures}
                        </td>
                      </tr>
                    </table>

                    <!-- Activation -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                      <tr>
                        <td style="background:#f9fafb;border-radius:12px;padding:20px 24px;border-left:4px solid #7c3aed;">
                          <p style="margin:0 0 6px;color:#111827;font-size:14px;font-weight:700;">🔐 Activation de votre compte</p>
                          <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
                            Avant de commencer, vous devez confirmer votre adresse email.<br/>
                            Cliquez sur le bouton ci-dessous pour activer votre compte.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Bouton CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr>
                        <td align="center">
                          <a href="${verificationUrl}"
                            style="display:inline-block;background:${accentColor};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:16px 40px;border-radius:12px;letter-spacing:0.3px;">
                            Confirmer mon email →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Sécurité -->
                    <p style="margin:0 0 24px;text-align:center;color:#9ca3af;font-size:12px;">
                      🔒 Ce lien est valable pendant <strong>24 heures</strong>.
                    </p>

                    <!-- Lien alternatif -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;">
                          <p style="margin:0 0 8px;color:#6b7280;font-size:12px;">
                            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
                          </p>
                          <p style="margin:0;word-break:break-all;">
                            <a href="${verificationUrl}" style="color:#7c3aed;font-size:11px;text-decoration:none;">${verificationUrl}</a>
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:24px 40px;text-align:center;">
                    <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;line-height:1.6;">
                      Vous recevez cet email car vous avez créé un compte sur la plateforme Tasky.<br/>
                      Si vous n'êtes pas à l'origine de cette inscription, vous pouvez simplement ignorer cet email.
                    </p>
                    <p style="margin:12px 0 8px;color:#6b7280;font-size:12px;font-weight:600;">Tasky.fr</p>
                    <p style="margin:0 0 12px;color:#9ca3af;font-size:11px;font-style:italic;">La plateforme qui connecte clients et prestataires.</p>
                    <p style="margin:0 0 12px;">
                      <a href="${frontendUrl}/legal/privacy" style="color:#7c3aed;font-size:11px;text-decoration:none;">Politique de confidentialité</a>
                      <span style="color:#d1d5db;margin:0 8px;">•</span>
                      <a href="${frontendUrl}/legal/cgu" style="color:#7c3aed;font-size:11px;text-decoration:none;">CGU</a>
                    </p>
                    <p style="margin:0;color:#d1d5db;font-size:11px;">© 2026 Tasky.fr — Tous droits réservés</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
};
