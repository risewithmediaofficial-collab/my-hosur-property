/**
 * WhatsApp Bot Controller
 *
 * Handles API requests from MSG91's chatbot API Node.
 * All endpoints are protected by botAuth middleware (x-bot-api-key header).
 *
 * USER IDENTITY: The WhatsApp customer is identified by their phone number
 * sent from MSG91. The backend matches this to an existing User document.
 * No userId from the request body is trusted directly.
 *
 * DATA ISOLATION: Each user can only access their own properties,
 * enquiries, and profile. Admin endpoints are NOT accessible here.
 */

const Property = require("../models/Property");
const User = require("../models/User");
const Lead = require("../models/Lead");
const WhatsAppSupportRequest = require("../models/WhatsAppSupportRequest");
const { normalizePhoneForWA } = require("../services/whatsapp/msg91WhatsApp.service");
const { logWhatsAppMessage } = require("../utils/whatsappLogger");

// ─── Constants ────────────────────────────────────────────────────────────────
const BOT_PROPERTY_SEARCH_LIMIT = 5;
const WEBSITE_URL = process.env.WEBSITE_URL || process.env.CLIENT_URL || "https://myhosurproperty.com";

// ─── Standard Response Helpers ────────────────────────────────────────────────
const ok = (res, data = {}, message = "Success") =>
  res.json({ success: true, message, ...data });

const fail = (res, status, message, code = "ERROR") =>
  res.status(status).json({ success: false, message, code });

// ─── Phone Resolver ───────────────────────────────────────────────────────────
/**
 * Resolve the WhatsApp sender's phone to an existing User document.
 * Tries all plausible stored variants of the phone number.
 *
 * @param {string} rawPhone - Phone number received from MSG91 bot
 * @returns {Promise<Object|null>} User document or null
 */
const resolveUserByPhone = async (rawPhone) => {
  if (!rawPhone) return null;

  const norm = normalizePhoneForWA(rawPhone); // 91XXXXXXXXXX
  const digits10 = norm.startsWith("91") ? norm.slice(2) : norm; // XXXXXXXXXX
  const withPlus = `+${norm}`; // +91XXXXXXXXXX

  return (
    (await User.findOne({ phone: norm })) ||
    (await User.findOne({ phone: digits10 })) ||
    (await User.findOne({ phone: withPlus })) ||
    null
  );
};

/**
 * Get phone from request (supports both query params and request body).
 */
const getPhone = (req) =>
  req.query.phone || req.body?.phone || req.body?.sender || "";

// ─── Endpoint: Property Search ─────────────────────────────────────────────────
/**
 * GET /api/whatsapp/bot/properties/search
 *
 * Search approved properties using filters that match existing Property model fields.
 * Returns compact, WhatsApp-friendly response (max 5 results).
 *
 * Query params: phone, city, area, propertyType, listingType, minPrice, maxPrice, bhk
 */
const searchProperties = async (req, res) => {
  try {
    const {
      city,
      area,
      propertyType,
      listingType,
      minPrice,
      maxPrice,
      bhk,
    } = req.query;

    // Build query — only use real Property model fields
    const query = { status: "approved" };

    if (city) {
      const cityRx = new RegExp(city, "i");
      query.$or = [
        { "location.city": cityRx },
        { "location.area": cityRx },
        { "location.district": cityRx },
        { "location.taluk": cityRx },
        { "location.village": cityRx },
      ];
    }

    if (area && !city) {
      query["location.area"] = new RegExp(area, "i");
    }

    if (propertyType) {
      const types = String(propertyType)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      query.propertyType = types.length > 1 ? { $in: types } : types[0];
    }

    if (listingType && ["sale", "rent", "new-project"].includes(listingType)) {
      query.listingType = listingType;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (bhk) {
      query.bhk = Number(bhk);
    }

    const properties = await Property.find(query)
      .select("title price propertyType listingType location bhk status")
      .sort({ promotionalScore: -1, createdAt: -1 })
      .limit(BOT_PROPERTY_SEARCH_LIMIT)
      .lean();

    const formattedProperties = properties.map((p) => ({
      id: p._id,
      title: p.title,
      type: p.propertyType,
      listingType: p.listingType,
      location: [p.location?.area, p.location?.city].filter(Boolean).join(", "),
      price: formatPrice(p.price),
      bhk: p.bhk || null,
      url: `${WEBSITE_URL}/property/${p._id}`,
    }));

    // Log bot event (no user lookup required for search)
    const phone = getPhone(req);
    if (phone) {
      setImmediate(() =>
        logWhatsAppMessage({
          phoneNumber: normalizePhoneForWA(phone),
          eventType: "BOT_PROPERTY_SEARCH",
          templateName: "",
          status: "sent",
          provider: "bot_api",
        }).catch(() => {})
      );
    }

    return ok(res, {
      count: formattedProperties.length,
      properties: formattedProperties,
    });
  } catch (err) {
    console.error("[bot] searchProperties error:", err.message);
    return fail(res, 500, "Failed to search properties.", "SEARCH_ERROR");
  }
};

// ─── Endpoint: My Properties ──────────────────────────────────────────────────
/**
 * GET /api/whatsapp/bot/my-properties
 *
 * Returns properties owned by the WhatsApp sender.
 * Phone must belong to a registered user.
 *
 * Query params: phone
 */
const getMyProperties = async (req, res) => {
  try {
    const phone = getPhone(req);
    const user = await resolveUserByPhone(phone);

    if (!user) {
      return fail(
        res,
        404,
        "No account found with this WhatsApp number. Please sign up on myhosurproperty.com first.",
        "USER_NOT_FOUND"
      );
    }

    const properties = await Property.find({ ownerId: user._id })
      .select("title price propertyType listingType status location createdAt")
      .sort("-createdAt")
      .lean();

    const formatted = properties.map((p) => ({
      id: p._id,
      title: p.title,
      type: p.propertyType,
      listingType: p.listingType,
      status: p.status,
      location: [p.location?.area, p.location?.city].filter(Boolean).join(", "),
      price: formatPrice(p.price),
      url: `${WEBSITE_URL}/property/${p._id}`,
    }));

    return ok(res, {
      count: formatted.length,
      properties: formatted,
    });
  } catch (err) {
    console.error("[bot] getMyProperties error:", err.message);
    return fail(res, 500, "Failed to fetch your properties.", "MY_PROPERTIES_ERROR");
  }
};

// ─── Endpoint: My Enquiries ───────────────────────────────────────────────────
/**
 * GET /api/whatsapp/bot/my-enquiries
 *
 * Returns leads (enquiries/callbacks) created by the WhatsApp sender.
 * Phone must belong to a registered user.
 *
 * Query params: phone
 */
const getMyEnquiries = async (req, res) => {
  try {
    const phone = getPhone(req);
    const user = await resolveUserByPhone(phone);

    if (!user) {
      return fail(
        res,
        404,
        "No account found with this WhatsApp number. Please sign up on myhosurproperty.com first.",
        "USER_NOT_FOUND"
      );
    }

    const leads = await Lead.find({ userId: user._id })
      .select("intentType status createdAt contactInfo")
      .populate("propertyId", "title location price")
      .sort("-createdAt")
      .limit(10)
      .lean();

    const formatted = leads.map((l) => ({
      id: l._id,
      type: l.intentType,
      status: l.status,
      property: l.propertyId
        ? {
            title: l.propertyId.title,
            location: [l.propertyId.location?.area, l.propertyId.location?.city]
              .filter(Boolean)
              .join(", "),
          }
        : null,
      createdAt: l.createdAt,
    }));

    return ok(res, {
      count: formatted.length,
      enquiries: formatted,
    });
  } catch (err) {
    console.error("[bot] getMyEnquiries error:", err.message);
    return fail(res, 500, "Failed to fetch your enquiries.", "MY_ENQUIRIES_ERROR");
  }
};

// ─── Endpoint: Profile ────────────────────────────────────────────────────────
/**
 * GET /api/whatsapp/bot/profile
 *
 * Returns sanitized profile for the WhatsApp sender.
 * Only non-sensitive fields are returned.
 *
 * Query params: phone
 */
const getProfile = async (req, res) => {
  try {
    const phone = getPhone(req);
    const user = await resolveUserByPhone(phone);

    if (!user) {
      return fail(
        res,
        404,
        "No account found with this WhatsApp number. Please sign up on myhosurproperty.com first.",
        "USER_NOT_FOUND"
      );
    }

    // Return only safe, non-sensitive fields
    return ok(res, {
      profile: {
        name: user.name,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified,
        canPostProperty: user.canPostProperty,
        planActive: Boolean(
          user.activePlan?.expiresAt && new Date(user.activePlan.expiresAt) > new Date()
        ),
        planExpiry: user.activePlan?.expiresAt || null,
        memberSince: user.createdAt,
      },
    });
  } catch (err) {
    console.error("[bot] getProfile error:", err.message);
    return fail(res, 500, "Failed to fetch your profile.", "PROFILE_ERROR");
  }
};

// ─── Endpoint: Submit Property via Bot ────────────────────────────────────────
/**
 * POST /api/whatsapp/bot/property
 *
 * Submit a basic property inquiry via WhatsApp bot.
 * Sets status to "pending" — admin must approve before it goes live.
 * Uses existing Property model field names exactly.
 *
 * Body: { phone, title, description, price, propertyType, listingType,
 *         location: { city, area, state, district, taluk, village }, bhk }
 */
const submitProperty = async (req, res) => {
  try {
    const phone = getPhone(req);
    const user = await resolveUserByPhone(phone);

    if (!user) {
      return fail(
        res,
        404,
        "No account found with this WhatsApp number. Please sign up on myhosurproperty.com first.",
        "USER_NOT_FOUND"
      );
    }

    // Basic required field validation
    const { title, description, price, propertyType, location } = req.body;

    if (!title || !description || !price || !propertyType) {
      return fail(
        res,
        400,
        "Required fields: title, description, price, propertyType",
        "MISSING_FIELDS"
      );
    }

    if (!location?.city || !location?.area) {
      return fail(
        res,
        400,
        "Location city and area are required.",
        "MISSING_LOCATION"
      );
    }

    const ownerType = ["agent", "broker", "builder"].includes(user.role)
      ? user.role
      : "seller";

    // Build property payload using REAL Property model fields only
    const propertyData = {
      title: String(title).trim(),
      description: String(description).trim(),
      price: Number(price),
      propertyType: String(propertyType).trim(),
      listingType: req.body.listingType || "sale",
      ownerId: user._id,
      ownerType,
      listingSource: ownerType === "seller" ? "owner" : ownerType === "builder" ? "builder" : "agent",
      status: "pending", // Always pending for bot submissions — admin reviews before publishing
      location: {
        country: location.country || "India",
        state: location.state || "Tamil Nadu",
        district: location.district || location.city,
        taluk: location.taluk || location.city,
        village: location.village || location.area,
        city: location.city,
        area: location.area,
        address: location.address || "",
      },
      listingContact: {
        name: user.name,
        phone: user.phone,
        email: user.email,
      },
    };

    // Optional fields
    if (req.body.bhk) propertyData.bhk = Number(req.body.bhk);
    if (req.body.bathrooms) propertyData.bathrooms = Number(req.body.bathrooms);
    if (req.body.carpetArea) propertyData.carpetArea = Number(req.body.carpetArea);
    if (req.body.facing) propertyData.facing = req.body.facing;
    if (req.body.furnishingStatus) propertyData.furnishingStatus = req.body.furnishingStatus;

    const property = await Property.create(propertyData);

    // Log bot property submission
    setImmediate(() =>
      logWhatsAppMessage({
        userId: String(user._id),
        phoneNumber: normalizePhoneForWA(phone),
        eventType: "BOT_PROPERTY_SUBMISSION",
        templateName: "",
        status: "sent",
        provider: "bot_api",
      }).catch(() => {})
    );

    return ok(
      res,
      {
        property: {
          id: property._id,
          title: property.title,
          status: property.status,
          message:
            "Property submitted successfully. Our team will review and approve it shortly.",
        },
      },
      "Property submitted for review."
    );
  } catch (err) {
    console.error("[bot] submitProperty error:", err.message);
    if (err.name === "ValidationError") {
      return fail(res, 400, `Validation error: ${err.message}`, "VALIDATION_ERROR");
    }
    return fail(res, 500, "Failed to submit property.", "SUBMIT_PROPERTY_ERROR");
  }
};

// ─── Endpoint: Support Request ─────────────────────────────────────────────────
/**
 * POST /api/whatsapp/bot/support
 *
 * Store a support request from the WhatsApp bot.
 *
 * Body: { phone, message, name }
 */
const submitSupportRequest = async (req, res) => {
  try {
    const phone = getPhone(req);
    const message = req.body.message || req.body.text || "";

    if (!phone) {
      return fail(res, 400, "Phone number is required.", "MISSING_PHONE");
    }

    if (!message || String(message).trim().length < 5) {
      return fail(res, 400, "Please provide a message (min 5 characters).", "MISSING_MESSAGE");
    }

    const normPhone = normalizePhoneForWA(phone);
    const user = await resolveUserByPhone(phone);

    const supportReq = await WhatsAppSupportRequest.create({
      phoneNumber: normPhone,
      userId: user?._id || null,
      name: req.body.name || user?.name || "",
      message: String(message).trim(),
      status: "open",
    });

    // Log bot event
    setImmediate(() =>
      logWhatsAppMessage({
        userId: user ? String(user._id) : null,
        phoneNumber: normPhone,
        eventType: "BOT_SUPPORT_REQUEST",
        templateName: "",
        status: "sent",
        provider: "bot_api",
      }).catch(() => {})
    );

    return ok(
      res,
      { requestId: supportReq._id },
      "Support request received! Our team will contact you shortly on WhatsApp."
    );
  } catch (err) {
    console.error("[bot] submitSupportRequest error:", err.message);
    return fail(res, 500, "Failed to submit support request.", "SUPPORT_ERROR");
  }
};

// ─── Price Formatter ──────────────────────────────────────────────────────────
const formatPrice = (price) => {
  if (!price && price !== 0) return "Price on request";
  const n = Number(price);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

module.exports = {
  searchProperties,
  getMyProperties,
  getMyEnquiries,
  getProfile,
  submitProperty,
  submitSupportRequest,
};
