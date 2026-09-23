const mongoose = require("mongoose");

const customerRequestSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true, trim: true },
    contactDetails: {
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
    },
    location: {
      city: { type: String, required: true, trim: true },
      area: { type: String, required: true, trim: true },
    },
    budgetMin: { type: Number, default: 0, min: 0 },
    budgetMax: { type: Number, default: 0, min: 0 },
    requestCategory: {
      type: String,
      enum: [
        "property_buy",
        "property_sell",
        "property_rent",
        "loan",
        "interior",
        "construction",
        "property_management",
        "home_office_services",
      ],
      default: "property_buy",
      required: true,
    },
    propertyType: {
      type: String,
      trim: true,
      default: "",
    },
    serviceType: {
      type: String,
      trim: true,
      default: "",
    },
    additionalRequirements: { type: String, trim: true, default: "" },
    propertyDetails: { type: mongoose.Schema.Types.Mixed, default: undefined },
    status: { type: String, enum: ["open", "matched", "closed"], default: "open" },
    matchedAgents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomerRequest", customerRequestSchema);
