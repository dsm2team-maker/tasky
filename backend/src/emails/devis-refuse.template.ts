interface DevisRefuseProps {
  firstName: string;
  demandeReference: string; // ex: TSK-000003
  demandeTitre: string;
  demandesUrl: string;
}

export const devisRefuseTemplate = ({
  firstName,
  demandeReference,
  demandeTitre,
  demandesUrl,
}: DevisRefuseProps): string => {
  const frontendUrl = process.env.FRONTEND_URL || "https://tasky.fr";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Votre devis n'a pas été retenu — Tasky</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <div style="display:none;max-height:0;overflow:hidden;">
    Votre devis pour ${demandeReference} n'a pas été retenu. D'autres opportunités vous attendent.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

              <!-- Header -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#6366f1,#7c3aed);padding:36px 40px 28px;text-align:center;">
                    <div style="margin-bottom:16px;">
                      <a href="${frontendUrl}" style="text-decoration:none;">
                        <img src="/assets/logo-tasky.png" alt="Tasky" height="36" style="height:36px;width:auto;display:block;margin:0 auto;filter:brightness(0) invert(1);"/>
                      </a>
                    </div>
                    <div style="display:inline-block;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);border-radius:99px;padding:5px 14px;margin-bottom:14px;">
                      <span style="color:#ffffff;font-size:13px;font-weight:600;">🛠️ PRESTATAIRE</span>
                    </div>
                    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;line-height:1.3;">
                      Devis non retenu
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="background:#10b981;height:4px;"></td>
                </tr>
              </table>

              <!-- Corps -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:36px 40px;">

                    <p style="margin:0 0 8px;color:#111827;font-size:15px;font-weight:600;">Bonjour ${firstName},</p>
                    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.7;">
                      Le client a examiné les devis reçus et a choisi de retenir une autre proposition pour cette demande.
                    </p>

                    <!-- Bloc demande -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr>
                        <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:20px 24px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-bottom:12px;border-bottom:1px solid #f3f4f6;">
                                <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Référence</span><br/>
                                <span style="font-family:monospace;font-size:18px;font-weight:800;color:#111827;">${demandeReference}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-top:12px;">
                                <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Demande</span><br/>
                                <span style="font-size:14px;font-weight:600;color:#374151;">${demandeTitre}</span>
                              </td>
                            </tr>
                          </table>
                          <div style="margin-top:14px;display:inline-block;background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:8px 14px;">
                            <span style="font-size:13px;color:#92400e;font-weight:600;">⚠️ Devis non retenu</span>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Message encouragement -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr>
                        <td style="background:#f0fdf4;border:1px solid #6ee7b7;border-radius:12px;padding:18px 22px;border-left:4px solid #10b981;">
                          <p style="margin:0 0 6px;color:#065f46;font-size:14px;font-weight:700;">💡 Ne vous découragez pas</p>
                          <p style="margin:0;color:#047857;font-size:13px;line-height:1.6;">
                            De nouvelles demandes compatibles avec votre profil sont publiées chaque jour. Continuez à répondre rapidement — les clients accordent beaucoup d'importance à la réactivité.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                      <tr>
                        <td align="center">
                          <a href="${demandesUrl}"
                            style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:16px 36px;border-radius:12px;letter-spacing:0.3px;">
                            Voir les nouvelles demandes →
                          </a>
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
                      Vous recevez cet email car vous êtes prestataire sur Tasky.<br/>
                      Gérez vos préférences de notification depuis votre espace.
                    </p>
                    <p style="margin:12px 0 8px;color:#6b7280;font-size:12px;font-weight:600;">Tasky.fr</p>
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
