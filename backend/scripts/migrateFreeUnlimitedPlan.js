const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const User = require("../src/models/User");

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

async function migrate() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME || "myhosurproperty";
  console.log(`[migration] Connecting to MongoDB (${dbName})...`);
  await mongoose.connect(uri, { dbName });
  console.log(`[migration] Connected to database: ${mongoose.connection.name}`);

  const users = await User.find({});
  console.log(`[migration] Found ${users.length} total users.`);

  let updatedCount = 0;
  const targetExpiry = addDays(new Date(), 180);

  for (const user of users) {
    // Preserve custom paid plans if any
    const isPaidPlan = Boolean(user.activePlan?.planId);
    if (!isPaidPlan) {
      user.canPostProperty = true;
      user.freePost = {
        used: false,
        expiresAt: targetExpiry,
      };
      user.activePlan = {
        planId: null,
        expiresAt: targetExpiry,
        listingLimit: 99999,
        listingsUsed: user.activePlan?.listingsUsed || 0,
        isBoosted: false,
        contactUnlocks: Math.max(user.activePlan?.contactUnlocks || 0, 30),
        leadCredits: user.activePlan?.leadCredits || 0,
        boostDays: 0,
      };
      user.contactAccess = {
        monthlyLimit: Math.max(user.contactAccess?.monthlyLimit || 0, 30),
        usedCount: user.contactAccess?.usedCount || 0,
        resetAt: targetExpiry,
        isPremium: false,
      };
      await user.save();
      updatedCount++;
    }
  }

  console.log(`[migration] Successfully updated ${updatedCount} users to 6 months free with unlimited posts!`);

  // Verify alluring user specifically
  const alluring = await User.findOne({ email: "alluringrealtysupport@gmail.com" });
  if (alluring) {
    console.log("[migration] Verified Alluring user:", {
      _id: alluring._id,
      email: alluring.email,
      name: alluring.name,
      role: alluring.role,
      canPostProperty: alluring.canPostProperty,
      activePlan: alluring.activePlan,
      freePost: alluring.freePost,
    });
  } else {
    console.warn("[migration] Alluring user not found!");
  }

  await mongoose.disconnect();
  console.log("[migration] Completed successfully.");
}

migrate().catch((err) => {
  console.error("[migration] Error:", err);
  process.exit(1);
});
