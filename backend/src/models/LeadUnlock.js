const mongoose = require("mongoose");

const leadUnlockSchema = new mongoose.Schema(
  {
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "CustomerRequest", required: true },
    amount: { type: Number, required: true, min: 0, default: 200 },
    status: { type: String, enum: ["created", "paid", "failed"], default: "paid" },
    transactionRef: { type: String, required: true, unique: true },
    gateway: { type: String, default: "simulated" },
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeadUnlock", leadUnlockSchema);
