const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    subtitle: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    billingLabel: { type: String, default: "/month" },
    ctaLabel: { type: String, default: "Get Started" },
    recommended: { type: Boolean, default: false },
    features: [{ type: String }],
    listingLimit: { type: Number, required: true, min: 1 },
    durationDays: { type: Number, required: true, min: 1 },
    featuredBoost: { type: Boolean, default: false },
    category: {
      type: String,
      enum: ["seller_listing", "buyer_premium", "broker_leads"],
      default: "seller_listing",
    },
    targetRole: {
      type: String,
      enum: ["buyer", "seller", "agent", "broker", "builder", "all"],
      default: "all",
    },
    contactUnlocks: { type: Number, default: 0 },
    leadCredits: { type: Number, default: 0 },
    boostDays: { type: Number, default: 7 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);
