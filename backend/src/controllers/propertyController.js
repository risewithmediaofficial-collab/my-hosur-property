const { body } = require("express-validator");
const Property = require("../models/Property");
const User = require("../models/User");
const cache = require("../config/cache");
const buildPagination = require("../utils/paginate");
const sendEmail = require("../utils/sendEmail");
const {
  newPropertyEmail,
  inquiryConfirmationEmail,
  adminPropertyNotificationEmail,
} = require("../utils/emailTemplates");
const { normalizeUploadList } = require("../utils/uploadPaths");

const propertyValidators = [
  body("title").trim().notEmpty(),
  body("description").trim().isLength({ min: 10 }),
  body("price").isNumeric(),
  body("propertyType").isIn(["Apartment", "Villa", "Independent House", "Plot", "Commercial"]),
  body("listingType").optional().isIn(["sale", "rent", "new-project"]),
  body("furnishingStatus").optional().isIn(["Furnished", "Semi-Furnished", "Unfurnished"]),
  body("listingSource").optional().isIn(["owner", "builder", "agent"]),
  body("possessionStatus").optional().isIn(["Ready to Move", "Under Construction"]),
  body("areaUnit").optional().isIn(["sqft", "sqm"]),
  body("location.city").trim().notEmpty(),
  body("location.area").trim().notEmpty(),
];

const hasActivePlan = (user) => {
  const plan = user?.activePlan;
  if (!plan?.expiresAt) return false;
  return new Date(plan.expiresAt) >= new Date();
};

const buildQuery = (q, user = {}) => {
  const query = { status: q.status || "approved" };

  if (q.search) {
    query.$text = { $search: q.search };
  }

  if (q.ownerId) {
    query.ownerId = q.ownerId;
  }

  if (q.intent === "buy") query.listingType = "sale";
  if (q.intent === "rent") query.listingType = "rent";
  if (q.intent === "new-project") query.listingType = "new-project";

  if (q.city) query["location.city"] = new RegExp(q.city, "i");
  if (q.area) query["location.area"] = new RegExp(q.area, "i");
  if (q.propertyType) query.propertyType = q.propertyType;
  if (q.listingType) query.listingType = q.listingType;
  if (q.furnishingStatus) query.furnishingStatus = q.furnishingStatus;
  if (q.listingSource) query.listingSource = q.listingSource;
  if (q.possessionStatus) query.possessionStatus = q.possessionStatus;
  if (q.verified === "true") query["verification.isVerified"] = true;
  if (q.bhk) query.bhk = Number(q.bhk);
  if (q.minBhk || q.maxBhk) {
    query.bhk = {};
    if (q.minBhk) query.bhk.$gte = Number(q.minBhk);
    if (q.maxBhk) query.bhk.$lte = Number(q.maxBhk);
  }

  if (q.minPrice || q.maxPrice) {
    query.price = {};
    if (q.minPrice) query.price.$gte = Number(q.minPrice);
    if (q.maxPrice) query.price.$lte = Number(q.maxPrice);
  }

  if (q.amenities) {
    const values = Array.isArray(q.amenities) ? q.amenities : String(q.amenities).split(",");
    query.amenities = { $all: values.map((x) => x.trim()).filter(Boolean) };
  }

  return query;
};

const calculateRankScore = (item, user, query) => {
  const now = Date.now();
  const ageDays = Math.max((now - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24), 0);
  const freshnessScore = Math.max(30 - ageDays, 0);
  const engagementScore = (item.viewCount || 0) * 0.05 + (item.inquiryCount || 0) * 0.15;
  const promoScore = (item.promotionalScore || 0) + (item.featuredUntil && new Date(item.featuredUntil) > new Date() ? 25 : 0);
  const textScore = query.search ? 20 : 0;
  const verificationScore = item.verification?.isVerified ? 12 : 0;

  let behaviorScore = 0;
  if (user?.recentSearches?.length) {
    const recent = user.recentSearches.slice(-5);
    for (const search of recent) {
      if (search.city && String(item.location?.city || "").toLowerCase() === String(search.city).toLowerCase()) {
        behaviorScore += 6;
      }
      if (search.propertyType && search.propertyType === item.propertyType) {
        behaviorScore += 4;
      }
      if (search.listingType && search.listingType === item.listingType) {
        behaviorScore += 2;
      }
    }
  }

  return textScore + freshnessScore + engagementScore + promoScore + behaviorScore + verificationScore;
};

const listProperties = async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query.page, req.query.limit);
  const sortKey = req.query.sort || "rank";
  const cacheKey = req.user?._id ? null : `properties:${JSON.stringify(req.query)}`;

  if (cacheKey) {
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
  }

  const query = buildQuery(req.query);
  const itemsRaw = await Property.find(query).populate("ownerId", "name email phone role");

  const itemsWithRank = itemsRaw.map((item) => ({
    ...item.toObject(),
    rankScore: calculateRankScore(item, req.user, req.query),
  }));

  const sorted = [...itemsWithRank].sort((a, b) => {
    if (sortKey === "price") return a.price - b.price;
    if (sortKey === "-price") return b.price - a.price;
    if (sortKey === "-createdAt") return new Date(b.createdAt) - new Date(a.createdAt);
    return b.rankScore - a.rankScore;
  });

  const total = sorted.length;
  const items = sorted.slice(skip, skip + limit);

  if (req.user && (req.query.city || req.query.propertyType || req.query.listingType)) {
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        recentSearches: {
          $each: [
            {
              city: req.query.city,
              propertyType: req.query.propertyType,
              listingType: req.query.listingType,
              searchedAt: new Date(),
            },
          ],
          $slice: -20,
        },
      },
    });
  }

  const payload = {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };

  if (cacheKey) {
    cache.set(cacheKey, payload);
  }
  return res.json(payload);
};

const getPropertyById = async (req, res) => {
  try {
    console.log("Fetching property with ID:", req.params.id);
    const property = await Property.findById(req.params.id).populate("ownerId", "name email phone role");
    
    if (!property) {
      console.log("Property not found:", req.params.id);
      return res.status(404).json({ message: "Property not found" });
    }

    console.log("Property found:", property._id);
    
    await Property.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    const similar = await Property.find({
      _id: { $ne: property._id },
      status: "approved",
      propertyType: property.propertyType,
      "location.city": property.location.city,
    })
      .sort("-createdAt")
      .limit(4);

    const localityInsights = property.localityInsights || {
      rating: 4.1,
      connectivity: 4.0,
      safety: 3.9,
      livability: 4.2,
      notes: "Balanced locality with schools, transit, and daily services.",
    };

    const responseData = { property, similar, localityInsights, accessRestricted: false };
    console.log("Sending response:", responseData);
    return res.json(responseData);
  } catch (error) {
    console.error("Error in getPropertyById:", error);
    return res.status(500).json({ message: "Error fetching property", error: error.message });
  }
};

const createProperty = async (req, res) => {
  const user = await User.findById(req.user._id);
  const hasRolePostingAccess = ["seller", "agent", "broker", "builder", "admin"].includes(user.role);
  if (!hasRolePostingAccess && !user.canPostProperty) {
    return res.status(403).json({ message: "Property posting is not enabled for this account. Enable it during registration." });
  }

  const plan = user.activePlan;
  if (!plan || !plan.expiresAt || new Date(plan.expiresAt) < new Date()) {
    return res.status(402).json({ message: "Active listing plan required before posting" });
  }
  if ((plan.listingsUsed || 0) >= (plan.listingLimit || 0)) {
    return res.status(402).json({ message: "Listing limit reached. Upgrade your plan." });
  }

  const ownerType = ["agent", "broker", "builder"].includes(req.user.role) ? req.user.role : "seller";
  const defaultSource = ownerType === "seller" ? "owner" : ownerType === "builder" ? "builder" : "agent";
  const boostDays = Math.max(user?.activePlan?.boostDays || 0, 3);
  const featuredUntil = new Date();
  featuredUntil.setDate(featuredUntil.getDate() + boostDays);

  const payload = {
    ...req.body,
    images: normalizeUploadList(req.body.images),
    documents: normalizeUploadList(req.body.documents),
    ownerId: req.user._id,
    ownerType,
    listingSource: req.body.listingSource || defaultSource,
    featuredUntil,
    promotionalScore: Math.max(req.body?.promotionalScore || 0, 10),
    verification:
      req.user.role === "admin"
        ? {
            isVerified: true,
            reraId: req.body?.verification?.reraId || req.body?.reraId,
            lastVerifiedAt: new Date(),
          }
        : {
            isVerified: false,
            reraId: req.body?.verification?.reraId || req.body?.reraId,
          },
    status: "approved",
  };

  const property = await Property.create(payload);

  await User.findByIdAndUpdate(req.user._id, {
    $inc: { "activePlan.listingsUsed": 1 },
  });

  // Send Confirmation Email to Owner
  try {
    const ownerEmailHtml = require("../utils/emailTemplates").baseEmailLayout(
      `
      <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;color:#1E293B;">
        Property Published Successfully! ✓
      </h2>
      <div style="width:40px;height:3px;background:#2563EB;border-radius:2px;margin:12px 0 20px;"></div>
      
      <p style="margin:0 0 16px;color:#64748B;line-height:1.7;">
        Congratulations ${user.name}! Your property <strong>"${property.title}"</strong> is now live on MyHosurProperty.
      </p>

      <div style="background:#EFF6FF;padding:16px;border-radius:8px;margin:20px 0;border-left:4px solid #2563EB;">
        <p style="margin:0;color:#1E293B;font-weight:600;">📝 Property Details</p>
        <p style="margin:8px 0 0;color:#64748B;font-size:13px;">
          Type: ${property.propertyType} | Listing: ${property.listingType} | Status: Live
        </p>
      </div>

      <p style="margin:16px 0;color:#64748B;">
        Your property is being promoted to potential buyers and tenants. Keep track of inquiries and responses in your dashboard.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr>
          <td align="center">
            <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard/properties"
               style="display:inline-block;background:linear-gradient(135deg,#2563EB 0%,#1D4ED8 100%);color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;padding:12px 36px;border-radius:8px;box-shadow:0 4px 14px rgba(37,99,235,0.35);">
              View Your Property
            </a>
          </td>
        </tr>
      </table>
      `,
      "✓ Property Live"
    );

    await sendEmail({
      to: user.email,
      subject: `✓ Your property "${property.title}" is now live on MyHosurProperty!`,
      html: ownerEmailHtml,
    });
    console.log(`[createProperty] Confirmation email sent to ${user.email}`);
  } catch (err) {
    console.error("[createProperty] Owner notification failed:", err.message);
  }

  try {
    const adminEmails = (await User.find({ role: "admin" }).select("email")).map((a) => a.email);
    if (adminEmails.length > 0) {
      const adminNotifHtml = adminPropertyNotificationEmail(property, user);
      await sendEmail({
        to: adminEmails[0],
        subject: `[LIVE] New Property: ${property.title}`,
        html: adminNotifHtml,
        bcc: adminEmails.slice(1),
      });
      console.log("[createProperty] Admin notification sent to admins");
    }
  } catch (err) {
    console.error("[createProperty] Admin notification failed:", err.message);
  }

  // Notify Relevant Buyers About New Property (async, non-blocking)
  try {
    const relevantBuyers = await User.find({
      role: "buyer",
      "recentSearches": {
        $elemMatch: {
          city: property.location?.city,
        },
      },
    }).limit(50);

    if (relevantBuyers.length > 0) {
      for (const buyer of relevantBuyers) {
        try {
          const buyerEmailHtml = newPropertyEmail(buyer, property, 0);
          await sendEmail({
            to: buyer.email,
            subject: `🏠 New ${property.propertyType} Available in ${property.location?.city}!`,
            html: buyerEmailHtml,
          });
        } catch (e) {
          console.error(`Failed to send new property notification to ${buyer.email}:`, e.message);
        }
      }
    }
  } catch (err) {
    console.error("[createProperty] Buyer notifications failed:", err.message);
  }

  cache.flushAll();
  return res.status(201).json({
    ...property.toObject(),
    message: "Property published successfully and is now live on home/listings",
  });
};

const updateProperty = async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ message: "Property not found" });

  const canEdit = req.user.role === "admin" || String(property.ownerId) === String(req.user._id);
  if (!canEdit) return res.status(403).json({ message: "Forbidden" });

  Object.assign(property, {
    ...req.body,
    images: normalizeUploadList(req.body.images),
    documents: normalizeUploadList(req.body.documents),
  });
  property.status = "approved";
  await property.save();

  cache.flushAll();
  return res.json(property);
};

const deleteProperty = async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ message: "Property not found" });

  const canDelete = req.user.role === "admin" || String(property.ownerId) === String(req.user._id);
  if (!canDelete) return res.status(403).json({ message: "Forbidden" });

  await property.deleteOne();
  cache.flushAll();
  return res.json({ message: "Property deleted" });
};

const featured = async (req, res) => {
  const now = new Date();

  let items = await Property.find({
    status: "approved",
    featuredUntil: { $gt: now },
  })
    .populate("ownerId", "name role")
    .sort({ featuredUntil: -1, promotionalScore: -1, createdAt: -1 })
    .limit(8);

  // Fall back to the latest approved inventory when no active boosts exist.
  if (!items.length) {
    items = await Property.find({ status: "approved" })
      .populate("ownerId", "name role")
      .sort({ promotionalScore: -1, createdAt: -1 })
      .limit(8);
  }

  res.json({ items });
};

const myProperties = async (req, res) => {
  const items = await Property.find({ ownerId: req.user._id }).sort("-createdAt");
  res.json({ items });
};

const promoteProperty = async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ message: "Property not found" });

  const canPromote = req.user.role === "admin" || String(property.ownerId) === String(req.user._id);
  if (!canPromote) return res.status(403).json({ message: "Forbidden" });

  const user = await User.findById(req.user._id);
  const boostDays = Math.max(user?.activePlan?.boostDays || 7, 3);
  const until = new Date();
  until.setDate(until.getDate() + boostDays);

  property.featuredUntil = until;
  property.promotionalScore = (property.promotionalScore || 0) + 20;
  await property.save();

  cache.flushAll();
  return res.json({ message: "Listing boosted successfully", featuredUntil: property.featuredUntil });
};

const uploadAssets = async (req, res) => {
  const files = req.files || [];
  if (!files.length) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  const urls = files.map((file) => `/uploads/${file.filename}`);

  const images = urls.filter((url) => /\.(png|jpg|jpeg|webp)$/i.test(url));
  const documents = urls.filter((url) => /\.(pdf|doc|docx)$/i.test(url));

  return res.status(201).json({
    message: "Files uploaded successfully",
    urls,
    images,
    documents,
  });
};

module.exports = {
  propertyValidators,
  listProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  featured,
  myProperties,
  promoteProperty,
  uploadAssets,
};
