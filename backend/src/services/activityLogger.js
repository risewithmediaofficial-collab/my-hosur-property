const ActivityLog = require("../models/ActivityLog");

/**
 * Record an activity or change event in the live tracker.
 * Asynchronous, never crashes the calling request.
 */
const logActivity = async ({
  action,
  entityType,
  entityId = "",
  entityTitle = "",
  req = null,
  performedBy = null,
  summary = "",
  details = {},
}) => {
  try {
    let actor = performedBy;

    if (!actor && req && req.user) {
      actor = {
        userId: req.user._id,
        name: req.user.name || "Admin",
        email: req.user.email || "",
        role: req.user.role || "admin",
      };
    }

    if (!actor) {
      actor = {
        name: "System Administrator",
        email: "admin@myhosurproperty.com",
        role: "admin",
      };
    }

    const ip = req ? (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "") : "";

    await ActivityLog.create({
      action,
      entityType,
      entityId: String(entityId || ""),
      entityTitle: String(entityTitle || ""),
      performedBy: actor,
      summary: summary || `${action} on ${entityType} ${entityTitle}`.trim(),
      details,
      ipAddress: Array.isArray(ip) ? ip[0] : String(ip).split(",")[0].trim(),
    });
  } catch (error) {
    console.error("[activityLogger] Error logging activity:", error.message);
  }
};

module.exports = { logActivity };
