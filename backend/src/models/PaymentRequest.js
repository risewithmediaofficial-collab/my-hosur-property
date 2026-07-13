const mongoose = require("mongoose");

const paymentRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    selectedPlan: { type: String, required: true },
    approvedPlan: { type: String },
    amountPaid: { type: Number, required: true, min: 0 },
    transactionId: { type: String, required: true, unique: true, trim: true },
    paymentMethod: {
      type: String,
      enum: ["UPI", "Google Pay", "PhonePe", "Paytm", "Bank Transfer", "Other"],
      required: true,
    },
    paymentDate: { type: Date, required: true },
    screenshot: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: { type: String, trim: true },
    rejectionReason: { type: String, trim: true },
    approvedAt: { type: Date },
    expiryDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentRequest", paymentRequestSchema);
