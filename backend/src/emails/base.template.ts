export interface BaseTemplateProps {
  title: string;
  previewText: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
  variant?: "client" | "prestataire" | "default";
  footerText?: string;
}

const COLORS = {
  client: { primary: "#ec4899", light: "#fdf2f8" },           // Rose
  prestataire: { primary: "#10b981", light: "#f0fdf4" },      // Vert
  default: { primary: "#7c3aed", light: "#f5f3ff" },          // Violet
};

export const baseTemplate = ({
  title,
  previewText,
  content,
  ctaText,
  ctaUrl,
  variant = "default",
  footerText,
}: BaseTemplateProps): string => {
  const color = COLORS[variant];

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; color: #111827; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
    .card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #6366f1, #7c3aed); padding: 32px; text-align: center; }
    .header-band { background: ${color.primary}; height: 4px; }
    .logo { color: white; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .logo span { opacity: 0.8; }
    .body { padding: 40px 32px; }
    .title { font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 16px; }
    .text { font-size: 15px; color: #6b7280; line-height: 1.6; margin-bottom: 16px; }
    .cta-wrapper { text-align: center; margin: 32px 0; }
    .cta { display: inline-block; background: ${color.primary}; color: white; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 15px; text-decoration: none; }
    .divider { border: none; border-top: 1px solid #f3f4f6; margin: 24px 0; }
    .footer { background: #f9fafb; padding: 24px 32px; text-align: center; }
    .footer-text { font-size: 12px; color: #9ca3af; line-height: 1.6; }
    .footer-link { color: #7c3aed; text-decoration: none; }
    .badge { display: inline-block; background: ${color.light}; color: ${color.primary}; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
  </style>
</head>
<body>
  <!-- Preview text (invisible) -->
  <div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>

  <div class="wrapper">
    <div class="card">
      <!-- Header violet -->
      <div class="header">
        <div class="logo">Tasky<span>.fr</span></div>
      </div>
      <!-- Bande couleur variant -->
      <div class="header-band"></div>

      <!-- Corps -->
      <div class="body">
        ${content}

        ${ctaText && ctaUrl ? `
        <div class="cta-wrapper">
          <a href="${ctaUrl}" class="cta">${ctaText}</a>
        </div>
        ` : ""}
      </div>

      <hr class="divider" />

      <!-- Footer -->
      <div class="footer">
        <p class="footer-text">
          ${footerText || "Vous recevez cet email car vous êtes inscrit sur Tasky.fr"}<br/>
          <a href="${process.env.FRONTEND_URL}/legal/privacy" class="footer-link">Politique de confidentialité</a>
          &nbsp;·&nbsp;
          <a href="${process.env.FRONTEND_URL}/legal/cgu" class="footer-link">CGU</a>
        </p>
        <p class="footer-text" style="margin-top: 8px;">
          © ${new Date().getFullYear()} Tasky.fr — Tous droits réservés
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
};
