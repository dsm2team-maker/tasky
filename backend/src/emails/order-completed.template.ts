interface OrderCompletedProps {
  firstName: string;
  demandeReference: string;
  demandeTitre: string;
  montant: number;
  role: "client" | "prestataire";
  isAutoValidated?: boolean;
  prestationUrl: string;
}

export const orderCompletedTemplate = ({
  firstName,
  demandeReference,
  demandeTitre,
  montant,
  role,
  isAutoValidated = false,
  prestationUrl,
}: OrderCompletedProps): string => {
  const frontendUrl = process.env.FRONTEND_URL || "https://tasky.fr";
  const isClient = role === "client";

  const headline = isClient ? "Prestation terminée !" : "Prestation validée — Paiement en cours !";
  const subline = isClient
    ? isAutoValidated
      ? "La prestation a été automatiquement validée (délai de 3 jours écoulé)."
      : "Vous avez validé la prestation. Merci d'avoir utilisé Tasky !"
    : "La prestation est terminée et validée. Votre paiement va être traité.";

  const accentColor = isClient ? "#ec4899" : "#10b981";
  const accentColorDark = isClient ? "#db2777" : "#059669";
  const tagLabel = isClient ? "👤 CLIENT" : "🛠️ PRESTATAIRE";
  const montantLabel = isClient ? "Montant total payé" : "Net à percevoir";
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
                    <div style="font-size:48px;margin-bottom:12px;">🎉</div>
                    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;">${headline}</h1>
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

                    <!-- Bloc récap -->
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
                                ${!isClient ? `<span style="font-size:12px;color:#9ca3af;margin-left:6px;">(commission Tasky 15% déduite)</span>` : ""}
                              </td>
                            </tr>
                          </table>
                          <div style="margin-top:14px;display:inline-block;background:#dcfce7;border:1px solid #86efac;border-radius:8px;padding:8px 14px;">
                            <span style="font-size:13px;color:#166534;font-weight:600;">✅ Terminée</span>
                          </div>
                        </td>
                      </tr>
                    </table>

                    ${isClient ? `
                    <!-- Invitation à laisser un avis -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr>
                        <td style="background:#fdf2f8;border:1px solid #fbcfe8;border-radius:12px;padding:18px 22px;border-left:4px solid #ec4899;">
                          <p style="margin:0 0 6px;color:#9d174d;font-size:14px;font-weight:700;">⭐ Donnez votre avis</p>
                          <p style="margin:0;color:#be185d;font-size:13px;line-height:1.6;">
                            Votre retour aide les autres clients à choisir les meilleurs prestataires. Prenez 30 secondes pour noter votre expérience !
                          </p>
                        </td>
                      </tr>
                    </table>
                    ` : `
                    <!-- Info virement -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr>
                        <td style="background:#f0fdf4;border:1px solid #6ee7b7;border-radius:12px;padding:18px 22px;border-left:4px solid #10b981;">
                          <p style="margin:0 0 6px;color:#065f46;font-size:14px;font-weight:700;">💳 Virement en cours</p>
                          <p style="margin:0;color:#047857;font-size:13px;line-height:1.6;">
                            Le paiement sera versé sur votre IBAN sous 1 à 2 jours ouvrés. Merci pour votre excellent travail !
                          </p>
                        </td>
                      </tr>
                    </table>
                    `}

                    <!-- CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${prestationUrl}"
                            style="display:inline-block;background:linear-gradient(135deg,${accentColor},${accentColorDark});color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:16px 36px;border-radius:12px;letter-spacing:0.3px;">
                            ${isClient ? "Laisser un avis →" : "Voir mes prestations →"}
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
