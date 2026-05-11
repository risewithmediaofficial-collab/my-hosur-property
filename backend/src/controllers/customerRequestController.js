const CustomerRequest = require("../models/CustomerRequest");
const User = require("../models/User");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");
const Property = require("../models/Property");
const { body } = require("express-validator");
const crypto = require("crypto");
const LeadUnlock = require("../models/LeadUnlock");
const SystemSetting = require("../models/SystemSetting");
const { hasRazorpayConfig, razorpay } = require("../config/razorpay");

const CUSTOMER_PROPERTY_TYPES = ["Apartment", "Villa", "Independent House", "Plot", "Commercial", "House"];

const getMatchingPropertyTypes = (propertyType) => {
  const map = {
    House: ["Independent House", "Villa", "Apartment"],
    Apartment: ["Apartment"],
    Villa: ["Villa"],
    "Independent House": ["Independent House"],
    Plot: ["Plot"],
    Commercial: ["Commercial"],
  };

  return map[propertyType] || [propertyType];
};

// Validation middleware
exports.requestValidators = [
  body("location.city").trim().notEmpty().withMessage("City is required"),
  body("location.area").trim().notEmpty().withMessage("Area is required"),
  body("budgetMax").isNumeric().withMessage("Max budget is required"),
  body("propertyType").isIn(CUSTOMER_PROPERTY_TYPES).withMessage("Invalid property type"),
];

// 1. Create Request
exports.createCustomerRequest = async (req, res, next) => {
  try {
    const { location, budgetMin, budgetMax, propertyType, additionalRequirements } = req.body;
    const request = new CustomerRequest({
      customerId: req.user._id,
      customerName: req.user.name,
      contactDetails: { email: req.user.email, phone: req.user.phone },
      location,
      budgetMin,
      budgetMax,
      propertyType,
      additionalRequirements,
    });
    await request.save();

    const propertyTypeOptions = getMatchingPropertyTypes(propertyType);
    const cityRegex = new RegExp(`^${String(location.city).trim()}$`, "i");
    const matchingProperties = await Property.find({
      status: "approved",
      propertyType: { $in: propertyTypeOptions },
      "location.city": cityRegex,
      ...(budgetMax ? { price: { ...(budgetMin ? { $gte: budgetMin } : {}), $lte: budgetMax } } : {}),
    })
      .select("ownerId title propertyType location price")
      .lean();

    const recipientIds = [...new Set(matchingProperties.map((item) => String(item.ownerId)).filter(Boolean))];

    if (recipientIds.length > 0) {
      await Notification.insertMany(
        recipientIds.map((recipientId) => ({
          recipientId,
          senderId: req.user._id,
          type: "customer_request",
          title: "New Customer Requirement",
          message: `${req.user.name} is looking for a ${propertyType} in ${location.area}, ${location.city}.`,
          payload: {
            customerRequestId: request._id,
            propertyType,
            city: location.city,
            area: location.area,
            budgetMin,
            budgetMax,
          },
        }))
      );
    }

    res.status(201).json({
      message: "Requirement posted and shared with matching property owners/agents",
      item: request,
      matchedRecipients: recipientIds.length,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Fetch My Requests (for customers)
exports.myCustomerRequests = async (req, res, next) => {
  try {
    const requests = await CustomerRequest.find({ customerId: req.user._id })
      .populate("matchedAgents", "name email phone role")
      .sort({ createdAt: -1 });
    res.json({ items: requests });
  } catch (error) {
    next(error);
  }
};

// 3. List for Agents (with masked contact)
exports.listForAgents = async (req, res, next) => {
  try {
    // Only Agents/Brokers
    if (!["agent", "broker"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only agents/brokers can view these requests" });
    }

    const city = req.query.city;
    const filter = {};
    if (city) filter["location.city"] = new RegExp(city, "i");

    const requests = await CustomerRequest.find(filter).sort({ createdAt: -1 }).lean();

    const agentIdStr = String(req.user._id);

    // Fetch unlocks to see which ones this agent paid for
    const unlocks = await LeadUnlock.find({
      agentId: req.user._id,
      status: "paid",
    }).lean();

    const unlockedIds = unlocks.map((u) => String(u.customerRequestId));

    const finalResponse = requests.map((reqInfo) => {
      const isUnlocked = unlockedIds.includes(String(reqInfo._id));

      return {
        ...reqInfo,
        contactDetails: isUnlocked ? reqInfo.contactDetails : { email: "Masked", phone: "Masked" },
        isContactUnlocked: isUnlocked,
      };
    });

    let setting = await SystemSetting.findOne({ key: "lead_unlock_price" });
    const price = setting ? Number(setting.value) : 200;

    res.json({ items: finalResponse, leadUnlockPrice: price });
  } catch (error) {
    next(error);
  }
};

// 4. Send Match Notification
exports.sendMatchNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await CustomerRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Not found" });

    const alreadyMatched = request.matchedAgents.some((agentId) => String(agentId) === String(req.user._id));
    if (!alreadyMatched) {
      request.matchedAgents.push(req.user._id);
    }
    request.status = "matched";
    await request.save();

    await Notification.create({
      recipientId: request.customerId,
      senderId: req.user._id,
      title: "Property Match Received",
      message: `${req.user.name} has responded to your ${request.propertyType} requirement in ${request.location.area}, ${request.location.city}.`,
      type: "match",
      payload: {
        customerRequestId: request._id,
        propertyType: request.propertyType,
        city: request.location?.city,
        area: request.location?.area,
      },
    });

    res.json({ message: "Customer notified", item: request });
  } catch (error) {
    next(error);
  }
};

// 5. Unlock Lead Intent (Uses credits OR initiates Razorpay for single lead)
exports.unlockLeadIntent = async (req, res, next) => {
  try {
    if (!["agent", "broker"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only agents/brokers can access these leads" });
    }

    const { id } = req.params;
    const request = await CustomerRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Not found" });

    // Check if already unlocked via LeadUnlock record
    const existing = await LeadUnlock.findOne({ agentId: req.user._id, customerRequestId: id, status: "paid" });
    if (existing) {
      return res.status(400).json({ message: "Lead already unlocked" });
    }

    const user = await User.findById(req.user._id);

    // OPTION A: Use Credit Balance (Instant Unlock)
    if ((user.customerLeadCredits || 0) > 0) {
      const unlock = new LeadUnlock({
        agentId: req.user._id,
        customerId: request.customerId,
        customerRequestId: request._id,
        amount: 0,
        status: "paid",
        gateway: "credits",
      });
      await unlock.save();

      user.customerLeadCredits -= 1;
      await user.save();

      return res.json({ 
        message: "Lead unlocked using credits", 
        isUnlocked: true, 
        remainingCredits: user.customerLeadCredits,
        contactDetails: request.contactDetails
      });
    }

    // OPTION B: Single Lead Unlock via Razorpay (Current behavior)
    let setting = await SystemSetting.findOne({ key: "lead_unlock_price" });
    const priceAmount = setting ? Number(setting.value) : 200;

    let transactionRef = `sim_${crypto.randomUUID()}`;
    let gateway = "simulated";
    let razorpayPayload = null;

    if (hasRazorpayConfig && priceAmount > 0) {
      const order = await razorpay.orders.create({
        amount: Math.round(priceAmount * 100),
        currency: "INR",
        receipt: `unlock_${id}_${Date.now()}`.slice(0, 40),
      });
      transactionRef = order.id;
      gateway = "razorpay";
      razorpayPayload = {
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: order.id,
        amount: Math.round(priceAmount * 100),
        currency: "INR",
      };
    }

    const unlock = new LeadUnlock({
      agentId: req.user._id,
      customerId: request.customerId,
      customerRequestId: request._id,
      amount: priceAmount,
      status: "created",
      transactionRef: transactionRef,
      gateway: gateway,
    });
    await unlock.save();

    res.status(201).json({
      message: "Intent created",
      unlockId: unlock._id,
      razorpay: razorpayPayload,
    });
  } catch (error) {
    next(error);
  }
};

// 6. NEW: Create Lead Pack Intent (300rs for 5 credits)
exports.createLeadPackIntent = async (req, res, next) => {
  try {
    const packPrice = 300;
    const order = await razorpay.orders.create({
      amount: Math.round(packPrice * 100),
      currency: "INR",
      receipt: `pack_${req.user._id}_${Date.now()}`.slice(0, 40),
      notes: { agentId: String(req.user._id), type: "lead_pack" }
    });

    res.json({
      orderId: order.id,
      amount: packPrice * 100,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    next(error);
  }
};

// 7. NEW: Verify Lead Pack Payment
exports.verifyLeadPackPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Signature verification failed" });
    }

    // Add 5 credits to user
    await User.findByIdAndUpdate(req.user._id, { $inc: { customerLeadCredits: 5 } });

    res.json({ message: "Lead pack purchased successfully (5 credits added)" });
  } catch (error) {
    next(error);
  }
};

// 8. Verify Single Lead Unlock Payment
exports.verifyLeadUnlock = async (req, res, next) => {
  try {
    const { unlockId, success, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const unlock = await LeadUnlock.findById(unlockId);
    if (!unlock) return res.status(404).json({ message: "Unlock record not found" });

    if (String(unlock.agentId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const hasRazorpayPayload = Boolean(razorpayOrderId && razorpayPaymentId && razorpaySignature);
    let paid = Boolean(success);

    if (hasRazorpayPayload && hasRazorpayConfig) {
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");
      paid = expectedSignature === razorpaySignature;
    }

    unlock.status = paid ? "paid" : "failed";
    await unlock.save();

    if (unlock.status === "paid") {
      const request = await CustomerRequest.findById(unlock.customerRequestId);
      return res.json({ message: "Payment verified. Contact unlocked.", contactDetails: request?.contactDetails });
    }

    return res.status(400).json({ message: "Payment failed or signature mismatch" });
  } catch (error) {
    next(error);
  }
};

// Modified listForAgents to show credits
exports.listForAgents = async (req, res, next) => {
  try {
    if (!["agent", "broker"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only agents/brokers can view these requests" });
    }

    const user = await User.findById(req.user._id).select("customerLeadCredits");
    const city = req.query.city;
    const filter = {};
    if (city) filter["location.city"] = new RegExp(city, "i");

    const requests = await CustomerRequest.find(filter).sort({ createdAt: -1 }).lean();

    const unlocks = await LeadUnlock.find({
      agentId: req.user._id,
      status: "paid",
    }).lean();

    const unlockedIds = unlocks.map((u) => String(u.customerRequestId));

    const finalResponse = requests.map((reqInfo) => {
      const isUnlocked = unlockedIds.includes(String(reqInfo._id));
      return {
        ...reqInfo,
        contactDetails: isUnlocked ? reqInfo.contactDetails : { email: "Masked", phone: "Masked" },
        isContactUnlocked: isUnlocked,
      };
    });

    res.json({ 
      items: finalResponse, 
      customerLeadCredits: user.customerLeadCredits || 0 
    });
  } catch (error) {
    next(error);
  }
};
