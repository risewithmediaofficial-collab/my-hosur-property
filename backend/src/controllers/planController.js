const Plan = require("../models/Plan");
const User = require("../models/User");

const getPlans = async (req, res) => {
  const query = { isActive: true };
  if (req.query.category) query.category = req.query.category;
  if (req.query.targetRole) {
    const roleAliases = {
      buyer: ["buyer", "customer"],
      customer: ["customer", "buyer"],
    };
    const roles = roleAliases[req.query.targetRole] || [req.query.targetRole];
    query.$or = roles.flatMap((role) => [{ targetRole: role }, { targetRole: "all" }]);
  }
  const items = await Plan.find(query).sort({ price: 1 });
  res.json({ items });
};

const activateFreePlan = async (req, res, next) => {
  try {
    const { planName } = req.body;

    let plan = null;
    if (planName) {
      plan = await Plan.findOne({ name: planName, price: 0 });
    }
    if (!plan) {
      plan = await Plan.findOne({ price: 0, category: { $ne: "database_access" } });
    }

    if (!plan) {
      return res.status(404).json({ message: "Free plan not found." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + (plan.durationDays || 90));

    user.canPostProperty = true;
    user.freePost = {
      used: false,
      expiresAt,
    };
    user.activePlan = {
      planId: plan._id,
      expiresAt,
      listingLimit: plan.listingLimit || 3,
      listingsUsed: 0,
      isBoosted: plan.featuredBoost || false,
      contactUnlocks: plan.contactUnlocks || 30,
      leadCredits: plan.leadCredits || 0,
      boostDays: plan.boostDays || 0,
    };
    user.contactAccess = {
      monthlyLimit: Math.max(plan.contactUnlocks || 0, 3),
      usedCount: 0,
      resetAt: expiresAt,
      isPremium: false,
    };

    await user.save();

    return res.json({ success: true, message: "Free plan activated.", activePlan: user.activePlan, freePost: user.freePost });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlans,
  activateFreePlan,
};
