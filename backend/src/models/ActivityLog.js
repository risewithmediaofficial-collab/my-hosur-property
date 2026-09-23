const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true,
      enum: [
        "USER_CREATED",
        "USER_UPDATED",
        "USER_ROLE_CHANGED",
        "USER_STATUS_CHANGED",
        "USER_DELETED_SOFT",
        "USER_RESTORED",
        "USER_PURGED_PERMANENT",
        "PROPERTY_CREATED",
        "PROPERTY_MODERATED",
        "PROPERTY_DELETED_SOFT",
        "PROPERTY_RESTORED",
        "PROPERTY_PURGED_PERMANENT",
        "LEAD_MODERATED",
        "LEAD_DELETED_SOFT",
        "LEAD_RESTORED",
        "CUSTOMER_REQUEST_DELETED_SOFT",
        "CUSTOMER_REQUEST_RESTORED",
        "PAYMENT_APPROVED",
        "PAYMENT_REJECTED",
        "NOTES_UPDATED",
        "PRICE_SETTING_UPDATED",
        "RECYCLE_BIN_EMPTIED",
        "SYSTEM_ACTION",
      ],
    },
    entityType: {
      type: String,
      enum: ["user", "property", "lead", "customer_request", "payment", "setting", "recycle_bin", "system"],
      required: true,
      index: true,
    },
    entityId: { type: String, default: "" },
    entityTitle: { type: String, default: "" },
    performedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: { type: String, default: "System / Admin" },
      email: { type: String, default: "" },
      role: { type: String, default: "admin" },
    },
    summary: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: "" },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
