const axios = require("axios");

/**
 * MSG91 WhatsApp OTP Sender
 * Sends OTP via MSG91 WhatsApp Outbound Message API using a template.
 * Docs: https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/
 */

// NOTE: .env must define MSG91_WHATSAPP_AUTH_KEY (or MSG91_AUTH_KEY as fallback)
const MSG91_WHATSAPP_AUTH_KEY =
  process.env.MSG91_WHATSAPP_AUTH_KEY ||
  process.env.MSG91_AUTH_KEY ||
  "";

const MSG91_WHATSAPP_INTEGRATED_NUMBER =
  process.env.MSG91_WHATSAPP_INTEGRATED_NUMBER || "918110952245";
const MSG91_WHATSAPP_TEMPLATE_NAME =
  process.env.MSG91_WHATSAPP_TEMPLATE_NAME || "myhosur_property_account_otp_verification";
const MSG91_WHATSAPP_FORGOT_PASSWORD_TEMPLATE_NAME =
  process.env.MSG91_WHATSAPP_FORGOT_PASSWORD_TEMPLATE_NAME || "myhosur_property_forgot_password_otp";
const MSG91_WHATSAPP_LANG =
  process.env.MSG91_WHATSAPP_LANG || "en";
const MSG91_WHATSAPP_NAMESPACE =
  process.env.MSG91_WHATSAPP_NAMESPACE || "9dc986a5_2fc7_4562_8b79_9e65eb5da797";
const MSG91_WHATSAPP_ENDPOINT =
  "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/";

const hasMsg91WhatsAppConfig = Boolean(
  MSG91_WHATSAPP_AUTH_KEY &&
  MSG91_WHATSAPP_INTEGRATED_NUMBER &&
  MSG91_WHATSAPP_TEMPLATE_NAME
);

console.log("[whatsapp-otp] Config check:", {
  hasAuth: Boolean(MSG91_WHATSAPP_AUTH_KEY),
  integratedNumber: MSG91_WHATSAPP_INTEGRATED_NUMBER,
  templateName: MSG91_WHATSAPP_TEMPLATE_NAME,
  forgotPasswordTemplateName: MSG91_WHATSAPP_FORGOT_PASSWORD_TEMPLATE_NAME,
  hasMsg91WhatsAppConfig,
});

/**
 * Normalizes phone numbers for MSG91 (e.g. prepends 91 if 10 digits, removes non-digits).
 */
const normalizePhone = (phone) => {
  if (!phone) return "";
  const cleaned = String(phone).trim().replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
};

/**
 * Sends OTP via MSG91 WhatsApp API.
 * @param {Object} opts
 * @param {string} opts.phone      - Recipient phone number (e.g., +919999999999 or 9999999999)
 * @param {string} opts.otp        - The OTP code to send
 * @returns {{ provider: string, delivered: boolean, response: any }}
 */
const sendWhatsAppOtpViaMsg91 = async ({ phone, otp }) => {
  const formattedPhone = normalizePhone(phone);

  // Always use the main template name
  const templateName = MSG91_WHATSAPP_TEMPLATE_NAME;

  // ── Payload exactly matching MSG91 API docs ─────────────────────────────────
  const payload = {
    integrated_number: MSG91_WHATSAPP_INTEGRATED_NUMBER,
    content_type: "template",
    payload: {
      messaging_product: "whatsapp",
      type: "template",
      template: {
        name: templateName,
        language: {
          code: MSG91_WHATSAPP_LANG,
          policy: "deterministic",
        },
        namespace: MSG91_WHATSAPP_NAMESPACE,
        to_and_components: [
          {
            to: [formattedPhone],
            components: {
              body_1: {
                type: "text",
                value: String(otp),          // OTP displayed in the message body
              },
              button_1: {
                subtype: "url",
                type: "text",
                value: String(otp),          // OTP appended to the button URL variable
              },
            },
          },
        ],
      },
    },
  };

  console.log("[whatsapp-otp] ──── Sending to MSG91 WhatsApp API ────");
  console.log("[whatsapp-otp] Endpoint    :", MSG91_WHATSAPP_ENDPOINT);
  console.log("[whatsapp-otp] Auth key    :", MSG91_WHATSAPP_AUTH_KEY ? MSG91_WHATSAPP_AUTH_KEY.slice(0, 8) + "****" : "MISSING");
  console.log("[whatsapp-otp] To          :", formattedPhone);
  console.log("[whatsapp-otp] Template    :", templateName);
  console.log("[whatsapp-otp] Namespace   :", MSG91_WHATSAPP_NAMESPACE);
  console.log("[whatsapp-otp] OTP         :", otp);
  console.log("[whatsapp-otp] Full payload:", JSON.stringify(payload, null, 2));

  let response;
  try {
    response = await axios.post(MSG91_WHATSAPP_ENDPOINT, payload, {
      headers: {
        authkey: MSG91_WHATSAPP_AUTH_KEY,        // MSG91 expects lowercase 'authkey'
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });
  } catch (axiosErr) {
    const httpStatus = axiosErr?.response?.status;
    const errBody = axiosErr?.response?.data;
    console.error("[whatsapp-otp] ❌ MSG91 HTTP error status :", httpStatus);
    console.error("[whatsapp-otp] ❌ MSG91 HTTP error body   :", JSON.stringify(errBody, null, 2));

    const userMsg =
      errBody?.message ||
      errBody?.error ||
      errBody?.description ||
      (typeof errBody === "string" ? errBody : null) ||
      axiosErr.message ||
      "MSG91 WhatsApp API request failed";

    const err = new Error(`MSG91 WhatsApp API error (HTTP ${httpStatus || "?"}): ${userMsg}`);
    err.statusCode = 502;
    err.msg91Response = errBody;
    throw err;
  }

  console.log("[whatsapp-otp] ✅ MSG91 HTTP status       :", response.status);
  console.log("[whatsapp-otp] ✅ MSG91 response body     :", JSON.stringify(response.data, null, 2));

  const resData = response.data;

  const isApiError =
    resData?.type === "error" ||
    resData?.status === "error" ||
    resData?.code === "error" ||
    (typeof resData === "string" && resData.toLowerCase().startsWith("error"));

  if (isApiError) {
    const apiErrMsg =
      resData?.message ||
      resData?.error ||
      resData?.description ||
      (typeof resData === "string" ? resData : "MSG91 returned an error response");
    console.error("[whatsapp-otp] ❌ MSG91 API-level error:", apiErrMsg);
    const err = new Error(`MSG91 WhatsApp API error: ${apiErrMsg}`);
    err.statusCode = 502;
    err.msg91Response = resData;
    throw err;
  }

  return {
    provider: "msg91_whatsapp",
    delivered: true,
    response: resData,
  };
};


/**
 * Main entry point.
 * Falls back to development/console mode when MSG91 WhatsApp config is absent.
 */
const sendWhatsAppOtp = async ({ phone, otp, purpose }) => {
  console.log(`[whatsapp-otp] sendWhatsAppOtp called — phone: ${phone}, purpose: ${purpose || "otp"}`);
  console.log(`[whatsapp-otp] hasMsg91WhatsAppConfig: ${hasMsg91WhatsAppConfig}`);

  if (!hasMsg91WhatsAppConfig) {
    // Development fallback — log to console
    console.log(
      `[whatsapp-otp] Development OTP for ${phone} (${purpose || "otp"}): ${otp}`
    );
    return {
      provider: "development",
      delivered: true,
      response: { message: "WhatsApp OTP generated in development fallback mode." },
    };
  }

  try {
    const result = await sendWhatsAppOtpViaMsg91({ phone, otp, purpose });
    console.log("[whatsapp-otp] OTP sent successfully:", JSON.stringify(result.response, null, 2));
    return result;
  } catch (error) {
    const status = error?.response?.status || error?.statusCode;
    const msg =
      error?.msg91Response?.message ||
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message;

    console.error(
      `[whatsapp-otp] MSG91 WhatsApp send failed (HTTP ${status || "?"}) — ${msg}`
    );

    // Re-attach the MSG91 response body for upstream inspection
    const err = new Error(`Failed to send OTP via WhatsApp: ${msg}`);
    err.statusCode = 502;
    err.msg91Response = error?.msg91Response || error?.response?.data;
    throw err;
  }
};

module.exports = {
  sendWhatsAppOtp,
  hasMsg91WhatsAppConfig,
};
