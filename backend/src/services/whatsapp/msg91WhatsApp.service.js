/**
 * MSG91 WhatsApp Notification Service
 *
 * Sends approved WhatsApp templates via MSG91 outbound API.
 * Reuses the same endpoint and credentials as sendWhatsAppOtp.js
 * but is a SEPARATE module for non-OTP notification templates.
 *
 * DO NOT import or modify sendWhatsAppOtp.js — this file is independent.
 */

const axios = require("axios");

// ─── Configuration ───────────────────────────────────────────────────────────
// Reuses existing env vars already set for WhatsApp OTP — no new auth key needed.
const MSG91_AUTH_KEY =
  process.env.MSG91_WHATSAPP_AUTH_KEY ||
  process.env.MSG91_AUTH_KEY ||
  "";

const MSG91_INTEGRATED_NUMBER =
  process.env.MSG91_WHATSAPP_INTEGRATED_NUMBER || "";

const MSG91_NAMESPACE =
  process.env.MSG91_WHATSAPP_NAMESPACE || "";

const MSG91_LANG =
  process.env.MSG91_WHATSAPP_LANG || "en";

const MSG91_ENDPOINT =
  "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/";

/**
 * Whether full WhatsApp notification config is available.
 * If false, all notification sends are silently skipped (dev-safe).
 */
const hasWhatsAppNotificationConfig = Boolean(
  MSG91_AUTH_KEY &&
  MSG91_INTEGRATED_NUMBER
);

// ─── Phone Normalizer ─────────────────────────────────────────────────────────
/**
 * Normalize phone number to 12-digit international format (91XXXXXXXXXX).
 * Handles: +919876543210, 919876543210, 9876543210
 */
const normalizePhoneForWA = (phone) => {
  if (!phone) return "";
  const cleaned = String(phone).trim().replace(/\D/g, "");
  if (cleaned.length === 10) return `91${cleaned}`;
  return cleaned;
};

// ─── Core Sender ─────────────────────────────────────────────────────────────
/**
 * Send a WhatsApp template message via MSG91.
 *
 * @param {string} phone           - Recipient phone (any Indian format)
 * @param {string} templateName    - MSG91 approved template name
 * @param {Object} components      - Template variable map e.g. { body_1: { type:'text', value:'...' } }
 * @returns {Promise<{ delivered: boolean, provider: string, response: any }>}
 */
const sendWhatsAppTemplate = async (phone, templateName, components = {}) => {
  const formattedPhone = normalizePhoneForWA(phone);

  if (!formattedPhone) {
    throw new Error("WhatsApp notification: phone number is missing or invalid");
  }

  if (!templateName) {
    throw new Error("WhatsApp notification: templateName is required");
  }

  if (!hasWhatsAppNotificationConfig) {
    console.log(
      `[wa-notify] ⚠ Config missing — skipping template "${templateName}" to ${formattedPhone.slice(0, 6)}****`
    );
    return { delivered: false, provider: "skipped", response: null };
  }

  const payload = {
    integrated_number: MSG91_INTEGRATED_NUMBER,
    content_type: "template",
    payload: {
      messaging_product: "whatsapp",
      type: "template",
      template: {
        name: templateName,
        language: {
          code: MSG91_LANG,
          policy: "deterministic",
        },
        namespace: MSG91_NAMESPACE,
        to_and_components: [
          {
            to: [formattedPhone],
            components,
          },
        ],
      },
    },
  };

  console.log(
    `[wa-notify] Sending template "${templateName}" to ${formattedPhone.slice(0, 6)}****`
  );

  let response;
  try {
    response = await axios.post(MSG91_ENDPOINT, payload, {
      headers: {
        authkey: MSG91_AUTH_KEY,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });
  } catch (axiosErr) {
    const httpStatus = axiosErr?.response?.status;
    const errBody = axiosErr?.response?.data;
    const userMsg =
      errBody?.message ||
      errBody?.error ||
      errBody?.description ||
      (typeof errBody === "string" ? errBody : null) ||
      axiosErr.message ||
      "MSG91 WhatsApp API request failed";

    console.error(
      `[wa-notify] ❌ HTTP ${httpStatus || "?"} — ${userMsg}`
    );

    const err = new Error(
      `MSG91 WhatsApp notify API error (HTTP ${httpStatus || "?"}): ${userMsg}`
    );
    err.statusCode = 502;
    err.msg91Response = errBody;
    throw err;
  }

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

    console.error(`[wa-notify] ❌ API-level error: ${apiErrMsg}`);
    const err = new Error(`MSG91 WhatsApp notify API error: ${apiErrMsg}`);
    err.statusCode = 502;
    err.msg91Response = resData;
    throw err;
  }

  console.log(
    `[wa-notify] ✅ Template "${templateName}" delivered to ${formattedPhone.slice(0, 6)}****`
  );

  return {
    delivered: true,
    provider: "msg91_whatsapp",
    response: resData,
  };
};

module.exports = {
  sendWhatsAppTemplate,
  normalizePhoneForWA,
  normalizePhone: normalizePhoneForWA,
  hasWhatsAppNotificationConfig,
};
