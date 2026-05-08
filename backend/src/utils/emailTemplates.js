/**
 * Email Templates for MyHosurProperty
 * Centralized email template generation with consistent branding
 */

const baseColors = {
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
  lightGray: "#F8FAFC",
};

const brandName = "MyHosurProperty";
const siteUrl = process.env.CLIENT_URL || "http://localhost:5173";
const extractEmailAddress = (value = "") => {
  const match = String(value).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : "";
};

const supportEmail =
  extractEmailAddress(process.env.SUPPORT_EMAIL) ||
  extractEmailAddress(process.env.EMAIL_FROM) ||
  extractEmailAddress(process.env.SMTP_REPLY_TO) ||
  "support@myhosurproperty.com";

/**
 * Base email layout wrapper
 */
const baseEmailLayout = (content, headerTitle = "Welcome") => {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${brandName}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    @media (max-width: 600px) {
      .mobile-center { text-align: center !important; }
      .mobile-full { width: 100% !important; }
      .mobile-padding { padding: 16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${baseColors.bg};font-family:'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${baseColors.bg};padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${baseColors.card};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,${baseColors.header} 0%,${baseColors.headerAccent} 100%);padding:32px 20px;text-align:center;">
              <div style="font-size:12px;font-weight:700;letter-spacing:2px;color:rgba(255,255,255,0.6);text-transform:uppercase;margin-bottom:8px;">Real Estate Platform</div>
              <div style="font-size:28px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;margin-bottom:12px;">${brandName}</div>
              <div style="font-size:14px;color:rgba(255,255,255,0.8);font-weight:500;">${headerTitle}</div>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding:40px 20px 32px;font-size:15px;line-height:1.6;color:${baseColors.text};">
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:${baseColors.lightGray};border-top:1px solid ${baseColors.border};padding:24px 20px;text-align:center;">
              <p style="margin:0 0 12px;font-size:12px;color:${baseColors.textMuted};">
                © ${year} ${brandName}. All rights reserved.
              </p>
              <p style="margin:0 0 12px;font-size:11px;color:#94A3B8;">
                Hosur, Tamil Nadu, India
              </p>
              <p style="margin:0;font-size:11px;">
                <a href="${siteUrl}" style="color:${baseColors.accent};text-decoration:none;margin:0 8px;">Visit Website</a>
                •
                <a href="${siteUrl}/privacy" style="color:${baseColors.accent};text-decoration:none;margin:0 8px;">Privacy</a>
                •
                <a href="mailto:${supportEmail}" style="color:${baseColors.accent};text-decoration:none;margin:0 8px;">Contact</a>
              </p>
            </td>
          </tr>

        </table>

        <!-- Anti-spam notice -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;margin-top:16px;">
          <tr>
            <td align="center" style="padding:0 20px;">
              <p style="font-size:10px;color:#94A3B8;margin:0;line-height:1.5;">
                You received this email because you're registered with ${brandName}.<br/>
                Questions? Contact <a href="mailto:${supportEmail}" style="color:${baseColors.accent};text-decoration:none;">${supportEmail}</a>
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

/**
 * Welcome Email for New Users
 */
const welcomeEmail = (user) => {
  const content = `
    <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;color:${baseColors.text};">
      Welcome, ${user.name}! 👋
    </h2>
    <div style="width:40px;height:3px;background:${baseColors.accent};border-radius:2px;margin:12px 0 20px;"></div>

    <p style="margin:0 0 16px;color:${baseColors.textMuted};line-height:1.7;">
      We're thrilled to have you join the <strong>${brandName}</strong> family! Whether you're looking to buy, rent, or sell property in Hosur, you're in the right place.
    </p>

    <div style="background:${baseColors.accentLight};border-left:4px solid ${baseColors.accent};padding:16px;margin:24px 0;border-radius:4px;">
      <p style="margin:0;color:${baseColors.accent};font-weight:600;font-size:14px;">🎁 Your Welcome Gift</p>
      <p style="margin:8px 0 0;color:${baseColors.text};font-size:14px;">
        As a welcome bonus, you get <strong>1 FREE property listing</strong> valid for 30 days. Start posting your property today!
      </p>
    </div>

    <p style="margin:20px 0 16px;color:${baseColors.textMuted};">Here's what you can do now:</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid ${baseColors.border};">
          <span style="display:inline-block;background:${baseColors.accent};color:white;width:28px;height:28px;border-radius:50%;text-align:center;line-height:28px;font-weight:700;margin-right:12px;">1</span>
          <span style="color:${baseColors.text};font-weight:600;">Browse Verified Listings</span>
          <p style="margin:4px 0 0 40px;color:${baseColors.textMuted};font-size:13px;">Explore thousands of verified properties across Hosur</p>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid ${baseColors.border};">
          <span style="display:inline-block;background:${baseColors.accent};color:white;width:28px;height:28px;border-radius:50%;text-align:center;line-height:28px;font-weight:700;margin-right:12px;">2</span>
          <span style="color:${baseColors.text};font-weight:600;">Post Your First Property</span>
          <p style="margin:4px 0 0 40px;color:${baseColors.textMuted};font-size:13px;">Use your free listing to showcase your property</p>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;">
          <span style="display:inline-block;background:${baseColors.accent};color:white;width:28px;height:28px;border-radius:50%;text-align:center;line-height:28px;font-weight:700;margin-right:12px;">3</span>
          <span style="color:${baseColors.text};font-weight:600;">Connect & Negotiate</span>
          <p style="margin:4px 0 0 40px;color:${baseColors.textMuted};font-size:13px;">Get in touch directly with buyers, sellers, or agents</p>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
      <tr>
        <td align="center">
          <a href="${siteUrl}/dashboard"
             style="display:inline-block;background:linear-gradient(135deg,${baseColors.accent} 0%,#1D4ED8 100%);color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:8px;box-shadow:0 4px 14px rgba(37,99,235,0.35);">
            Get Started Now →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:20px 0 16px;color:${baseColors.textMuted};font-size:13px;">
      <strong>Account Details:</strong><br/>
      Email: ${user.email}<br/>
      Role: ${(user.role || "buyer").charAt(0).toUpperCase() + (user.role || "buyer").slice(1)}
    </p>

    <p style="margin:16px 0 0;color:${baseColors.textMuted};font-size:13px;">
      Have questions? Our support team is ready to help! Reply to this email or visit our <a href="${siteUrl}/support" style="color:${baseColors.accent};text-decoration:none;">Help Center</a>.
    </p>
  `;

  return baseEmailLayout(content, "🏡 Welcome Aboard!");
};

/**
 * New Property Notification Email
 */
const newPropertyEmail = (buyer, property, similarCount = 0) => {
  const propertyUrl = `${siteUrl}/property/${property._id}/${encodeURIComponent(property.title.replace(/\s+/g, "-").toLowerCase())}`;
  const priceDisplay = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(property.price);

  const content = `
    <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;color:${baseColors.text};">
      New Property Alert! 🏠
    </h2>
    <div style="width:40px;height:3px;background:${baseColors.accent};border-radius:2px;margin:12px 0 20px;"></div>

    <p style="margin:0 0 16px;color:${baseColors.textMuted};">
      Hi ${buyer.name}, we found a property that matches your interests in ${property.location?.city}!
    </p>

    <!-- Property Card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border:1px solid ${baseColors.border};border-radius:12px;overflow:hidden;">
      <tr>
        <td style="background:linear-gradient(135deg,${baseColors.accent} 0%,#1D4ED8 100%);padding:16px;color:white;">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;opacity:0.9;">
            ${property.propertyType} • ${(property.listingType || "sale").toUpperCase()}
          </div>
          <div style="font-size:18px;font-weight:700;margin:8px 0 4px;">
            ${property.title}
          </div>
          <div style="font-size:13px;opacity:0.95;">
            📍 ${property.location?.area}, ${property.location?.city}
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:16px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid ${baseColors.border};">
                <span style="color:${baseColors.accent};font-weight:700;font-size:20px;">${priceDisplay}</span>
                <p style="margin:4px 0 0;color:${baseColors.textMuted};font-size:12px;">Price</p>
              </td>
              <td style="padding:8px 0 8px 16px;border-bottom:1px solid ${baseColors.border};">
                <span style="color:${baseColors.text};font-weight:700;font-size:20px;">${property.bhk || "Studio"}</span>
                <p style="margin:4px 0 0;color:${baseColors.textMuted};font-size:12px;">BHK</p>
              </td>
              <td style="padding:8px 0 8px 16px;border-bottom:1px solid ${baseColors.border};">
                <span style="color:${baseColors.text};font-weight:700;font-size:20px;">${property.carpetArea || "N/A"}</span>
                <p style="margin:4px 0 0;color:${baseColors.textMuted};font-size:12px;">Area</p>
              </td>
            </tr>
            <tr>
              <td colspan="3" style="padding:12px 0;font-size:13px;color:${baseColors.textMuted};">
                ${property.description?.substring(0, 100) || "A great property opportunity"}...
              </td>
            </tr>
            ${
              property.verification?.isVerified
                ? `
                <tr>
                  <td colspan="3" style="padding:8px 0;">
                    <span style="display:inline-block;background:#DBEAFE;color:#0C4A6E;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">
                      ✓ Verified Listing
                    </span>
                  </td>
                </tr>
              `
                : ""
            }
          </table>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center">
          <a href="${propertyUrl}"
             style="display:inline-block;background:linear-gradient(135deg,${baseColors.accent} 0%,#1D4ED8 100%);color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;padding:12px 36px;border-radius:8px;box-shadow:0 4px 14px rgba(37,99,235,0.35);">
            View Full Details
          </a>
        </td>
      </tr>
    </table>

    ${
      similarCount > 0
        ? `
        <div style="background:${baseColors.accentLight};padding:16px;margin:20px 0;border-radius:8px;border-left:4px solid ${baseColors.accent};">
          <p style="margin:0;color:${baseColors.accent};font-weight:600;font-size:14px;">
            📌 More Like This
          </p>
          <p style="margin:8px 0 0;color:${baseColors.text};font-size:13px;">
            We found <strong>${similarCount} more properties</strong> matching your search criteria. <a href="${siteUrl}/listings" style="color:${baseColors.accent};text-decoration:none;font-weight:600;">Browse all →</a>
          </p>
        </div>
      `
        : ""
    }

    <p style="margin:20px 0 0;color:${baseColors.textMuted};font-size:12px;">
      Want to see less of these alerts? Manage your preferences <a href="${siteUrl}/settings/notifications" style="color:${baseColors.accent};text-decoration:none;">here</a>.
    </p>
  `;

  return baseEmailLayout(content, "🎯 Property Match Found");
};

/**
 * Property Inquiry Confirmation Email
 */
const inquiryConfirmationEmail = (buyer, property, inquiryId) => {
  const content = `
    <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;color:${baseColors.text};">
      Inquiry Sent Successfully ✓
    </h2>
    <div style="width:40px;height:3px;background:${baseColors.success};border-radius:2px;margin:12px 0 20px;"></div>

    <p style="margin:0 0 16px;color:${baseColors.textMuted};">
      Your inquiry for the following property has been sent to the seller/agent:
    </p>

    <div style="background:${baseColors.lightGray};padding:16px;border-radius:8px;margin:20px 0;">
      <p style="margin:0 0 8px;color:${baseColors.text};font-weight:600;font-size:15px;">
        ${property.title}
      </p>
      <p style="margin:0;color:${baseColors.textMuted};font-size:13px;">
        📍 ${property.location?.area}, ${property.location?.city}
      </p>
    </div>

    <div style="background:${baseColors.accentLight};padding:16px;margin:20px 0;border-radius:8px;border-left:4px solid ${baseColors.accent};">
      <p style="margin:0;color:${baseColors.text};font-weight:600;font-size:14px;">
        📝 Inquiry Reference: ${inquiryId}
      </p>
      <p style="margin:8px 0 0;color:${baseColors.textMuted};font-size:13px;">
        Keep this reference handy for follow-ups. The owner will respond within 24 hours.
      </p>
    </div>

    <p style="margin:20px 0;color:${baseColors.textMuted};">
      <strong>What happens next:</strong><br/>
      1. The seller/agent will review your inquiry<br/>
      2. They'll respond to your contact information<br/>
      3. You can view all responses in your dashboard
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center">
          <a href="${siteUrl}/dashboard/inquiries"
             style="display:inline-block;background:linear-gradient(135deg,${baseColors.accent} 0%,#1D4ED8 100%);color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;padding:12px 36px;border-radius:8px;box-shadow:0 4px 14px rgba(37,99,235,0.35);">
            View My Inquiries
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:16px 0 0;color:${baseColors.textMuted};font-size:12px;">
      Need help? Contact our support team at <a href="mailto:${supportEmail}" style="color:${baseColors.accent};text-decoration:none;">${supportEmail}</a>
    </p>
  `;

  return baseEmailLayout(content, "✓ Inquiry Confirmed");
};

/**
 * Admin Notification - New Property Posted
 */
const adminPropertyNotificationEmail = (property, seller) => {
  const content = `
    <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;color:${baseColors.text};">
      New Property Submission 📨
    </h2>
    <div style="width:40px;height:3px;background:${baseColors.warning};border-radius:2px;margin:12px 0 20px;"></div>

    <p style="margin:0 0 16px;color:${baseColors.textMuted};">
      A new property listing has been submitted and requires review.
    </p>

    <div style="background:${baseColors.lightGray};padding:16px;border-radius:8px;margin:20px 0;">
      <p style="margin:0 0 8px;color:${baseColors.text};font-weight:600;">
        <strong>Property:</strong> ${property.title}
      </p>
      <p style="margin:0 0 8px;color:${baseColors.textMuted};">
        <strong>Seller:</strong> ${seller.name} (${seller.email})
      </p>
      <p style="margin:0 0 8px;color:${baseColors.textMuted};">
        <strong>Type:</strong> ${property.propertyType} • ${property.listingType}
      </p>
      <p style="margin:0;color:${baseColors.textMuted};">
        <strong>Status:</strong> <span style="color:${baseColors.warning};font-weight:600;">Pending Review</span>
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center">
          <a href="${siteUrl}/admin/properties"
             style="display:inline-block;background:linear-gradient(135deg,${baseColors.accent} 0%,#1D4ED8 100%);color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;padding:12px 36px;border-radius:8px;">
            Review in Admin Panel
          </a>
        </td>
      </tr>
    </table>
  `;

  return baseEmailLayout(content, "📋 Admin Review Needed");
};

module.exports = {
  welcomeEmail,
  newPropertyEmail,
  inquiryConfirmationEmail,
  adminPropertyNotificationEmail,
  baseEmailLayout,
  baseColors,
  siteUrl,
  supportEmail,
};
