const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    propertyType: {
      type: String,
      enum: ["Apartment", "Villa", "Independent House", "Plot", "Commercial"],
      required: true,
    },
    furnishingStatus: {
      type: String,
      enum: ["Furnished", "Semi-Furnished", "Unfurnished"],
      default: "Unfurnished",
    },
    bhk: { type: Number, min: 0 },
    bathrooms: { type: Number, min: 0, default: 1 },
    carpetArea: { type: Number, min: 0 },
    builtupArea: { type: Number, min: 0 },
    areaUnit: { type: String, enum: ["sqft", "sqm"], default: "sqft" },
    floorNumber: { type: Number, min: 0 },
    totalFloors: { type: Number, min: 0 },
    possessionStatus: {
      type: String,
      enum: ["Ready to Move", "Under Construction"],
      default: "Ready to Move",
    },
    possessionDate: Date,
    facing: {
      type: String,
      enum: ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"],
    },
    verification: {
      isVerified: { type: Boolean, default: false },
      reraId: { type: String, trim: true },
      lastVerifiedAt: Date,
    },
    location: {
      city: { type: String, required: true, trim: true },
      area: { type: String, required: true, trim: true },
      address: { type: String, trim: true },
      lat: Number,
      lng: Number,
    },
    amenities: [{ type: String }],
    nearbyFacilities: [{ type: String }],
    virtualTourUrl: { type: String, trim: true },
    listingContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    localityInsights: {
      rating: { type: Number, default: 4.1 },
      connectivity: { type: Number, default: 4.0 },
      safety: { type: Number, default: 3.9 },
      livability: { type: Number, default: 4.2 },
      notes: { type: String, default: "Good access to schools, transit, and daily essentials." },
    },
    images: [{ type: String }],
    documents: [{ type: String }],
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ownerType: { type: String, enum: ["seller", "agent", "broker", "builder"], required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    listingType: { type: String, enum: ["sale", "rent", "new-project"], default: "sale" },
    listingSource: { type: String, enum: ["owner", "builder", "agent"], default: "owner" },
    featuredUntil: Date,
    promotionalScore: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    inquiryCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

propertySchema.index({ "location.city": "text", "location.area": "text", title: "text" });

module.exports = mongoose.model("Property", propertySchema);
