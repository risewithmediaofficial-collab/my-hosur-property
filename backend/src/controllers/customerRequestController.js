const crypto = require("crypto");
const { body } = require("express-validator");
const CustomerRequest = require("../models/CustomerRequest");
const LeadUnlock = require("../models/LeadUnlock");
const Notification = require("../models/Notification");
const Property = require("../models/Property");
const SystemSetting = require("../models/SystemSetting");
const User = require("../models/User");
const { hasRazorpayConfig, razorpay } = require("../config/razorpay");

const REQUEST_CATEGORIES = [
  "property_buy",
  "property_sell",
  "property_rent",
  "loan",
  "interior",
  "construction",
  "property_management",
  "home_office_services",
];

const PROPERTY_REQUEST_CATEGORIES = ["property_buy", "property_sell", "property_rent"];

const PROPERTY_TYPES = [
  "Plot",
  "Villa",
  "Independent House",
  "Flat",
  "Commercial Land",
  "Agricultural Land",
  "Home",
  "Office",
  "Apartment",
  "Warehouse",
  "Commercial Land & Building",
  "Empty Land",
  "Commercial",
  "House",
  "Land",
  "Industrial Shed",
];

const PROPERTY_MATCH_MAP = {
  Home: ["Home", "House", "Independent House", "Villa", "Apartment"],
  Apartment: ["Apartment", "Flat"],
  Villa: ["Villa"],
  "Independent House": ["Independent House", "House"],
  Plot: ["Plot", "Land"],
  "Commercial Land": ["Commercial Land", "Commercial"],
  "Agricultural Land": ["Agricultural Land", "Land"],
  Flat: ["Flat", "Apartment"],
  "Commercial Land & Building": ["Commercial Land & Building", "Commercial"],
  "Empty Land": ["Empty Land", "Land"],
  Commercial: ["Commercial", "Office"],
  Office: ["Office", "Commercial"],
  Warehouse: ["Warehouse"],
  Land: ["Land", "Plot", "Empty Land", "Agricultural Land"],
  "Industrial Shed": ["Industrial Shed", "Warehouse"],
};

const SERVICE_TYPE_OPTIONS = {
  loan: ["Home Loan", "Plot Loan", "Mortgage Loan", "Private Finance"],
  interior: ["Home Interior", "Office Interior"],
  construction: ["House Construction", "Office Construction", "Commercial Building", "Apartment", "Industry & Warehouse"],
  property_management: ["House & Office, Apartment, Industry Maintenance & AMC Service", "NRI Property Management Service", "Farm Management", "House Management", "Bungalow Management", "Agriculture Land Maintenance"],
  home_office_services: ["Home & Office Cleaning", "Home & Office Shifting (Packers & Movers)", "Home Appliance Service (TV, Fridge, Washing Machine Repair)", "Electrical & Plumbing Service", "Carpentry & Interior Work", "Pest Control Service", "Bathroom Cleaning (Toilet Acid Wash)", "Tank & Sump Cleaning", "Painting Work", "Sofa Cleaning", "Carpet Cleaning", "Land Scaping", "Garden Maintenance"],
};

const isPropertyRequest = (requestCategory) => PROPERTY_REQUEST_CATEGORIES.includes(requestCategory);

const getMatchingPropertyTypes = (propertyType) => PROPERTY_MATCH_MAP[propertyType] || [propertyType];

const getRequestTitle = (request) => {
  if (isPropertyRequest(request.requestCategory)) {
    return `${request.propertyType || "Property"} request`;
  }
  if (request.requestCategory === "loan") return "Loan request";
  if (request.requestCategory === "interior") return `${request.serviceType || "Interior"} interior request`;
  if (request.requestCategory === "construction") return `${request.serviceType || "Construction"} construction request`;
  return "Service request";
};

const getAdminNotificationMessage = (user, request) => {
  const locationText = `${request.location?.area || "Area"}, ${request.location?.city || "City"}`;

  if (isPropertyRequest(request.requestCategory)) {
    return `${user.name} submitted a ${request.requestCategory.replace("property_", "")} request for ${request.propertyType || "property"} in ${locationText}.`;
  }

  if (request.requestCategory === "loan") {
    return `${user.name} requested a loan consultation in ${locationText}.`;
  }

  return `${user.name} requested ${request.serviceType || request.requestCategory} service in ${locationText}.`;
};

const getPropertyNotificationMessage = (user, request) =>
  `${user.name} is looking for ${request.propertyType || "property"} in ${request.location.area}, ${request.location.city}.`;

const maskContactDetails = (requestInfo, isUnlocked) => ({
  ...requestInfo,
  contactDetails: isUnlocked ? requestInfo.contactDetails : { email: "Masked", phone: "Masked" },
  isContactUnlocked: isUnlocked,
});

exports.requestValidators = [
  body("location.city").trim().notEmpty().withMessage("City is required"),
  body("location.area").trim().notEmpty().withMessage("Area is required"),
  body("requestCategory").isIn(REQUEST_CATEGORIES).withMessage("Invalid request category"),
  body("propertyType")
    .optional({ nullable: true, checkFalsy: true })
    .isIn(PROPERTY_TYPES)
    .withMessage("Invalid property type"),
  body("serviceType")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Invalid service type"),
  body("budgetMin").optional({ nullable: true, checkFalsy: true }).isNumeric().withMessage("Invalid min budget"),
  body("budgetMax").optional({ nullable: true, checkFalsy: true }).isNumeric().withMessage("Invalid max budget"),
  body().custom((value) => {
    const requestCategory = value.requestCategory;

    if (isPropertyRequest(requestCategory) && !value.propertyType) {
      throw new Error("Property type is required for property requests");
    }

    if (requestCategory === "property_rent" && !["Home", "Office", "Apartment", "Warehouse", "Commercial Land & Building", "Empty Land"].includes(value.propertyType)) {
      throw new Error("Invalid rent property type");
    }

    if (["interior", "construction", "property_management", "home_office_services"].includes(requestCategory) && !value.serviceType) {
      throw new Error("Service type is required");
    }

    if (requestCategory === "loan" && value.serviceType && !SERVICE_TYPE_OPTIONS.loan.includes(value.serviceType)) {
      throw new Error("Invalid loan service type");
    }

    if (requestCategory === "interior" && value.serviceType && !SERVICE_TYPE_OPTIONS.interior.includes(value.serviceType)) {
      throw new Error("Invalid interior service type");
    }

    if (requestCategory === "construction" && value.serviceType && !SERVICE_TYPE_OPTIONS.construction.includes(value.serviceType)) {
      throw new Error("Invalid construction service type");
    }

    if (requestCategory === "property_management" && value.serviceType && !SERVICE_TYPE_OPTIONS.property_management.includes(value.serviceType)) {
      throw new Error("Invalid property management service type");
    }

    if (requestCategory === "home_office_services" && value.serviceType && !SERVICE_TYPE_OPTIONS.home_office_services.includes(value.serviceType)) {
      throw new Error("Invalid home & office service type");
    }

    return true;
  }),
];

exports.createCustomerRequest = async (req, res, next) => {
  try {
    const {
      location,
      budgetMin,
      budgetMax,
      requestCategory,
      propertyType,
      serviceType,
      additionalRequirements,
    } = req.body;

    const request = new CustomerRequest({
      customerId: req.user._id,
      customerName: req.user.name,
      contactDetails: { email: req.user.email, phone: req.user.phone },
      location,
      budgetMin: Number(budgetMin || 0),
      budgetMax: Number(budgetMax || 0),
      requestCategory,
      propertyType: propertyType || undefined,
      serviceType: serviceType || "",
      additionalRequirements,
    });

    await request.save();

    let matchedRecipients = 0;

    if (isPropertyRequest(requestCategory) && propertyType) {
      const propertyTypeOptions = getMatchingPropertyTypes(propertyType);
      const cityRegex = new RegExp(`^${String(location.city).trim()}$`, "i");
      const priceQuery = {};

      if (Number(budgetMin || 0) > 0) priceQuery.$gte = Number(budgetMin);
      if (Number(budgetMax || 0) > 0) priceQuery.$lte = Number(budgetMax);

      const matchingProperties = await Property.find({
        status: "approved",
        propertyType: { $in: propertyTypeOptions },
        ...(requestCategory === "property_rent" ? { listingType: "rent" } : { listingType: "sale" }),
        "location.city": cityRegex,
        ...(Object.keys(priceQuery).length ? { price: priceQuery } : {}),
      })
        .select("ownerId")
        .lean();

      const recipientIds = [...new Set(matchingProperties.map((item) => String(item.ownerId)).filter(Boolean))];
      matchedRecipients = recipientIds.length;

      if (recipientIds.length) {
        await Notification.insertMany(
          recipientIds.map((recipientId) => ({
            recipientId,
            senderId: req.user._id,
            type: "customer_request",
            title: "New Customer Requirement",
            message: getPropertyNotificationMessage(req.user, request),
            payload: {
              customerRequestId: request._id,
              requestCategory,
              propertyType,
              city: location.city,
              area: location.area,
              budgetMin: Number(budgetMin || 0),
              budgetMax: Number(budgetMax || 0),
            },
          }))
        );
      }
    }

    const admins = await User.find({ role: "admin", status: "active" }).select("_id").lean();
    if (admins.length) {
      await Notification.insertMany(
        admins.map((admin) => ({
          recipientId: admin._id,
          senderId: req.user._id,
          type: "admin_service_request",
          title: getRequestTitle(request),
          message: getAdminNotificationMessage(req.user, request),
          payload: {
            customerRequestId: request._id,
            requestCategory,
            propertyType: propertyType || "",
            serviceType: serviceType || "",
            city: location.city,
            area: location.area,
          },
        }))
      );
    }

    res.status(201).json({
      message: isPropertyRequest(requestCategory)
        ? "Requirement submitted and shared with matching owners while also notifying admin."
        : "Service request submitted successfully. Our admin team will contact you soon.",
      item: request,
      matchedRecipients,
    });
  } catch (error) {
    next(error);
  }
};

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

exports.listForAgents = async (req, res, next) => {
  try {
    if (!["agent", "broker"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only agents/brokers can view these requests" });
    }

    const user = await User.findById(req.user._id).select("customerLeadCredits");
    const filter = { requestCategory: { $in: PROPERTY_REQUEST_CATEGORIES } };

    if (req.query.city) {
      filter["location.city"] = new RegExp(req.query.city, "i");
    }

    const requests = await CustomerRequest.find(filter).sort({ createdAt: -1 }).lean();
    const unlocks = await LeadUnlock.find({ agentId: req.user._id, status: "paid" }).lean();
    const unlockedIds = unlocks.map((item) => String(item.customerRequestId));

    res.json({
      items: requests.map((item) => maskContactDetails(item, unlockedIds.includes(String(item._id)))),
      customerLeadCredits: user?.customerLeadCredits || 0,
    });
  } catch (error) {
    next(error);
  }
};

exports.sendMatchNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await CustomerRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Not found" });

    if (!isPropertyRequest(request.requestCategory)) {
      return res.status(400).json({ message: "This request is handled directly by admin" });
    }

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
      message: `${req.user.name} has responded to your ${request.propertyType || "property"} request in ${request.location.area}, ${request.location.city}.`,
      type: "match",
      payload: {
        customerRequestId: request._id,
        requestCategory: request.requestCategory,
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

exports.unlockLeadIntent = async (req, res, next) => {
  try {
    if (!["agent", "broker"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only agents/brokers can access these leads" });
    }

    const { id } = req.params;
    const request = await CustomerRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Not found" });
    if (!isPropertyRequest(request.requestCategory)) {
      return res.status(400).json({ message: "Only property requirements can be unlocked" });
    }

    const existing = await LeadUnlock.findOne({ agentId: req.user._id, customerRequestId: id, status: "paid" });
    if (existing) {
      return res.status(400).json({ message: "Lead already unlocked" });
    }

    const user = await User.findById(req.user._id);

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
        contactDetails: request.contactDetails,
      });
    }

    const setting = await SystemSetting.findOne({ key: "lead_unlock_price" });
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
      transactionRef,
      gateway,
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

exports.createLeadPackIntent = async (req, res, next) => {
  try {
    const packPrice = 300;
    const order = await razorpay.orders.create({
      amount: Math.round(packPrice * 100),
      currency: "INR",
      receipt: `pack_${req.user._id}_${Date.now()}`.slice(0, 40),
      notes: { agentId: String(req.user._id), type: "lead_pack" },
    });

    res.json({
      orderId: order.id,
      amount: packPrice * 100,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
};

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

    await User.findByIdAndUpdate(req.user._id, { $inc: { customerLeadCredits: 5 } });

    res.json({ message: "Lead pack purchased successfully (5 credits added)" });
  } catch (error) {
    next(error);
  }
};

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
