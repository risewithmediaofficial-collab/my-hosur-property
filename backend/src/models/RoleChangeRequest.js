const mongoose = require("mongoose");

const roleChangeRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentRole: {
      type: String,
      required: true,
    },
    requestedRole: {
      type: String,
      required: true,
      enum: ["buyer", "customer", "seller", "agent", "broker", "builder"],
    },
    reason: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RoleChangeRequest", roleChangeRequestSchema);
