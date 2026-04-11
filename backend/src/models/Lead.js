const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    intentType: {
      type: String,
      enum: ["contact", "callback", "visit"],
      default: "contact",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    brokerAssignments: [
      {
        brokerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        purchasedAt: Date,
        status: { type: String, enum: ["new", "contacted", "converted"], default: "new" },
      },
    ],
    contactInfo: {
      name: String,
      email: String,
      phone: String,
      message: String,
    },
    isUnlockedByOwner: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
