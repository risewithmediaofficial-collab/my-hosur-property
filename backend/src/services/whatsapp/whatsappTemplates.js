/**
 * WhatsApp Template Registry
 *
 * All MSG91 template names come from environment variables.
 * Template names must match EXACTLY what is approved in your MSG91 dashboard.
 *
 * If a template name env var is empty, the corresponding notification is
 * silently skipped — the website continues working normally.
 *
 * Steps to activate a template:
 * 1. Create and get approval for the template in MSG91 dashboard.
 * 2. Add the approved template name to backend/.env.
 * 3. Restart the backend server.
 */

const TEMPLATES = {
  /**
   * Sent after a new user completes registration / OTP verification.
   * Template: mhp_welcome
   * Template variables:
   *   body_1: user name
   *   body_2: brand / portal name ("MyHosurProperty")
   */
  WELCOME: {
    templateName: process.env.MSG91_WA_WELCOME_TEMPLATE_NAME || "mhp_welcome",
    language: process.env.MSG91_WHATSAPP_LANG || "en",
  },

  /**
   * Sent to property owner after a property is submitted.
   * Template variables: {{1}} = owner name, {{2}} = property title
   */
  PROPERTY_SUBMITTED: {
    templateName: process.env.MSG91_WA_PROPERTY_SUBMITTED_TEMPLATE_NAME || "",
    language: process.env.MSG91_WHATSAPP_LANG || "en",
  },

  /**
   * Sent to property owner after admin approves the property.
   * Template variables: {{1}} = owner name, {{2}} = property title
   */
  PROPERTY_APPROVED: {
    templateName: process.env.MSG91_WA_PROPERTY_APPROVED_TEMPLATE_NAME || "",
    language: process.env.MSG91_WHATSAPP_LANG || "en",
  },

  /**
   * Sent to property owner after admin rejects the property.
   * Template variables: {{1}} = owner name, {{2}} = property title
   */
  PROPERTY_REJECTED: {
    templateName: process.env.MSG91_WA_PROPERTY_REJECTED_TEMPLATE_NAME || "",
    language: process.env.MSG91_WHATSAPP_LANG || "en",
  },

  /**
   * Sent to property owner when a buyer enquiry (contact) is created.
   * Template variables: {{1}} = owner name, {{2}} = property title, {{3}} = buyer name
   */
  ENQUIRY_CREATED: {
    templateName: process.env.MSG91_WA_ENQUIRY_TEMPLATE_NAME || "",
    language: process.env.MSG91_WHATSAPP_LANG || "en",
  },

  /**
   * Sent to property owner when a callback request is created.
   * Template variables: {{1}} = owner name, {{2}} = property title, {{3}} = buyer name
   */
  CALLBACK_REQUESTED: {
    templateName: process.env.MSG91_WA_CALLBACK_TEMPLATE_NAME || "",
    language: process.env.MSG91_WHATSAPP_LANG || "en",
  },

  /**
   * Sent to user after a manual payment request is approved by admin.
   * Template variables: {{1}} = user name, {{2}} = plan name, {{3}} = amount
   */
  PAYMENT_SUCCESS: {
    templateName: process.env.MSG91_WA_PAYMENT_SUCCESS_TEMPLATE_NAME || "",
    language: process.env.MSG91_WHATSAPP_LANG || "en",
  },
};

module.exports = TEMPLATES;
