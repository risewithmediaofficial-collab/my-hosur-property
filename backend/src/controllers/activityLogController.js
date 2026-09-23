const ActivityLog = require("../models/ActivityLog");

const getActivityLogs = async (req, res) => {
  try {
    const { action, entityType, search, limit = 50, page = 1 } = req.query;

    const query = {};
    if (action && action !== "all") query.action = action;
    if (entityType && entityType !== "all") query.entityType = entityType;

    if (search && search.trim()) {
      const rx = new RegExp(search.trim(), "i");
      query.$or = [
        { summary: rx },
        { entityTitle: rx },
        { "performedBy.name": rx },
        { "performedBy.email": rx },
      ];
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const [total, items] = await Promise.all([
      ActivityLog.countDocuments(query),
      ActivityLog.find(query)
        .sort("-createdAt")
        .skip(skip)
        .limit(safeLimit)
        .lean(),
    ]);

    return res.json({
      items,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    });
  } catch (error) {
    console.error("[getActivityLogs] Error:", error);
    return res.status(500).json({ message: "Failed to fetch activity logs", error: error.message });
  }
};

module.exports = { getActivityLogs };
