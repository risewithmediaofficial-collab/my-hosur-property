/**
 * generateHtmlEmail
 * Generates a beautiful, professional HTML email for MyHosurProperty.
 * Compatible with all major email clients (table-based layout).
 */
const generateHtmlEmail = ({ name, title, message, buttonText, buttonUrl, type = "general" }) => {
  const brandName = "MyHosurProperty";
  const siteUrl = process.env.CLIENT_URL || "http://localhost:5173";

  // Theme colours
  const colors = {
    bg: "#F0F4F8",
    card: "#FFFFFF",
    header: "#0F1E35",
    headerAccent: "#1A3356",
    accent: "#2563EB",
    accentLight: "#EFF6FF",
    text: "#1E293B",
    textMuted: "#64748B",
    border: "#E2E8F0",
    success: "#059669",
    warning: "#D97706",
  };

  // Icon map per email type
  const iconMap = {
    welcome:  "🏡",
    login:    "🔐",
    alert:    "⚠️",
    general:  "📬",
  };
  const icon = iconMap[type] || iconMap.general;

  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title || brandName}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${colors.bg};font-family:'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${colors.bg};padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${colors.card};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- ── HEADER ── -->
          <tr>
            <td style="background:linear-gradient(135deg,${colors.header} 0%,${colors.headerAccent} 100%);padding:36px 40px;text-align:center;">
              <div style="font-size:13px;font-weight:700;letter-spacing:3px;color:rgba(255,255,255,0.5);text-transform:uppercase;margin-bottom:8px;">Your Trusted Property Partner</div>
              <div style="font-size:28px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;">${brandName}</div>
              <div style="margin-top:16px;display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:999px;padding:6px 18px;">
                <span style="font-size:22px;">${icon}</span>
              </div>
            </td>
          </tr>

          <!-- ── HERO IMAGE ── -->
          <tr>
            <td style="padding:0;">
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&h=200&q=80"
                alt="Hosur Properties"
                width="600"
                style="display:block;width:100%;height:200px;object-fit:cover;"
              />
            </td>
          </tr>

          <!-- ── BODY ── -->
          <tr>
            <td style="padding:40px 40px 32px;">

              <!-- Greeting -->
              <h2 style="margin:0 0 4px;font-size:22px;font-weight:700;color:${colors.text};">
                Hello, ${name || "Valued Member"} 👋
              </h2>
              <div style="width:40px;height:3px;background:${colors.accent};border-radius:2px;margin:12px 0 20px;"></div>

              <!-- Title badge -->
              <div style="display:inline-block;background:${colors.accentLight};border:1px solid #BFDBFE;border-radius:8px;padding:8px 16px;margin-bottom:20px;">
                <span style="font-size:15px;font-weight:700;color:${colors.accent};">${title || ""}</span>
              </div>

              <!-- Message body -->
              <div style="font-size:15px;line-height:1.75;color:${colors.textMuted};">
                ${message.replace(/\n/g, "<br/>")}
              </div>

              ${buttonText && buttonUrl ? `
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr>
                  <td align="center">
                    <a href="${buttonUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,${colors.accent} 0%,#1D4ED8 100%);color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;box-shadow:0 4px 14px rgba(37,99,235,0.35);">
                      ${buttonText} →
                    </a>
                  </td>
                </tr>
              </table>
              ` : ""}

              <!-- Divider -->
              <div style="border-top:1px solid ${colors.border};margin:32px 0;"></div>

              <!-- Trust badges -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" width="33%" style="padding:0 8px;text-align:center;">
                    <div style="font-size:20px;margin-bottom:4px;">🏠</div>
                    <div style="font-size:11px;font-weight:700;color:${colors.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Verified Listings</div>
                  </td>
                  <td align="center" width="33%" style="padding:0 8px;text-align:center;">
                    <div style="font-size:20px;margin-bottom:4px;">🔒</div>
                    <div style="font-size:11px;font-weight:700;color:${colors.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Secure Platform</div>
                  </td>
                  <td align="center" width="33%" style="padding:0 8px;text-align:center;">
                    <div style="font-size:20px;margin-bottom:4px;">⭐</div>
                    <div style="font-size:11px;font-weight:700;color:${colors.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Trusted by Thousands</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background:#F8FAFC;border-top:1px solid ${colors.border};padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:${colors.textMuted};">
                © ${year} ${brandName}. All rights reserved.
              </p>
              <p style="margin:0 0 8px;font-size:12px;color:#94A3B8;">
                Hosur, Tamil Nadu, India
              </p>
              <p style="margin:0;font-size:12px;color:#94A3B8;">
                <a href="${siteUrl}" style="color:${colors.accent};text-decoration:none;">Visit Website</a>
                &nbsp;•&nbsp;
                <a href="${siteUrl}/unsubscribe" style="color:#94A3B8;text-decoration:none;">Unsubscribe</a>
                &nbsp;•&nbsp;
                <a href="${siteUrl}/privacy" style="color:#94A3B8;text-decoration:none;">Privacy Policy</a>
              </p>
            </td>
          </tr>

        </table>

        <!-- Anti-spam notice -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;margin-top:16px;">
          <tr>
            <td align="center" style="padding:0 20px;">
              <p style="font-size:11px;color:#94A3B8;margin:0;line-height:1.6;">
                You're receiving this email because you registered on ${brandName}.<br/>
                If you have concerns, please contact <a href="mailto:${process.env.SMTP_USER || 'support@myhosurproperty.com'}" style="color:${colors.accent};text-decoration:none;">${process.env.SMTP_USER || 'support@myhosurproperty.com'}</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
};

module.exports = generateHtmlEmail;
