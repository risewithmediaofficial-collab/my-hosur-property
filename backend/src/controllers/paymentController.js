const crypto = require("crypto");
const Payment = require("../models/Payment");
const Plan = require("../models/Plan");
const User = require("../models/User");
const { hasRazorpayConfig, razorpay } = require("../config/razorpay");
const PaymentRequest = require("../models/PaymentRequest");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/sendEmail");


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

/*
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
*/

const createPaymentRequest = async (req, res, next) => {
  try {
    const { name, email, phone, selectedPlan, amountPaid, transactionId, paymentMethod, paymentDate } = req.body;

    const existing = await PaymentRequest.findOne({ transactionId });
    if (existing) {
      return res.status(400).json({ message: "Transaction ID / UTR Number already submitted." });
    }

    let screenshot = "";
    if (req.file) {
      screenshot = `/uploads/${req.file.filename}`;
    }

    const paymentRequest = await PaymentRequest.create({
      userId: req.user._id,
      name,
      email,
      phone,
      selectedPlan,
      amountPaid: Number(amountPaid),
      transactionId,
      paymentMethod,
      paymentDate: new Date(paymentDate),
      screenshot,
      status: "pending",
    });

    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await Notification.create({
        recipientId: admin._id,
        senderId: req.user._id,
        type: "payment_request_submitted",
        title: "New Payment Request Submitted",
        message: `${name} has submitted a manual payment request of Rs. ${amountPaid} for the ${selectedPlan} plan.`,
        payload: { paymentRequestId: paymentRequest._id },
      });
    }

    try {
      await sendEmail({
        to: email,
        subject: "Payment Request Received - MyHosurProperty",
        html: `<h3>Payment Request Submitted</h3>
               <p>Hello ${name},</p>
               <p>We have received your payment request of <b>Rs. ${amountPaid}</b> for the plan <b>${selectedPlan}</b>.</p>
               <p>Your transaction ID is <b>${transactionId}</b>.</p>
               <p>Our admin team is verifying your payment. Your subscription will be activated upon approval.</p>
               <br/><p>Thank you,<br/>MyHosurProperty Team</p>`,
      });
    } catch (e) {
      console.error("Email notification failed: ", e.message);
    }

    return res.status(201).json({ paymentRequest, message: "Payment request submitted successfully." });
  } catch (error) {
    next(error);
  }
};

const getUserPaymentRequests = async (req, res, next) => {
  try {
    const items = await PaymentRequest.find({ userId: req.user._id }).sort("-createdAt");
    return res.json({ items });
  } catch (error) {
    next(error);
  }
};

const getAdminPaymentRequests = async (req, res, next) => {
  try {
    const items = await PaymentRequest.find().populate("userId", "name email phone").sort("-createdAt");
    return res.json({ items });
  } catch (error) {
    next(error);
  }
};

const approvePaymentRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approvedPlan, durationDays, expiryDate, adminNotes } = req.body;

    const paymentRequest = await PaymentRequest.findById(id);
    if (!paymentRequest) {
      return res.status(404).json({ message: "Payment request not found." });
    }

    if (paymentRequest.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be approved." });
    }

    const plan = await Plan.findOne({ name: approvedPlan });
    if (!plan) {
      return res.status(404).json({ message: `Plan '${approvedPlan}' not found in database.` });
    }

    paymentRequest.status = "approved";
    paymentRequest.approvedPlan = approvedPlan;
    paymentRequest.adminNotes = adminNotes;
    paymentRequest.approvedAt = new Date();

    const finalDurationDays = Number(durationDays) || plan.durationDays || 30;
    const finalExpiryDate = expiryDate ? new Date(expiryDate) : addDays(new Date(), finalDurationDays);
    paymentRequest.expiryDate = finalExpiryDate;

    await paymentRequest.save();

    const mockPayment = {
      userId: paymentRequest.userId,
      planId: {
        ...plan.toObject(),
        durationDays: finalDurationDays,
      },
    };

    await activateUserPlan(mockPayment);

    if (expiryDate) {
      const user = await User.findById(paymentRequest.userId);
      if (user && user.activePlan) {
        user.activePlan.expiresAt = new Date(expiryDate);
        await user.save();
      }
    }

    await Notification.create({
      recipientId: paymentRequest.userId,
      type: "payment_request_approved",
      title: "Payment Request Approved",
      message: `Your payment request of Rs. ${paymentRequest.amountPaid} has been approved. The ${approvedPlan} plan is now active.`,
      payload: { paymentRequestId: paymentRequest._id },
    });

    try {
      await sendEmail({
        to: paymentRequest.email,
        subject: "Payment Request Approved - MyHosurProperty",
        html: `<h3>Payment Request Approved!</h3>
               <p>Hello ${paymentRequest.name},</p>
               <p>Great news! Your manual payment request for plan <b>${approvedPlan}</b> has been approved.</p>
               <p>Your subscription is active until <b>${new Date(finalExpiryDate).toLocaleDateString("en-IN")}</b>.</p>
               ${adminNotes ? `<p><b>Admin Notes:</b> ${adminNotes}</p>` : ""}
               <br/><p>Thank you,<br/>MyHosurProperty Team</p>`,
      });
    } catch (e) {
      console.error("Email notification failed: ", e.message);
    }

    return res.json({ paymentRequest, message: "Payment request approved and subscription activated." });
  } catch (error) {
    next(error);
  }
};

const rejectPaymentRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, adminNotes } = req.body;

    const paymentRequest = await PaymentRequest.findById(id);
    if (!paymentRequest) {
      return res.status(404).json({ message: "Payment request not found." });
    }

    if (paymentRequest.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be rejected." });
    }

    paymentRequest.status = "rejected";
    paymentRequest.rejectionReason = reason;
    if (adminNotes) paymentRequest.adminNotes = adminNotes;
    await paymentRequest.save();

    await Notification.create({
      recipientId: paymentRequest.userId,
      type: "payment_request_rejected",
      title: "Payment Request Rejected",
      message: `Your payment request of Rs. ${paymentRequest.amountPaid} has been rejected. Reason: ${reason}`,
      payload: { paymentRequestId: paymentRequest._id },
    });

    try {
      await sendEmail({
        to: paymentRequest.email,
        subject: "Payment Request Rejected - MyHosurProperty",
        html: `<h3>Payment Request Rejected</h3>
               <p>Hello ${paymentRequest.name},</p>
               <p>Your manual payment request has been rejected.</p>
               <p><b>Reason:</b> ${reason}</p>
               <p>If you believe this is an error, please verify your transaction details and submit a new request or contact support.</p>
               <br/><p>Thank you,<br/>MyHosurProperty Team</p>`,
      });
    } catch (e) {
      console.error("Email notification failed: ", e.message);
    }

    return res.json({ paymentRequest, message: "Payment request rejected." });
  } catch (error) {
    next(error);
  }
};

const myPayments = async (req, res) => {
  const items = await Payment.find({ userId: req.user._id }).populate("planId").sort("-createdAt");
  res.json({ items });
};

module.exports = {
  // createPaymentIntent,
  // verifyPayment,
  myPayments,
  createPaymentRequest,
  getUserPaymentRequests,
  getAdminPaymentRequests,
  approvePaymentRequest,
  rejectPaymentRequest,
};

