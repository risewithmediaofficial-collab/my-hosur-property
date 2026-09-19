/**
 * WhatsApp Support Request Model
 *
 * Stores support messages submitted via the WhatsApp bot.
 * This is a NEW collection — does NOT modify any existing collection.
 */

const mongoose = require("mongoose");

const whatsAppSupportRequestSchema = new mongoose.Schema(
  {
    /** Normalized phone number (91XXXXXXXXXX) of the WhatsApp sender */
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    /** Reference to existing user if matched */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /** Name of the sender (from User record or provided by bot) */
    name: {
      type: String,
      trim: true,
      default: "",
    },

    /** The support message text */
    message: {
      type: String,
      required: true,
      trim: true,
    },

    /** Request status for admin tracking */
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },

    /** Optional admin notes for this request */
    adminNotes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Indexes
whatsAppSupportRequestSchema.index({ phoneNumber: 1, createdAt: -1 });
whatsAppSupportRequestSchema.index({ status: 1, createdAt: -1 });
whatsAppSupportRequestSchema.index({ userId: 1 });

module.exports = mongoose.model(
  "WhatsAppSupportRequest",
  whatsAppSupportRequestSchema
);
