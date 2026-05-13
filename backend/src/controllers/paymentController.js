const crypto = require("crypto");
const Payment = require("../models/Payment");
const Plan = require("../models/Plan");
const User = require("../models/User");
const { hasRazorpayConfig, razorpay } = require("../config/razorpay");

const isPlanActive = (activePlan) =>
  Boolean(activePlan?.expiresAt && new Date(activePlan.expiresAt) >= new Date());

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const activateUserPlan = async (payment) => {
  const plan = payment.planId;
  const user = await User.findById(payment.userId);
  if (!user) return;

  const currentPlan = user.activePlan?.toObject ? user.activePlan.toObject() : { ...(user.activePlan || {}) };
  const hasCurrentActivePlan = isPlanActive(currentPlan);
  const carryForwardListings = hasCurrentActivePlan
    ? Math.max((currentPlan.listingLimit || 0) - (currentPlan.listingsUsed || 0), 0)
    : 0;
  const carryForwardUnlocks = hasCurrentActivePlan ? Math.max(currentPlan.contactUnlocks || 0, 0) : 0;
  const carryForwardPlanLeadCredits = hasCurrentActivePlan ? Math.max(currentPlan.leadCredits || 0, 0) : 0;
  const planBaseDate = hasCurrentActivePlan ? new Date(currentPlan.expiresAt) : new Date();
  const expiresAt = addDays(planBaseDate, plan.durationDays);

  user.canPostProperty = true;

  if (plan.category === "database_access") {
    user.contactAccess = {
      monthlyLimit: Math.max((user.contactAccess?.monthlyLimit || 0) + (plan.contactUnlocks || 0), 3),
      usedCount: user.contactAccess?.usedCount || 0,
      resetAt:
        user.contactAccess?.resetAt && new Date(user.contactAccess.resetAt) >= new Date()
          ? user.contactAccess.resetAt
          : expiresAt,
      isPremium: true,
    };

    user.activePlan = {
      ...currentPlan,
      expiresAt: hasCurrentActivePlan ? currentPlan.expiresAt : expiresAt,
      contactUnlocks: Math.max(currentPlan.contactUnlocks || 0, 0) + (plan.contactUnlocks || 0),
      leadCredits: Math.max(currentPlan.leadCredits || 0, 0) + (plan.leadCredits || 0),
    };

    await user.save();
    return;
  }

  user.activePlan = {
    planId: plan._id,
    expiresAt,
    listingLimit: (plan.listingLimit || 0) + carryForwardListings,
    listingsUsed: 0,
    isBoosted: plan.featuredBoost,
    contactUnlocks: (plan.contactUnlocks || 0) + carryForwardUnlocks,
    leadCredits: (plan.leadCredits || 0) + carryForwardPlanLeadCredits,
    boostDays: plan.boostDays || 7,
  };

  user.contactAccess = {
    monthlyLimit: Math.max(plan.contactUnlocks || 0, 3),
    usedCount: 0,
    resetAt: expiresAt,
    isPremium: (plan.contactUnlocks || 0) > 0,
  };

  if (plan.category === "broker_leads") {
    user.leadCredits = (user.leadCredits || 0) + (plan.leadCredits || 0);
  }

  await user.save();
};

const createPaymentIntent = async (req, res) => {
  const plan = await Plan.findById(req.body.planId);
  if (!plan) return res.status(404).json({ message: "Plan not found" });

  let gatewayOrderId;
  let gateway = "simulated";

  if (hasRazorpayConfig && plan.price > 0) {
    const order = await razorpay.orders.create({
      amount: Math.round(plan.price * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: String(req.user._id),
        planId: String(plan._id),
      },
    });
    gatewayOrderId = order.id;
    gateway = "razorpay";
  }

  const payment = await Payment.create({
    userId: req.user._id,
    planId: plan._id,
    amount: plan.price,
    status: "created",
    transactionId: `TXN-${crypto.randomUUID()}`,
    gatewayOrderId,
    gateway,
  });

  return res.status(201).json({
    payment,
    message: "Payment intent created",
    razorpay: hasRazorpayConfig && plan.price > 0
      ? {
          keyId: process.env.RAZORPAY_KEY_ID,
          orderId: gatewayOrderId,
          amount: Math.round(plan.price * 100),
          currency: "INR",
        }
      : null,
  });
};

const verifyPayment = async (req, res) => {
  const { paymentId, success, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const payment = await Payment.findById(paymentId).populate("planId");
  if (!payment) return res.status(404).json({ message: "Payment not found" });

  if (String(payment.userId) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const hasRazorpayPayload = Boolean(razorpayOrderId && razorpayPaymentId && razorpaySignature);
  let paid = Boolean(success);

  if (hasRazorpayPayload) {
    if (!hasRazorpayConfig) {
      return res.status(400).json({ message: "Razorpay config is missing on server" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    paid = expectedSignature === razorpaySignature;
    payment.gatewayOrderId = razorpayOrderId;
    payment.gatewayPaymentId = razorpayPaymentId;
  }

  payment.status = paid ? "paid" : "failed";
  await payment.save();

  if (payment.status === "paid") {
    await activateUserPlan(payment);
  }

  return res.json({ payment, message: "Payment verified" });
};

const myPayments = async (req, res) => {
  const items = await Payment.find({ userId: req.user._id }).populate("planId").sort("-createdAt");
  res.json({ items });
};

module.exports = {
  createPaymentIntent,
  verifyPayment,
  myPayments,
};
