const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: false, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    address: { type: String, trim: true },
    adminNotes: { type: String, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["buyer", "customer", "seller", "agent", "broker", "builder", "admin"],
      default: "buyer",
    },
    status: {
      type: String,
      enum: ["active", "deactivated"],
      default: "active",
    },
    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    otpVerification: {
      challengeId: { type: String, default: "" },
      purpose: { type: String, enum: ["signup", "email_signup", "login", "forgot_password", ""], default: "" },
      codeHash: { type: String, default: "" },
      expiresAt: { type: Date, default: null },
      resendAvailableAt: { type: Date, default: null },
      attempts: { type: Number, default: 0 },
      maxAttempts: { type: Number, default: 5 },
      lastSentAt: { type: Date, default: null },
      verifiedAt: { type: Date, default: null },
    },
    canPostProperty: { type: Boolean, default: false },
    freePost: {
      used: { type: Boolean, default: false },
      expiresAt: { type: Date, default: null },
    },
    savedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
    recentSearches: [
      {
        city: String,
        propertyType: String,
        listingType: String,
        searchedAt: { type: Date, default: Date.now },
      },
    ],
    contactAccess: {
      monthlyLimit: { type: Number, default: 5 },
      usedCount: { type: Number, default: 0 },
      resetAt: Date,
      isPremium: { type: Boolean, default: false },
    },
    leadCredits: { type: Number, default: 0 },
    customerLeadCredits: { type: Number, default: 5 },
    activePlan: {
      planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
      expiresAt: Date,
      listingLimit: Number,
      listingsUsed: { type: Number, default: 0 },
      isBoosted: { type: Boolean, default: false },
      contactUnlocks: { type: Number, default: 0 },
      leadCredits: { type: Number, default: 0 },
      boostDays: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
