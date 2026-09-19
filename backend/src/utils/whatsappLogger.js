/**
 * WhatsApp Logger Utility
 *
 * Writes to the WhatsAppMessageLog collection.
 * Provides idempotency check to prevent duplicate messages.
 *
 * NEVER throws — logging failures must not affect business operations.
 */

const crypto = require("crypto");
const mongoose = require("mongoose");
const WhatsAppMessageLog = require("../models/WhatsAppMessageLog");

/**
 * Build a deterministic idempotency key.
 * Prevents the same event from being sent twice within a short window.
 *
 * @param {string} eventType - e.g. "PROPERTY_APPROVED"
 * @param {string} entityId  - e.g. propertyId or leadId
 * @param {string} userId    - user's MongoDB _id (string)
 */
const buildIdempotencyKey = (eventType, entityId, userId) => {
  const raw = `${eventType}:${entityId || ""}:${userId || ""}`;
  return crypto.createHash("md5").update(raw).digest("hex");
};

/**
 * Check if an identical message was already sent within a cooldown window.
 *
 * @param {string} idempotencyKey
 * @param {number} cooldownMinutes - default 5 minutes
 * @returns {Promise<boolean>} true = duplicate (skip), false = new send (proceed)
 */
const isDuplicate = async (idempotencyKey, cooldownMinutes = 5) => {
  if (!idempotencyKey) return false;
  // If MongoDB is not connected, fail open so notifications are not blocked
  if (mongoose.connection.readyState !== 1) return false;
  try {
    const cutoff = new Date(Date.now() - cooldownMinutes * 60 * 1000);
    const existing = await WhatsAppMessageLog.findOne({
      idempotencyKey,
      status: "sent",
      createdAt: { $gte: cutoff },
    });
    return Boolean(existing);
  } catch (e) {
    console.error("[wa-logger] isDuplicate check failed:", e.message);
    return false; // fail open — allow send if check fails
  }
};

/**
 * Log a WhatsApp message attempt to MongoDB.
 *
 * @param {Object} opts
 * @param {string}  opts.userId         - MongoDB user _id (string or ObjectId)
 * @param {string}  opts.phoneNumber    - Normalized phone
 * @param {string}  opts.eventType      - EVENT_TYPES enum value
 * @param {string}  opts.templateName   - MSG91 template name
 * @param {string}  opts.status         - "sent" | "failed" | "skipped"
 * @param {string}  [opts.provider]     - e.g. "msg91_whatsapp"
 * @param {string}  [opts.providerMessageId]
 * @param {Object}  [opts.payload]      - sanitized payload (no auth keys)
 * @param {string}  [opts.error]        - error message if status = "failed"
 * @param {string}  [opts.idempotencyKey]
 */
const logWhatsAppMessage = async ({
  userId,
  phoneNumber,
  eventType,
  templateName,
  status,
  provider = "msg91_whatsapp",
  providerMessageId = "",
  payload = undefined,
  error = "",
  idempotencyKey,
}) => {
  // Mask phone number for console (show first 6 + last 4)
  const maskedPhone = phoneNumber
    ? `${String(phoneNumber).slice(0, 6)}****${String(phoneNumber).slice(-4)}`
    : "(unknown)";

  try {
    const logDoc = {
      userId: userId || null,
      phoneNumber,
      eventType,
      templateName,
      status,
      provider,
      providerMessageId,
      error,
    };

    if (payload) {
      // Sanitize — never log authkey
      const sanitized = JSON.parse(JSON.stringify(payload));
      if (sanitized?.headers?.authkey) delete sanitized.headers.authkey;
      logDoc.payload = sanitized;
    }

    if (idempotencyKey) {
      logDoc.idempotencyKey = idempotencyKey;
    }

    console.log(
      `[wa-logger] [${status.toUpperCase()}] eventType=${eventType} template=${templateName || "(none)"} phone=${maskedPhone}`
    );

    if (mongoose.connection.readyState === 1) {
      await WhatsAppMessageLog.create(logDoc);
    }
  } catch (logErr) {
    // Duplicate key = already logged (idempotency key collision — not an error)
    if (logErr.code === 11000) {
      console.log(
        `[wa-logger] [DUPLICATE SKIPPED] eventType=${eventType} phone=${maskedPhone}`
      );
      return;
    }
    // Any other logging error is non-fatal
    console.error("[wa-logger] Failed to write log entry:", logErr.message);
  }
};

module.exports = {
  buildIdempotencyKey,
  isDuplicate,
  logWhatsAppMessage,
};
