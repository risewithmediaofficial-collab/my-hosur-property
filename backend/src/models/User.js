const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: false, lowercase: true, trim: true, default: undefined },
    phone: { type: String, trim: true, default: undefined },
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
  // --- Guard: never persist null or empty email/phone ---
  // If the field is falsy (null, "", undefined), remove it from the document
  // so it never reaches the unique index as `null`.
  if (this.email !== undefined && (this.email === null || String(this.email).trim() === '')) {
    delete this._doc.email;
    this.email = undefined;
  }
  if (this.phone !== undefined && (this.phone === null || String(this.phone).trim() === '')) {
    delete this._doc.phone;
    this.phone = undefined;
  }

  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Create partial unique indexes so documents without an email/phone
// (or where the field is not a string) are not considered for uniqueness.
// This avoids duplicate-key errors when code writes `null` or omits the field.
userSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } });
userSchema.index({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $type: 'string' } } });

module.exports = mongoose.model("User", userSchema);
