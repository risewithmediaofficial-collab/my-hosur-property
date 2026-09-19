/**
 * WhatsApp Message Log Model
 *
 * Tracks every WhatsApp notification attempt (sent, failed, or skipped).
 * This is a NEW collection — does NOT modify any existing collection.
 *
 * Used for:
 * - Audit trail of all WhatsApp messages
 * - Duplicate / idempotency protection
 * - Debugging delivery failures
 */

const mongoose = require("mongoose");

const EVENT_TYPES = [
  "WELCOME",
  "PROPERTY_SUBMITTED",
  "PROPERTY_APPROVED",
  "PROPERTY_REJECTED",
  "ENQUIRY_CREATED",
  "CALLBACK_REQUESTED",
  "PAYMENT_SUCCESS",
  "BOT_PROPERTY_SEARCH",
  "BOT_PROPERTY_SUBMISSION",
  "BOT_SUPPORT_REQUEST",
];

const whatsAppMessageLogSchema = new mongoose.Schema(
  {
    /** Reference to the User record (optional — may be null for bot events before user lookup) */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /** Recipient phone number (normalized to 91XXXXXXXXXX format) */
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    /** The business event that triggered this message */
    eventType: {
      type: String,
      enum: EVENT_TYPES,
      required: true,
    },

    /** MSG91 approved template name used */
    templateName: {
      type: String,
      trim: true,
      default: "",
    },

    /** Message send status */
    status: {
      type: String,
      enum: ["sent", "failed", "skipped"],
      required: true,
    },

    /** Provider label e.g. "msg91_whatsapp", "skipped", "development" */
    provider: {
      type: String,
      default: "msg91_whatsapp",
    },

    /** Message ID returned by MSG91 (if available) */
    providerMessageId: {
      type: String,
      default: "",
    },

    /** Full payload sent to MSG91 (masked — no auth keys) */
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: undefined,
    },

    /** Error message if status = "failed" */
    error: {
      type: String,
      default: "",
    },

    /**
     * Idempotency key: prevents duplicate messages for the same event.
     * Format: eventType:entityId:userId  (hashed)
     * Sparse unique index — allows null/missing values.
     */
    idempotencyKey: {
      type: String,
      trim: true,
      default: undefined,
    },
  },
  { timestamps: true }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
// Unique sparse index for idempotency — prevents duplicate sends
whatsAppMessageLogSchema.index(
  { idempotencyKey: 1 },
  { unique: true, sparse: true }
);

// Lookup by user
whatsAppMessageLogSchema.index({ userId: 1, createdAt: -1 });

// Lookup by phone + event for debugging
whatsAppMessageLogSchema.index({ phoneNumber: 1, eventType: 1, createdAt: -1 });

module.exports = mongoose.model("WhatsAppMessageLog", whatsAppMessageLogSchema);
