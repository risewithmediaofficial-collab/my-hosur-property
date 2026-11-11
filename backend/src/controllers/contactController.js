const { body } = require("express-validator");
const sendEmail = require("../utils/sendEmail");
const { baseEmailLayout } = require("../utils/emailTemplates");
const { createSalesDaddyLead, extractPhoneDigits } = require("../services/salesDaddyService");

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const contactValidators = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Name is required"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("phone")
    .trim()
    .custom((value) => {
      const digits = extractPhoneDigits(value);
      if (digits.length < 7 || digits.length > 15) {
        throw new Error("Please enter a valid phone number");
      }
      return true;
    }),
  body("message")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Message must be under 2000 characters"),
];

const submitContactForm = async (req, res) => {
  const { name, email, phone, message = "" } = req.body;

  try {
    const crmResult = await createSalesDaddyLead({
      name,
      email,
      phone,
      message,
      sourcePage: "/contact",
    });

    console.log(
      `[contact] Lead synced to Sales Daddy | leadId=${crmResult.leadId || "n/a"} | duplicate=${Boolean(crmResult.duplicate)}`
    );

    res.status(201).json({
      ok: true,
      success: true,
      leadId: crmResult.leadId || crmResult.lead?.id || null,
      duplicate: Boolean(crmResult.duplicate),
      message: "Thank you! We'll connect with you shortly.",
    });

    const supportRecipient = process.env.SUPPORT_EMAIL || "myhosurproperty.mhp@gmail.com";
    setImmediate(async () => {
      try {
        const html = baseEmailLayout(
          `
          <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1E293B;">
            New Contact Page Enquiry
          </h2>
          <p style="margin:0 0 16px;color:#64748B;font-size:13px;">
            Synced with Sales Daddy CRM (Lead ID: ${escapeHtml(crmResult.leadId || "N/A")})
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;">
            <tr style="background:#F8FAFC;">
              <td style="padding:10px 14px;font-weight:600;color:#64748B;width:32%;">Name</td>
              <td style="padding:10px 14px;color:#1E293B;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-weight:600;color:#64748B;">Email</td>
              <td style="padding:10px 14px;color:#1E293B;">${escapeHtml(email)}</td>
            </tr>
            <tr style="background:#F8FAFC;">
              <td style="padding:10px 14px;font-weight:600;color:#64748B;">Phone</td>
              <td style="padding:10px 14px;color:#1E293B;">${escapeHtml(phone)}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-weight:600;color:#64748B;vertical-align:top;">Message</td>
              <td style="padding:10px 14px;color:#1E293B;white-space:pre-wrap;">${escapeHtml(message || "—")}</td>
            </tr>
          </table>
          `,
          "Contact Page Enquiry"
        );

        await sendEmail({
          to: supportRecipient,
          replyTo: email,
          subject: `New Contact Enquiry from ${name}`,
          html,
        });
      } catch (mailErr) {
        console.error("[contact] Support notification email failed:", mailErr.message);
      }
    });
  } catch (err) {
    console.error(`[contact] Sales Daddy sync failed (${err.code || err.statusCode || 500}):`, err.details || err.message);
    return res.status(err.statusCode || 502).json({
      ok: false,
      success: false,
      message: err.message || "Unable to send your message right now. Please try again shortly.",
    });
  }
};

module.exports = {
  contactValidators,
  submitContactForm,
};

