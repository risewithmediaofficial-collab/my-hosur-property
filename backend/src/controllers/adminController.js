const User = require("../models/User");
const Property = require("../models/Property");
const Lead = require("../models/Lead");
const Payment = require("../models/Payment");
const CustomerRequest = require("../models/CustomerRequest");
const LeadUnlock = require("../models/LeadUnlock");
const Notification = require("../models/Notification");
const SystemSetting = require("../models/SystemSetting");
const buildPagination = require("../utils/paginate");
const sendEmail = require("../utils/sendEmail");
const { sendBulkEmail } = require("../utils/sendEmail");
const generateHtmlEmail = require("../utils/emailFormatter");

const getDateDaysAgo = (days = 0) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
};

const sumAmount = (items = []) => items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

const getMetrics = async (req, res) => {
  const sevenDaysAgo = getDateDaysAgo(7);
  const today = getDateDaysAgo(0);

  const [
    users,
    properties,
    pendingProperties,
    leads,
    payments,
    activePlans,
    failedPayments,
    todayLeads,
    weekLeads,
    weekUsers,
    weekProperties,
    paidItems,
    usersByRole,
    postingAccessApplications,
    customerRequests,
    leadUnlocks,
    unreadNotifications,
  ] = await Promise.all([
    User.countDocuments(),
    Property.countDocuments(),
    Property.countDocuments({ status: "pending" }),
    Lead.countDocuments(),
    Payment.countDocuments({ status: "paid" }),
    User.countDocuments({ "activePlan.expiresAt": { $gt: new Date() } }),
    Payment.countDocuments({ status: "failed" }),
    Lead.countDocuments({ createdAt: { $gte: today } }),
    Lead.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Property.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Payment.find({ status: "paid" }).select("amount"),
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    User.countDocuments({ role: { $in: ["seller", "agent", "broker", "builder"] }, canPostProperty: false }),
    CustomerRequest.countDocuments(),
    LeadUnlock.countDocuments({ status: "paid" }),
    Notification.countDocuments({ readAt: null }),
  ]);

  const roleBreakdown = usersByRole.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  res.json({
    users,
    properties,
    pendingProperties,
    leads,
    payments,
    activePlans,
    failedPayments,
    todayLeads,
    weekLeads,
    weekUsers,
    weekProperties,
    totalRevenue: sumAmount(paidItems),
    postingAccessApplications,
    customerRequests,
    leadUnlocks,
    unreadNotifications,
    buyers: roleBreakdown.buyer || 0,
    customers: roleBreakdown.customer || 0,
    sellers: roleBreakdown.seller || 0,
    agents: roleBreakdown.agent || 0,
    brokers: roleBreakdown.broker || 0,
    builders: roleBreakdown.builder || 0,
    admins: roleBreakdown.admin || 0,
  });
};

const getDashboardOverview = async (req, res) => {
  const [metrics, recentUsers, recentListings, recentLeads, recentPayments] = await Promise.all([
    (async () => {
      const result = {};
      const fakeRes = { json: (payload) => Object.assign(result, payload) };
      await getMetrics(req, fakeRes);
      return result;
    })(),
    User.find().select("name email role createdAt canPostProperty").sort("-createdAt").limit(8),
    Property.find().select("title status location createdAt price").populate("ownerId", "name role").sort("-createdAt").limit(8),
    Lead.find().select("intentType createdAt contactInfo").populate("propertyId", "title location").populate("userId", "name email").sort("-createdAt").limit(8),
    Payment.find().select("status amount transactionId createdAt").populate("userId", "name email").populate("planId", "name").sort("-createdAt").limit(8),
  ]);

  return res.json({
    metrics,
    queues: {
      pendingProperties: metrics.pendingProperties || 0,
      postingAccessApplications: metrics.postingAccessApplications || 0,
    },
    recent: {
      users: recentUsers,
      listings: recentListings,
      leads: recentLeads,
      payments: recentPayments,
    },
  });
};

const moderateProperty = async (req, res) => {
  const { status } = req.body;
  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(422).json({ message: "Invalid status" });
  }

  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ message: "Property not found" });

  property.status = status;
  if (status === "approved") {
    const now = new Date();
    const needsFeaturedRefresh = !property.featuredUntil || new Date(property.featuredUntil) <= now;
    if (needsFeaturedRefresh) {
      const until = new Date();
      until.setDate(until.getDate() + 7);
      property.featuredUntil = until;
    }
    property.promotionalScore = Math.max(property.promotionalScore || 0, 10);
  }

  await property.save();
  res.json(property);
};

const listPropertyApplications = async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query.page, req.query.limit);
  const query = {};

  if (req.query.status && req.query.status !== "all") {
    query.status = req.query.status;
  } else if (!req.query.status) {
    query.status = "pending";
  }
  if (req.query.city) {
    query["location.city"] = new RegExp(req.query.city, "i");
  }
  if (req.query.listingType) {
    query.listingType = req.query.listingType;
  }
  if (req.query.ownerType) {
    query.ownerType = req.query.ownerType;
  }

  const [total, items] = await Promise.all([
    Property.countDocuments(query),
    Property.find(query)
      .populate("ownerId", "name email phone role")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit),
  ]);

  return res.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
};

const listPostingAccessApplications = async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query.page, req.query.limit);
  const query = {
    role: { $in: ["seller", "agent", "broker", "builder"] },
    canPostProperty: false,
  };

  if (req.query.role) {
    query.role = req.query.role;
  }
  if (req.query.search) {
    const rx = new RegExp(req.query.search, "i");
    query.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }

  const [total, items] = await Promise.all([
    User.countDocuments(query),
    User.find(query).select("name email role phone canPostProperty createdAt").sort("-createdAt").skip(skip).limit(limit),
  ]);

  return res.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
};

const listUsers = async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query.page, req.query.limit);
  const query = {};

  if (req.query.role) query.role = req.query.role;
  if (req.query.canPostProperty === "true") query.canPostProperty = true;
  if (req.query.canPostProperty === "false") query.canPostProperty = false;
  if (req.query.search) {
    const rx = new RegExp(req.query.search, "i");
    query.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }

  const [total, items] = await Promise.all([
    User.countDocuments(query),
    User.find(query)
      .select("name email role status phone address adminNotes canPostProperty contactAccess leadCredits activePlan createdAt")
      .populate("activePlan.planId", "name category")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit),
  ]);

  const userIds = items.map((item) => item._id);
  const propertyAgg = await Property.aggregate([
    { $match: { ownerId: { $in: userIds } } },
    { $group: { _id: "$ownerId", totalProperties: { $sum: 1 }, approvedProperties: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } }, pendingProperties: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } } } },
  ]);

  const customerReqAgg = await CustomerRequest.aggregate([
    { $match: { matchedAgents: { $in: userIds } } },
    { $unwind: "$matchedAgents" },
    { $match: { matchedAgents: { $in: userIds } } },
    { $group: { _id: "$matchedAgents", count: { $sum: 1 } } },
  ]);

  const unlockAgg = await LeadUnlock.aggregate([
    { $match: { agentId: { $in: userIds }, status: "paid" } },
    { $group: { _id: "$agentId", count: { $sum: 1 } } },
  ]);

  const propertyByOwner = propertyAgg.reduce((acc, row) => {
    acc[String(row._id)] = row;
    return acc;
  }, {});

  const agentMatches = customerReqAgg.reduce((acc, row) => {
    acc[String(row._id)] = row.count;
    return acc;
  }, {});
  const agentUnlocks = unlockAgg.reduce((acc, row) => {
    acc[String(row._id)] = row.count;
    return acc;
  }, {});

  const enriched = items.map((user) => {
    const p = propertyByOwner[String(user._id)] || { totalProperties: 0, approvedProperties: 0, pendingProperties: 0 };
    return {
      ...user.toObject(),
      activePlanName: user.activePlan?.planId?.name || null,
      propertyStats: {
        total: p.totalProperties || 0,
        approved: p.approvedProperties || 0,
        pending: p.pendingProperties || 0,
      },
      customerLeadStats: {
        got: agentMatches[String(user._id)] || 0,
        bought: agentUnlocks[String(user._id)] || 0,
      },
    };
  });

  res.json({
    items: enriched,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
};

const updatePostingAccess = async (req, res) => {
  const enabled = Boolean(req.body.enabled);
  const updated = await User.findByIdAndUpdate(
    req.params.id,
    { canPostProperty: enabled },
    { new: true, runValidators: true }
  ).select("name email role canPostProperty");

  if (!updated) return res.status(404).json({ message: "User not found" });
  return res.json({ message: `Posting access ${enabled ? "enabled" : "disabled"}`, user: updated });
};

const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (String(user._id) === String(req.user._id)) {
    return res.status(400).json({ message: "You cannot change your own status" });
  }

  user.status = status;
  await user.save();
  return res.json({ message: `User status updated to ${status}`, user });
};

const updateUserNotes = async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.adminNotes = notes;
  await user.save();
  return res.json({ message: "User notes updated", user });
};

const listAllLeads = async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query.page, req.query.limit);
  const query = {};

  if (req.query.intentType) query.intentType = req.query.intentType;
  if (req.query.ownerId) query.ownerId = req.query.ownerId;
  if (req.query.dateFrom || req.query.dateTo) {
    query.createdAt = {};
    if (req.query.dateFrom) query.createdAt.$gte = new Date(req.query.dateFrom);
    if (req.query.dateTo) query.createdAt.$lte = new Date(req.query.dateTo);
  }

  const [total, items] = await Promise.all([
    Lead.countDocuments(query),
    Lead.find(query)
      .populate("propertyId", "title price location listingType status")
      .populate("userId", "name email phone")
      .populate("ownerId", "name email phone role")
      .populate("brokerAssignments.brokerId", "name email phone role")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit),
  ]);

  return res.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
};

const assignLeadToBroker = async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: "Lead not found" });

  const broker = await User.findOne({
    _id: req.body.brokerId,
    role: { $in: ["agent", "broker"] },
  }).select("_id name email role");
  if (!broker) return res.status(404).json({ message: "Broker/agent not found" });

  const exists = (lead.brokerAssignments || []).some((a) => String(a.brokerId) === String(broker._id));
  if (exists) return res.status(409).json({ message: "Broker already assigned to lead" });

  lead.brokerAssignments.push({
    brokerId: broker._id,
    status: "new",
  });
  await lead.save();

  return res.json({ message: "Lead assigned successfully", lead });
};

const updateLeadAssignmentStatus = async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: "Lead not found" });

  const assignment = (lead.brokerAssignments || []).find((a) => String(a.brokerId) === String(req.params.brokerId));
  if (!assignment) return res.status(404).json({ message: "Broker assignment not found on lead" });

  assignment.status = req.body.status;
  if (req.body.status === "contacted" && !assignment.purchasedAt) {
    assignment.purchasedAt = new Date();
  }
  await lead.save();

  return res.json({ message: "Lead assignment updated", lead });
};

const listAllPayments = async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query.page, req.query.limit);
  const query = {};

  if (req.query.status) query.status = req.query.status;
  if (req.query.userId) query.userId = req.query.userId;
  if (req.query.dateFrom || req.query.dateTo) {
    query.createdAt = {};
    if (req.query.dateFrom) query.createdAt.$gte = new Date(req.query.dateFrom);
    if (req.query.dateTo) query.createdAt.$lte = new Date(req.query.dateTo);
  }

  const [total, items, summary] = await Promise.all([
    Payment.countDocuments(query),
    Payment.find(query).populate("userId", "name email role").populate("planId", "name category").sort("-createdAt").skip(skip).limit(limit),
    Payment.find({ ...query, status: "paid" }).select("amount"),
  ]);

  res.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    paidRevenue: sumAmount(summary),
  });
};

const listCustomerRequests = async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query.page, req.query.limit);
  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.propertyType) query.propertyType = req.query.propertyType;
  if (req.query.city) query["location.city"] = new RegExp(req.query.city, "i");

  const [total, items] = await Promise.all([
    CustomerRequest.countDocuments(query),
    CustomerRequest.find(query)
      .populate("customerId", "name email phone role")
      .populate("matchedAgents", "name email role")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit),
  ]);

  return res.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
};

const listLeadUnlocks = async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query.page, req.query.limit);
  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.agentId) query.agentId = req.query.agentId;

  const [total, items] = await Promise.all([
    LeadUnlock.countDocuments(query),
    LeadUnlock.find(query)
      .populate("agentId", "name email role")
      .populate("customerId", "name email phone role")
      .populate("customerRequestId", "location budgetMin budgetMax propertyType status")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit),
  ]);

  return res.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
};

const getLeadPricing = async (req, res) => {
  let item = await SystemSetting.findOne({ key: "lead_unlock_price" });
  if (!item) {
    item = await SystemSetting.create({ key: "lead_unlock_price", value: 200 });
  }

  return res.json({ value: Number(item.value) || 200 });
};

const updateLeadPricing = async (req, res) => {
  const value = Number(req.body.value);
  if (!Number.isFinite(value) || value < 0) {
    return res.status(422).json({ message: "Invalid lead unlock price" });
  }

  const item = await SystemSetting.findOneAndUpdate(
    { key: "lead_unlock_price" },
    { $set: { value } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return res.json({ value: Number(item.value) || 200, message: "Lead unlock price updated" });
};

const getRecentActivity = async (req, res) => {
  const [recentUsers, recentProperties, recentLeads, recentPayments] = await Promise.all([
    User.find().select("name email role createdAt").sort("-createdAt").limit(10),
    Property.find().select("title status location createdAt").populate("ownerId", "name role").sort("-createdAt").limit(10),
    Lead.find().select("intentType createdAt").populate("userId", "name").populate("propertyId", "title").sort("-createdAt").limit(10),
    Payment.find().select("status amount transactionId createdAt").populate("userId", "name").populate("planId", "name").sort("-createdAt").limit(10),
  ]);

  return res.json({
    users: recentUsers,
    properties: recentProperties,
    leads: recentLeads,
    payments: recentPayments,
  });
};

const sendAdminEmail = async (req, res) => {
  try {
    const { userIds, subject, message, isBroadcast } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required" });
    }

    // Get recipient email addresses
    let emails = [];
    let recipientName = "User";

    if (isBroadcast) {
      const users = await User.find({ status: "active" }).select("email name");
      emails = users.map(u => u.email).filter(Boolean);
      recipientName = "Valued Member";
    } else if (userIds && userIds.length > 0) {
      const users = await User.find({ _id: { $in: userIds } }).select("email name");
      emails = users.map(u => u.email).filter(Boolean);
      if (users.length > 0) {
        recipientName = users[0].name || "User";
      }
    }

    if (emails.length === 0) {
      return res.status(400).json({ message: "No valid email addresses found." });
    }

    // Generate email HTML content
    const htmlContent = generateHtmlEmail({
      name: recipientName,
      title: subject,
      message: message,
      buttonText: "Visit Dashboard",
      buttonUrl: process.env.CLIENT_URL || "http://localhost:5173",
      type: "general",
    });

    // Send emails via EmailJS
    if (emails.length === 1) {
      // Single email
      const result = await sendEmail({
        to: emails[0],
        subject: subject,
        html: htmlContent,
        text: message, // Fallback plain text
      });
      
      if (!result) {
        return res.status(500).json({ 
          message: "Failed to send email. Check server logs for EmailJS errors.",
          details: "Email service returned an error. Verify EMAILJS credentials."
        });
      }
    } else {
      // Bulk emails
      const results = await sendBulkEmail({
        to: emails,
        subject: subject,
        html: htmlContent,
        text: message,
      });

      const successCount = results.filter(r => r).length;
      if (successCount === 0) {
        return res.status(500).json({ 
          message: "Failed to send emails. Check server logs for details.",
          details: "All email sends failed. Verify EMAILJS configuration."
        });
      }
    }

    return res.json({ 
      message: `Email sent successfully to ${emails.length} user(s).` 
    });
  } catch (error) {
    console.error("[sendAdminEmail] Error:", error.message);
    return res.status(500).json({ 
      message: "Error sending email", 
      error: error.message 
    });
  }
};

module.exports = {
  getMetrics,
  getDashboardOverview,
  moderateProperty,
  listPropertyApplications,
  listPostingAccessApplications,
  listUsers,
  updatePostingAccess,
  toggleUserStatus,
  updateUserNotes,
  listAllLeads,
  assignLeadToBroker,
  updateLeadAssignmentStatus,
  listAllPayments,
  listCustomerRequests,
  listLeadUnlocks,
  getLeadPricing,
  updateLeadPricing,
  getRecentActivity,
  sendAdminEmail,
};
