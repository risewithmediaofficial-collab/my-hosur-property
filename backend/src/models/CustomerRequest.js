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
      ],
      default: "property_buy",
      required: true,
    },
    propertyType: {
      type: String,
      enum: [
        "Apartment",
        "Villa",
        "Independent House",
        "Plot",
        "Commercial",
        "House",
        "Office",
        "Warehouse",
        "Land",
        "Industrial Shed",
      ],
    },
    serviceType: {
      type: String,
      trim: true,
      default: "",
    },
    additionalRequirements: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["open", "matched", "closed"], default: "open" },
    matchedAgents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomerRequest", customerRequestSchema);
