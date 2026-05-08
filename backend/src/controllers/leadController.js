const Lead = require("../models/Lead");
const Property = require("../models/Property");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const { inquiryConfirmationEmail, baseEmailLayout } = require("../utils/emailTemplates");



const distributeToBrokers = async (property, buyerId) => {
  const brokers = await User.find({
    _id: { $ne: buyerId },
    role: { $in: ["agent", "broker"] },
  })
    .select("_id")
    .limit(3);

  return brokers.map((b) => ({ brokerId: b._id, status: "new" }));
};

const createLead = async (req, res) => {
  const property = await Property.findById(req.body.propertyId).populate("ownerId", "email name phone");
  if (!property || property.status !== "approved") {
    return res.status(404).json({ message: "Property not found or not active" });
  }

  const buyer = await User.findById(req.user._id);
  
  // 1. Check if they already have an existing lead for THIS property
  const existingLead = await Lead.findOne({ userId: req.user._id, propertyId: property._id });
  
  if (!existingLead) {
    // New unique property inquiry - check limits for the BUYER
    const monthlyLimit = buyer.contactAccess?.monthlyLimit || 5;
    const usedCount = buyer.contactAccess?.usedCount || 0;
    const planUnlocks = buyer.activePlan?.contactUnlocks || 0;

    if (usedCount >= monthlyLimit && planUnlocks <= 0) {
      return res.status(402).json({ 
        message: "Monthly free inquiry limit reached (5 max). Upgrade your plan or add credits to contact more owners." 
      });
    }

    if (usedCount < monthlyLimit) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { "contactAccess.usedCount": 1 } });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $inc: { "activePlan.contactUnlocks": -1 } });
    }
  }

  // 2. CHECK "FREE 5" LOGIC FOR THE OWNER
  const ownerLeadCount = await Lead.countDocuments({ ownerId: property.ownerId._id });
  const isUnlockedByOwner = ownerLeadCount < 5;

  const brokerAssignments = await distributeToBrokers(property, req.user._id);

  const lead = await Lead.create({
    userId: req.user._id,
    propertyId: property._id,
    ownerId: property.ownerId._id,
    intentType: req.body.intentType || "contact",
    brokerAssignments,
    status: "pending",
    isUnlockedByOwner,
    contactInfo: {
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      message: req.body.message,
    },
  });

  await Property.findByIdAndUpdate(property._id, { $inc: { inquiryCount: 1 } });

  const intentLabel =
    lead.intentType === "callback"
      ? "Callback Request"
      : lead.intentType === "visit"
        ? "Site Visit Request"
        : "Property Inquiry";

  try {
    // ── Email to Property Owner ──
    const ownerEmailHtml = baseEmailLayout(
      `
      <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;color:#1E293B;">
        New ${intentLabel} Received 📨
      </h2>
      <div style="width:40px;height:3px;background:#F59E0B;border-radius:2px;margin:12px 0 20px;"></div>

      <p style="margin:0 0 16px;color:#64748B;">
        A buyer has shown interest in your property and sent you an inquiry.
      </p>

      <div style="background:#FEF3C7;padding:16px;border-radius:8px;margin:20px 0;border-left:4px solid #F59E0B;">
        <p style="margin:0;color:#92400E;font-weight:600;">🏠 Property: ${property.title}</p>
        <p style="margin:8px 0 0;color:#92400E;font-size:13px;">Location: ${property.location?.area}, ${property.location?.city}</p>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;">
        <tr style="background:#F8FAFC;">
          <td style="padding:12px 16px;border-right:1px solid #E2E8F0;font-weight:600;color:#64748B;width:40%;">Buyer Name</td>
          <td style="padding:12px 16px;color:#1E293B;">${req.user.name}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;border-right:1px solid #E2E8F0;font-weight:600;color:#64748B;">Type</td>
          <td style="padding:12px 16px;color:#1E293B;">${intentLabel}</td>
        </tr>
        <tr style="background:#F8FAFC;">
          <td style="padding:12px 16px;border-right:1px solid #E2E8F0;font-weight:600;color:#64748B;">Contact</td>
          <td style="padding:12px 16px;">
            <a href="mailto:${req.user.email}" style="color:#2563EB;text-decoration:none;">${req.user.email}</a>
            <br/>
            <a href="tel:${req.user.phone}" style="color:#2563EB;text-decoration:none;">${req.user.phone}</a>
          </td>
        </tr>
        ${
          req.body.message
            ? `
            <tr>
              <td colspan="2" style="padding:12px 16px;border-top:1px solid #E2E8F0;">
                <p style="margin:0 0 8px;font-weight:600;color:#64748B;font-size:12px;">MESSAGE</p>
                <p style="margin:0;color:#1E293B;font-size:13px;line-height:1.6;white-space:pre-wrap;">${req.body.message}</p>
              </td>
            </tr>
            `
            : ""
        }
      </table>

      <p style="margin:16px 0;color:#64748B;font-size:13px;">
        <strong>Lead ID:</strong> ${lead._id}
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr>
          <td align="center">
            <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard/inquiries"
               style="display:inline-block;background:linear-gradient(135deg,#2563EB 0%,#1D4ED8 100%);color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;padding:12px 36px;border-radius:8px;">
              View in Dashboard
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:16px 0 0;color:#64748B;font-size:12px;">
        Respond quickly to increase your chances of conversion. Check your dashboard for more details.
      </p>
      `,
      `📨 New Inquiry`
    );

    await sendEmail({
      to: property.ownerId.email,
      subject: `📨 ${intentLabel} - ${property.title}`,
      html: ownerEmailHtml,
    });

    // ── Email to Buyer (Confirmation) ──
    const buyerEmailHtml = inquiryConfirmationEmail(req.user, property, lead._id);

    await sendEmail({
      to: req.user.email,
      subject: `✓ Your inquiry was sent - ${property.title}`,
      html: buyerEmailHtml,
    });

    console.log(`[createLead] Confirmation emails sent for lead ${lead._id}`);
  } catch (err) {
    console.error("[createLead] Email failed:", err.message);
  }

  return res.status(201).json({ lead, message: "Lead captured and owner notified" });
};

const myLeads = async (req, res) => {
  const user = await User.findById(req.user._id).select("customerLeadCredits role");
  
  let leads = [];
  if (["agent", "broker"].includes(req.user.role)) {
    leads = await Lead.find({ "brokerAssignments.brokerId": req.user._id })
      .populate("propertyId", "title price location")
      .populate("userId", "name email phone")
      .sort("-createdAt");
  } else {
    leads = await Lead.find({ ownerId: req.user._id })
      .populate("propertyId", "title price location")
      .populate("userId", "name email phone")
      .sort("-createdAt");
  }

  const items = leads.map(l => {
    const isUnlocked = l.isUnlockedByOwner || (l.brokerAssignments.some(ba => String(ba.brokerId) === String(req.user._id) && ba.purchasedAt));
    return {
      ...l.toObject(),
      contactInfo: isUnlocked ? l.contactInfo : { name: l.contactInfo?.name, phone: "Masked", email: "Masked" },
      isUnlockedByOwner: isUnlocked
    };
  });

  return res.json({ items, customerLeadCredits: user.customerLeadCredits || 0 });
};

const brokerMarketplace = async (req, res) => {
  if (!["agent", "broker"].includes(req.user.role)) {
    return res.status(403).json({ message: "Only brokers/agents can access marketplace" });
  }

  const items = await Lead.find({
    "brokerAssignments.brokerId": { $ne: req.user._id },
  })
    .populate("propertyId", "title price location")
    .populate("userId", "name")
    .sort("-createdAt")
    .limit(50);

  return res.json({ items });
};

const purchaseLead = async (req, res) => {
  if (!["agent", "broker"].includes(req.user.role)) {
    return res.status(403).json({ message: "Only brokers/agents can purchase leads" });
  }

  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: "Lead not found" });

  const user = await User.findById(req.user._id);
  if ((user.leadCredits || 0) <= 0 && (user.activePlan?.leadCredits || 0) <= 0) {
    return res.status(402).json({ message: "No lead credits available. Buy a broker lead plan." });
  }

  const already = lead.brokerAssignments.some((a) => String(a.brokerId) === String(req.user._id) && a.purchasedAt);
  if (already) return res.status(409).json({ message: "Lead already purchased" });

  if ((user.activePlan?.leadCredits || 0) > 0) {
    user.activePlan.leadCredits -= 1;
  } else {
    user.leadCredits -= 1;
  }
  await user.save();

  lead.brokerAssignments.push({
    brokerId: req.user._id,
    purchasedAt: new Date(),
    status: "new",
  });
  await lead.save();

  return res.json({ message: "Lead purchased", lead });
};

const updateBrokerLeadStatus = async (req, res) => {
  if (!["agent", "broker"].includes(req.user.role)) {
    return res.status(403).json({ message: "Only brokers/agents can update lead status" });
  }

  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: "Lead not found" });

  const assignment = lead.brokerAssignments.find((a) => String(a.brokerId) === String(req.user._id));
  if (!assignment) return res.status(403).json({ message: "Lead not assigned to this broker" });

  const status = req.body.status;
  if (!["new", "contacted", "converted"].includes(status)) {
    return res.status(422).json({ message: "Invalid status" });
  }

  assignment.status = status;
  await lead.save();

  return res.json({ message: "Lead status updated", lead });
};

const updateLeadStatus = async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: "Lead not found" });

  if (String(lead.ownerId) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ message: "Only the property owner can approve/reject this request" });
  }

  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status: select approved or rejected" });
  }

  lead.status = status;
  await lead.save();

  return res.json({ message: `Lead ${status} successfully`, lead });
};

const checkMyLeadStatus = async (req, res) => {
  const lead = await Lead.findOne({
    userId: req.user._id,
    propertyId: req.params.propertyId,
  }).sort("-createdAt");

  return res.json({ lead });
};

const unlockInboxLead = async (req, res) => {
  const user = await User.findById(req.user._id);
  const lead = await Lead.findById(req.params.id);

  if (!lead) return res.status(404).json({ message: "Lead not found" });
  if (String(lead.ownerId) !== String(req.user._id)) return res.status(403).json({ message: "Not your lead" });
  if (lead.isUnlockedByOwner) return res.json({ message: "Already unlocked", lead });

  if ((user.customerLeadCredits || 0) <= 0) {
    return res.status(402).json({ message: "No lead credits available. Buy a lead pack (300rs for 5)." });
  }

  user.customerLeadCredits -= 1;
  await user.save();

  lead.isUnlockedByOwner = true;
  await lead.save();

  return res.json({ message: "Lead unlocked successfully", lead, remainingCredits: user.customerLeadCredits });
};

module.exports = {
  createLead,
  myLeads,
  brokerMarketplace,
  purchaseLead,
  updateBrokerLeadStatus,
  updateLeadStatus,
  checkMyLeadStatus,
  unlockInboxLead,
};
