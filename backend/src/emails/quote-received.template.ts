interface QuoteReceivedProps {
  firstName: string;
  demandeReference: string;
  demandeTitre: string;
  prestataireNom: string;
  montant: number;
  devisUrl: string;
}

export const quoteReceivedTemplate = ({
  firstName,
  demandeReference,
  demandeTitre,
  prestataireNom,
  montant,
  devisUrl,
}: QuoteReceivedProps): string => {
  const frontendUrl = process.env.FRONTEND_URL || "https://tasky.fr";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Nouveau devis reçu — Tasky</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <div style="display:none;max-height:0;overflow:hidden;">
    ${prestataireNom} vous a envoyé un devis de ${montant.toFixed(2)} € pour votre demande ${demandeReference}.
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
                  <td style="background:linear-gradient(135deg,#ec4899,#db2777);padding:36px 40px 28px;text-align:center;">
                    <div style="display:inline-block;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);border-radius:99px;padding:5px 14px;margin-bottom:14px;">
                      <span style="color:#ffffff;font-size:13px;font-weight:600;">👤 CLIENT</span>
                    </div>
                    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;line-height:1.3;">
                      Nouveau devis reçu !
                    </h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Un prestataire a répondu à votre demande</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#ec4899;height:4px;"></td>
                </tr>
              </table>

              <!-- Corps -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:36px 40px;">

                    <p style="margin:0 0 8px;color:#111827;font-size:15px;font-weight:600;">Bonjour ${firstName},</p>
                    <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.7;">
                      Bonne nouvelle ! <strong>${prestataireNom}</strong> a soumis un devis pour votre demande.
                    </p>

                    <!-- Bloc devis -->
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
                              <td style="padding-top:12px;padding-bottom:12px;border-bottom:1px solid #f3f4f6;">
                                <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Demande</span><br/>
                                <span style="font-size:14px;font-weight:600;color:#374151;">${demandeTitre}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-top:12px;padding-bottom:12px;border-bottom:1px solid #f3f4f6;">
                                <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Prestataire</span><br/>
                                <span style="font-size:14px;font-weight:600;color:#374151;">${prestataireNom}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-top:12px;">
                                <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Montant proposé</span><br/>
                                <span style="font-size:28px;font-weight:800;color:#ec4899;">${montant.toFixed(2)} €</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Info commission -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr>
                        <td style="background:#fdf2f8;border:1px solid #fbcfe8;border-radius:12px;padding:14px 18px;">
                          <p style="margin:0;color:#9d174d;font-size:13px;line-height:1.6;">
                            💡 <strong>Vous payez exactement ce montant</strong> — la commission Tasky est à la charge du prestataire, pas de vous.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                      <tr>
                        <td align="center">
                          <a href="${devisUrl}"
                            style="display:inline-block;background:linear-gradient(135deg,#ec4899,#db2777);color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:16px 36px;border-radius:12px;letter-spacing:0.3px;">
                            Voir le devis →
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
                      Vous recevez cet email car vous êtes client sur Tasky.
                    </p>
                    <p style="margin:12px 0 8px;color:#6b7280;font-size:12px;font-weight:600;">Tasky.fr</p>
                    <p style="margin:0 0 12px;">
                      <a href="${frontendUrl}/legal/privacy" style="color:#ec4899;font-size:11px;text-decoration:none;">Politique de confidentialité</a>
                      <span style="color:#d1d5db;margin:0 8px;">•</span>
                      <a href="${frontendUrl}/legal/cgu-client" style="color:#ec4899;font-size:11px;text-decoration:none;">CGU</a>
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
