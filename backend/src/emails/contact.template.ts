interface ContactTemplateProps {
  firstName: string;
  email: string;
  role: string;
  sujet: string;
  reference: string;
  message: string;
}

export const contactTemplate = ({
  firstName,
  email,
  role,
  sujet,
  reference,
  message,
}: ContactTemplateProps): string => `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Nouveau message de contact — Tasky</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#6366f1,#7c3aed);padding:32px 40px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:800;">📬 Nouveau message de contact</h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Tasky — Support</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:32px 40px;">

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:20px 24px;">
                      <tr><td style="padding-bottom:10px;">
                        <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Expéditeur</span><br/>
                        <span style="font-size:15px;font-weight:700;color:#111827;">${firstName}</span>
                        <span style="font-size:13px;color:#6b7280;margin-left:8px;">${email}</span>
                      </td></tr>
                      <tr><td style="padding-bottom:10px;border-top:1px solid #f3f4f6;padding-top:10px;">
                        <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Rôle</span><br/>
                        <span style="font-size:14px;color:#374151;">${role}</span>
                      </td></tr>
                      <tr><td style="padding-bottom:10px;border-top:1px solid #f3f4f6;padding-top:10px;">
                        <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Sujet</span><br/>
                        <span style="font-size:14px;font-weight:600;color:#374151;">${sujet}</span>
                      </td></tr>
                      ${reference ? `<tr><td style="border-top:1px solid #f3f4f6;padding-top:10px;">
                        <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Référence</span><br/>
                        <span style="font-family:monospace;font-size:15px;font-weight:800;color:#6366f1;">${reference}</span>
                      </td></tr>` : ""}
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#f0f9ff;border:1px solid #bae6fd;border-left:4px solid #6366f1;border-radius:12px;padding:18px 22px;">
                          <p style="margin:0 0 6px;color:#1e3a5f;font-size:13px;font-weight:700;">Message</p>
                          <p style="margin:0;color:#1e40af;font-size:14px;line-height:1.7;white-space:pre-wrap;">${message}</p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:20px 40px;text-align:center;">
                    <p style="margin:0;color:#d1d5db;font-size:11px;">© 2026 Tasky.fr — Message de contact interne</p>
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
