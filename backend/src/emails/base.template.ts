// Éléments communs à tous les emails Tasky — header/footer/mise en page partagés.
// Basé sur des <table> avec styles inline (pas de <style> global) pour un rendu fiable
// dans tous les clients mail, y compris Outlook desktop.

export type EmailAccent = "client" | "prestataire" | "security" | "warning";

const ACCENTS: Record<EmailAccent, { primary: string; dark: string; light: string; border: string; text: string }> = {
  client:      { primary: "#ec4899", dark: "#db2777", light: "#fdf2f8", border: "#fbcfe8", text: "#9d174d" },
  prestataire: { primary: "#10b981", dark: "#059669", light: "#f0fdf4", border: "#6ee7b7", text: "#065f46" },
  security:    { primary: "#7c3aed", dark: "#6d28d9", light: "#f5f3ff", border: "#ddd6fe", text: "#5b21b6" },
  warning:     { primary: "#dc2626", dark: "#b91c1c", light: "#fef2f2", border: "#fecaca", text: "#991b1b" },
};

export interface EmailLayoutProps {
  title: string;
  previewText: string;
  accent?: EmailAccent;
  badgeLabel: string;
  emoji?: string;
  headline: string;
  subline?: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
  footerNote?: string;
  legalLinks?: boolean;
}

export const emailLayout = ({
  title,
  previewText,
  accent = "security",
  badgeLabel,
  emoji,
  headline,
  subline,
  content,
  ctaText,
  ctaUrl,
  footerNote,
  legalLinks = true,
}: EmailLayoutProps): string => {
  const c = ACCENTS[accent];
  const frontendUrl = process.env.FRONTEND_URL || "https://tasky.fr";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

              <!-- Header -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,${c.primary},${c.dark});padding:36px 40px 28px;text-align:center;">
                    <div style="display:inline-block;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);border-radius:99px;padding:5px 14px;margin-bottom:14px;">
                      <span style="color:#ffffff;font-size:13px;font-weight:600;">${badgeLabel}</span>
                    </div>
                    ${emoji ? `<div style="font-size:40px;margin-bottom:12px;">${emoji}</div>` : ""}
                    <h1 style="margin:0;color:#ffffff;font-size:23px;font-weight:800;line-height:1.3;">${headline}</h1>
                    ${subline ? `<p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${subline}</p>` : ""}
                  </td>
                </tr>
                <tr>
                  <td style="background:${c.primary};height:4px;"></td>
                </tr>
              </table>

              <!-- Corps -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:36px 40px;">
                    ${content}
                    ${ctaText && ctaUrl ? `
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
                      <tr>
                        <td align="center">
                          <a href="${ctaUrl}"
                            style="display:inline-block;background:linear-gradient(135deg,${c.primary},${c.dark});color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:16px 36px;border-radius:12px;letter-spacing:0.3px;">
                            ${ctaText}
                          </a>
                        </td>
                      </tr>
                    </table>
                    ` : ""}
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:24px 40px;text-align:center;">
                    <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;line-height:1.6;">
                      ${footerNote || "Vous recevez cet email car vous êtes inscrit sur Tasky.fr"}
                    </p>
                    <p style="margin:12px 0 8px;color:#6b7280;font-size:12px;font-weight:600;">Tasky.fr</p>
                    ${legalLinks ? `
                    <p style="margin:0 0 12px;">
                      <a href="${frontendUrl}/legal/privacy" style="color:${c.primary};font-size:11px;text-decoration:none;">Politique de confidentialité</a>
                      <span style="color:#d1d5db;margin:0 8px;">•</span>
                      <a href="${frontendUrl}/legal/cgu-client" style="color:${c.primary};font-size:11px;text-decoration:none;">CGU Clients</a>
                      <span style="color:#d1d5db;margin:0 8px;">•</span>
                      <a href="${frontendUrl}/legal/cgu-prestataire" style="color:${c.primary};font-size:11px;text-decoration:none;">CGU Prestataires</a>
                    </p>
                    ` : ""}
                    <p style="margin:0;color:#d1d5db;font-size:11px;">© ${new Date().getFullYear()} Tasky.fr — Tous droits réservés</p>
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

// ─── Blocs de contenu réutilisables ────────────────────────────────────────────

export const infoCard = (
  rows: { label: string; value: string; big?: boolean; color?: string }[],
  badge?: { label: string; color: "success" | "warning" | "danger" },
): string => {
  const badgeColors = {
    success: { bg: "#dcfce7", border: "#86efac", text: "#166534" },
    warning: { bg: "#fef3c7", border: "#fde68a", text: "#92400e" },
    danger: { bg: "#fee2e2", border: "#fecaca", text: "#991b1b" },
  };

  const rowsHtml = rows
    .map((r, i) => {
      const borderBottom = i < rows.length - 1 ? "border-bottom:1px solid #f3f4f6;" : "";
      const paddingTop = i === 0 ? 0 : 12;
      const paddingBottom = i === rows.length - 1 ? 0 : 12;
      const valueStyle = r.big
        ? `font-size:28px;font-weight:800;color:${r.color || "#111827"};`
        : `font-size:14px;font-weight:600;color:${r.color || "#374151"};`;
      return `
        <tr>
          <td style="padding-top:${paddingTop}px;padding-bottom:${paddingBottom}px;${borderBottom}">
            <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">${r.label}</span><br/>
            <span style="${valueStyle}">${r.value}</span>
          </td>
        </tr>`;
    })
    .join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table>
          ${badge ? `
          <div style="margin-top:14px;display:inline-block;background:${badgeColors[badge.color].bg};border:1px solid ${badgeColors[badge.color].border};border-radius:8px;padding:8px 14px;">
            <span style="font-size:13px;color:${badgeColors[badge.color].text};font-weight:600;">${badge.label}</span>
          </div>` : ""}
        </td>
      </tr>
    </table>`;
};

export const calloutBox = (html: string, tone: "info" | "success" | "warning" | "danger" = "info"): string => {
  const tones = {
    info: { bg: "#f5f3ff", border: "#ddd6fe", text: "#5b21b6" },
    success: { bg: "#f0fdf4", border: "#6ee7b7", text: "#065f46" },
    warning: { bg: "#fef3c7", border: "#fde68a", text: "#92400e" },
    danger: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
  };
  const t = tones[tone];
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="background:${t.bg};border:1px solid ${t.border};border-radius:12px;padding:16px 20px;">
          <div style="color:${t.text};font-size:13px;line-height:1.6;">${html}</div>
        </td>
      </tr>
    </table>`;
};

export const paragraph = (html: string): string =>
  `<p style="margin:0 0 16px;color:#6b7280;font-size:14px;line-height:1.7;">${html}</p>`;

export const otpBlock = (otp: string, accent: EmailAccent = "security"): string => {
  const c = ACCENTS[accent];
  return `
    <div style="text-align:center;margin:28px 0;">
      <div style="display:inline-block;background:${c.light};border:2px solid ${c.primary};border-radius:12px;padding:16px 40px;">
        <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:${c.primary};">${otp}</span>
      </div>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:12px;margin-bottom:24px;">
      🔒 Ce code est valable <strong>10 minutes</strong> et à usage unique.
    </p>`;
};
