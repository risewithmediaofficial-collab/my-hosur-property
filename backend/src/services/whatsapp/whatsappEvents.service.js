/**
 * WhatsApp Events Service
 *
 * High-level event functions called after successful business operations.
 * Each function:
 *   1. Validates recipient phone.
 *   2. Checks that the template is configured (skips silently if not).
 *   3. Checks idempotency (skips if same event was sent recently).
 *   4. Calls MSG91 service.
 *   5. Logs result to WhatsAppMessageLog.
 *   6. NEVER throws — original business operation always succeeds.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IMPORTANT: Every exported function must be called inside try/catch in the
 * consuming controller so that a WhatsApp failure never causes an HTTP 500.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { sendWhatsAppTemplate, normalizePhoneForWA } = require("./msg91WhatsApp.service");
const TEMPLATES = require("./whatsappTemplates");
const { buildIdempotencyKey, isDuplicate, logWhatsAppMessage } = require("../../utils/whatsappLogger");

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Core send-and-log wrapper.
 * Handles idempotency, API call, logging — all in one place.
 */
const sendAndLog = async ({
  userId,
  phone,
  eventType,
  template,
  components,
  entityId,
}) => {
  const phoneNorm = normalizePhoneForWA(phone);

  if (!phoneNorm) {
    console.warn(
      `[wa-events] [${eventType}] Skipped — recipient has no phone number`
    );
    return { status: "skipped", reason: "no_phone" };
  }

  // Skip if template not configured
  if (!template || !template.templateName) {
    console.warn(
      `[wa-events] [${eventType}] Skipped — template not configured in .env`
    );
    await logWhatsAppMessage({
      userId,
      phoneNumber: phoneNorm,
      eventType,
      templateName: "",
      status: "skipped",
      provider: "skipped",
      error: "Template name not configured",
    });
    return { status: "skipped", reason: "template_not_configured" };
  }

  // Idempotency check
  const iKey = buildIdempotencyKey(eventType, entityId, userId);
  const duplicate = await isDuplicate(iKey, 5);
  if (duplicate) {
    console.log(
      `[wa-events] [${eventType}] Skipped — duplicate send (idempotency key: ${iKey.slice(0, 8)}...)`
    );
    return { status: "skipped", reason: "duplicate" };
  }

  try {
    const result = await sendWhatsAppTemplate(
      phoneNorm,
      template.templateName,
      components
    );

    await logWhatsAppMessage({
      userId,
      phoneNumber: phoneNorm,
      eventType,
      templateName: template.templateName,
      status: result.delivered ? "sent" : "skipped",
      provider: result.provider,
      providerMessageId: result.response?.msgId || result.response?.request_id || "",
      idempotencyKey: iKey,
    });

    return { status: "sent", result };
  } catch (err) {
    console.error(
      `[wa-events] [${eventType}] Send failed — ${err.message}`
    );

    await logWhatsAppMessage({
      userId,
      phoneNumber: phoneNorm,
      eventType,
      templateName: template.templateName,
      status: "failed",
      provider: "msg91_whatsapp",
      error: err.message,
      idempotencyKey: iKey,
    });

    // Do NOT re-throw — caller's business operation must still succeed
    return { status: "failed", error: err.message };
  }
};

// ─── Event Functions ──────────────────────────────────────────────────────────

/**
 * Send welcome WhatsApp message after user completes registration / OTP verification.
 * Supports mhp_welcome template:
 *   body_1: user name
 *   body_2: brand / portal name ("MyHosurProperty")
 *
 * @param {Object} user - Mongoose User document or user object with name & phone
 * @param {Object} [customParams] - Optional overrides for body_1 and body_2
 */
const sendWelcomeMessage = async (user, customParams = {}) => {
  const userName =
    (customParams.body_1 || user.name || "").trim() || "Customer";
  const brandName =
    (customParams.body_2 || process.env.MSG91_WA_WELCOME_BODY_2 || "MyHosurProperty").trim();

  return sendAndLog({
    userId: user._id ? String(user._id) : null,
    phone: user.phone,
    eventType: "WELCOME",
    template: TEMPLATES.WELCOME,
    components: {
      body_1: { type: "text", value: userName },
      body_2: { type: "text", value: brandName },
    },
    entityId: user._id ? String(user._id) : "welcome",
  });
};

/**
 * Send notification to property owner when property is submitted.
 * @param {Object} property - Mongoose Property document
 * @param {Object} user     - Mongoose User document (owner)
 */
const sendPropertySubmittedMessage = async (property, user) => {
  return sendAndLog({
    userId: String(user._id),
    phone: user.phone,
    eventType: "PROPERTY_SUBMITTED",
    template: TEMPLATES.PROPERTY_SUBMITTED,
    components: {
      body_1: { type: "text", value: user.name || "there" },
      body_2: { type: "text", value: property.title || "your property" },
    },
    entityId: String(property._id),
  });
};

/**
 * Send approval notification to property owner.
 * @param {Object} property - Mongoose Property document
 * @param {Object} user     - Mongoose User document (owner)
 */
const sendPropertyApprovedMessage = async (property, user) => {
  return sendAndLog({
    userId: String(user._id),
    phone: user.phone,
    eventType: "PROPERTY_APPROVED",
    template: TEMPLATES.PROPERTY_APPROVED,
    components: {
      body_1: { type: "text", value: user.name || "there" },
      body_2: { type: "text", value: property.title || "your property" },
    },
    entityId: String(property._id),
  });
};

/**
 * Send rejection notification to property owner.
 * @param {Object} property - Mongoose Property document
 * @param {Object} user     - Mongoose User document (owner)
 */
const sendPropertyRejectedMessage = async (property, user) => {
  return sendAndLog({
    userId: String(user._id),
    phone: user.phone,
    eventType: "PROPERTY_REJECTED",
    template: TEMPLATES.PROPERTY_REJECTED,
    components: {
      body_1: { type: "text", value: user.name || "there" },
      body_2: { type: "text", value: property.title || "your property" },
    },
    entityId: String(property._id),
  });
};

/**
 * Send enquiry notification to property owner (intentType = "contact" or "visit").
 * @param {Object} lead     - Mongoose Lead document
 * @param {Object} property - Mongoose Property document
 * @param {Object} owner    - Mongoose User document (property owner)
 */
const sendEnquiryCreatedMessage = async (lead, property, owner) => {
  const buyerName = lead.contactInfo?.name || "A buyer";
  return sendAndLog({
    userId: String(owner._id),
    phone: owner.phone,
    eventType: "ENQUIRY_CREATED",
    template: TEMPLATES.ENQUIRY_CREATED,
    components: {
      body_1: { type: "text", value: owner.name || "there" },
      body_2: { type: "text", value: property?.title || "your property" },
      body_3: { type: "text", value: buyerName },
    },
    entityId: String(lead._id),
  });
};

/**
 * Send callback request notification to property owner (intentType = "callback").
 * @param {Object} lead     - Mongoose Lead document
 * @param {Object} property - Mongoose Property document
 * @param {Object} owner    - Mongoose User document (property owner)
 */
const sendCallbackRequestedMessage = async (lead, property, owner) => {
  const buyerName = lead.contactInfo?.name || "A buyer";
  return sendAndLog({
    userId: String(owner._id),
    phone: owner.phone,
    eventType: "CALLBACK_REQUESTED",
    template: TEMPLATES.CALLBACK_REQUESTED,
    components: {
      body_1: { type: "text", value: owner.name || "there" },
      body_2: { type: "text", value: property?.title || "your property" },
      body_3: { type: "text", value: buyerName },
    },
    entityId: String(lead._id),
  });
};

/**
 * Send payment success notification to user after admin approves payment request.
 * @param {Object} paymentRequest - Mongoose PaymentRequest document
 * @param {Object} user           - Mongoose User document
 */
const sendPaymentSuccessMessage = async (paymentRequest, user) => {
  const planName = paymentRequest.approvedPlan || paymentRequest.selectedPlan || "your plan";
  const amount = `Rs. ${paymentRequest.amountPaid || 0}`;
  return sendAndLog({
    userId: String(user._id),
    phone: user.phone,
    eventType: "PAYMENT_SUCCESS",
    template: TEMPLATES.PAYMENT_SUCCESS,
    components: {
      body_1: { type: "text", value: user.name || "there" },
      body_2: { type: "text", value: planName },
      body_3: { type: "text", value: amount },
    },
    entityId: String(paymentRequest._id),
  });
};

module.exports = {
  sendWelcomeMessage,
  sendPropertySubmittedMessage,
  sendPropertyApprovedMessage,
  sendPropertyRejectedMessage,
  sendEnquiryCreatedMessage,
  sendCallbackRequestedMessage,
  sendPaymentSuccessMessage,
};
