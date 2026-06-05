interface OrderConfirmedProps {
  firstName: string;
  demandeReference: string;
  demandeTitre: string;
  montant: number;
  role: "client" | "prestataire";
  prestationUrl: string;
}

export const orderConfirmedTemplate = ({
  firstName,
  demandeReference,
  demandeTitre,
  montant,
  role,
  prestationUrl,
}: OrderConfirmedProps): string => {
  const frontendUrl = process.env.FRONTEND_URL || "https://tasky.fr";
  const isClient = role === "client";

  const tagLabel = isClient ? "👤 CLIENT" : "🛠️ PRESTATAIRE";
  const headline = isClient
    ? "Paiement confirmé — Prestation lancée !"
    : "Nouvelle prestation confirmée !";
  const subline = isClient
    ? "Votre paiement a bien été reçu. La prestation est maintenant en cours."
    : "Un client vient de confirmer son paiement. Votre prestation démarre.";
  const ctaLabel = isClient ? "Suivre ma demande →" : "Voir ma prestation →";
  const accentColor = isClient ? "#ec4899" : "#10b981";
  const accentColorDark = isClient ? "#db2777" : "#059669";
  const badgeBg = isClient ? "#fdf2f8" : "#f0fdf4";
  const badgeBorder = isClient ? "#fbcfe8" : "#6ee7b7";
  const badgeText = isClient ? "#9d174d" : "#065f46";
  const montantLabel = isClient ? "Montant payé" : "Montant à percevoir (net)";
  const montantAffiche = isClient ? montant : montant * 0.85;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${headline} — Tasky</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <div style="display:none;max-height:0;overflow:hidden;">
    ${subline}
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
                  <td style="background:linear-gradient(135deg,${accentColor},${accentColorDark});padding:36px 40px 28px;text-align:center;">
                    <div style="display:inline-block;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);border-radius:99px;padding:5px 14px;margin-bottom:14px;">
                      <span style="color:#ffffff;font-size:13px;font-weight:600;">${tagLabel}</span>
                    </div>
                    <div style="font-size:40px;margin-bottom:12px;">✅</div>
                    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;line-height:1.3;">${headline}</h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${subline}</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:${accentColor};height:4px;"></td>
                </tr>
              </table>

              <!-- Corps -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:36px 40px;">

                    <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.7;">
                      Bonjour <strong>${firstName}</strong>,<br/>${subline}
                    </p>

                    <!-- Bloc prestation -->
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
                                <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Prestation</span><br/>
                                <span style="font-size:14px;font-weight:600;color:#374151;">${demandeTitre}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-top:12px;">
                                <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">${montantLabel}</span><br/>
                                <span style="font-size:28px;font-weight:800;color:${accentColor};">${montantAffiche.toFixed(2)} €</span>
                                ${!isClient ? `<span style="font-size:12px;color:#9ca3af;margin-left:6px;">(après commission Tasky 15%)</span>` : ""}
                              </td>
                            </tr>
                          </table>
                          <div style="margin-top:14px;display:inline-block;background:#dcfce7;border:1px solid #86efac;border-radius:8px;padding:8px 14px;">
                            <span style="font-size:13px;color:#166534;font-weight:600;">✅ En cours</span>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Note -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr>
                        <td style="background:${badgeBg};border:1px solid ${badgeBorder};border-radius:12px;padding:14px 18px;">
                          <p style="margin:0;color:${badgeText};font-size:13px;line-height:1.6;">
                            ${isClient
                              ? "💬 Utilisez la messagerie de la plateforme pour rester en contact avec votre prestataire."
                              : "💡 Vous avez <strong>3 jours</strong> après livraison pour que le client valide la prestation. Passé ce délai, elle sera validée automatiquement."}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${prestationUrl}"
                            style="display:inline-block;background:linear-gradient(135deg,${accentColor},${accentColorDark});color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:16px 36px;border-radius:12px;letter-spacing:0.3px;">
                            ${ctaLabel}
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
                    <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;">Vous recevez cet email car vous êtes ${isClient ? "client" : "prestataire"} sur Tasky.</p>
                    <p style="margin:12px 0 8px;color:#6b7280;font-size:12px;font-weight:600;">Tasky.fr</p>
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
