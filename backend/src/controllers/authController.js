const { body } = require("express-validator");
const axios = require("axios");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const generateHtmlEmail = require("../utils/emailFormatter");
const { sendWelcomeTemplateEmail } = require("../utils/sendEmailJs");

const buildFreeOnboardingPack = () => {
  const resetAt = new Date();
  resetAt.setDate(resetAt.getDate() + 30);

  const freePostExpiry = new Date();
  freePostExpiry.setDate(freePostExpiry.getDate() + 30);

  return {
    leadCredits: 5,
    canPostProperty: true,
    freePost: {
      used: false,
      expiresAt: freePostExpiry,
    },
    contactAccess: {
      monthlyLimit: 10,
      usedCount: 0,
      resetAt,
      isPremium: false,
    },
    activePlan: {
      planId: null,
      expiresAt: freePostExpiry,
      listingLimit: 1,
      listingsUsed: 0,
      isBoosted: false,
      contactUnlocks: 5,
      leadCredits: 0,
      boostDays: 0,
    },
  };
};

const signupValidators = [
  body("name").trim().notEmpty(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  body("role").optional().isIn(["buyer", "customer", "seller", "agent", "broker", "builder", "admin"]),
  body("address").optional().trim(),
];

const loginValidators = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];

const socialLoginValidators = [
  body("provider").isIn(["google", "facebook"]),
  body("token").notEmpty(),
];

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  canPostProperty: user.canPostProperty,
  phone: user.phone,
  address: user.address,
  freePost: user.freePost,
  activePlan: user.activePlan,
  savedProperties: user.savedProperties,
  contactAccess: user.contactAccess,
  leadCredits: user.leadCredits,
});

const getClientUrl = () => process.env.CLIENT_URL || "http://localhost:5173";

const sendWelcomeEmail = async (user, providerLabel = "signing up") => {
  const emailJsResult = await sendWelcomeTemplateEmail(user, providerLabel);
  if (emailJsResult) {
    return emailJsResult;
  }
  throw new Error("Welcome email send failed via EmailJS");
};

const sendLoginAlert = async (user) => {
  const loginTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "short",
  });

  const loginHtml = generateHtmlEmail({
    name: user.name,
    title: "New Login Detected",
    message: `A new login was recorded for your account.\n\n<strong>Time:</strong> ${loginTime} (IST)\n<strong>Account:</strong> ${user.email}\n\nIf this was you, no action is needed. If you did <strong>not</strong> log in, please change your password immediately and contact our support team.`,
    buttonText: "Go to My Dashboard",
    buttonUrl: `${getClientUrl()}/dashboard`,
    type: "login",
  });

  const result = await sendEmail({
    to: user.email,
    subject: "Security Alert: New Login to Your MyHosurProperty Account",
    html: loginHtml,
    text: `A new login was recorded for your account at ${loginTime} (IST). If this was not you, please change your password immediately.`,
  });

  if (!result) {
    throw new Error("Login alert email send returned no result");
  }
};

const verifyGoogleToken = async (token) => {
  try {
    const response = await axios.get("https://oauth2.googleapis.com/tokeninfo", {
      params: { id_token: token },
      timeout: 10000,
    });

    const data = response.data;
    if (!data?.email) {
      throw new Error("Google account email not available");
    }

    return {
      email: String(data.email).toLowerCase(),
      name: data.name || data.given_name || "Google User",
    };
  } catch {
    const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });

    const data = response.data;
    if (!data?.email) {
      throw new Error("Google account email not available");
    }

    return {
      email: String(data.email).toLowerCase(),
      name: data.name || data.given_name || "Google User",
    };
  }
};

const verifyFacebookToken = async (token) => {
  const response = await axios.get("https://graph.facebook.com/me", {
    params: {
      fields: "id,name,email",
      access_token: token,
    },
    timeout: 10000,
  });

  const data = response.data;
  if (!data?.email) {
    throw new Error("Facebook account email permission is required");
  }

  return {
    email: String(data.email).toLowerCase(),
    name: data.name || "Facebook User",
  };
};

const signup = async (req, res) => {
  const { name, email, password, phone, address, role = "buyer" } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    address,
    role,
    canPostProperty: true,
    ...buildFreeOnboardingPack(),
  });

  try {
    await sendWelcomeEmail(user, "signing up");
    console.log(`[signup] Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error("[signup] Welcome email failed:", error.message);
  }

  const token = generateToken({ id: user._id, role: user.role });

  return res.status(201).json({
    token,
    user: sanitizeUser(user),
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.status === "deactivated") {
    return res.status(403).json({ message: "Your account has been deactivated by the admin." });
  }

  const token = generateToken({ id: user._id, role: user.role });

  try {
    await sendLoginAlert(user);
    console.log(`[login] Login alert email sent to ${user.email}`);
  } catch (error) {
    console.error("[login] Login alert email failed:", error.message);
  }

  return res.json({
    token,
    user: sanitizeUser(user),
  });
};

const otpRequest = async (req, res) => {
  const { email } = req.body;
  const otp = "123456";
  return res.json({ message: "OTP sent (simulated)", email, otp });
};

const otpVerify = async (req, res) => {
  const { email, otp } = req.body;
  if (otp !== "123456") {
    return res.status(401).json({ message: "Invalid OTP" });
  }

  let user = await User.findOne({ email });
  if (user && user.status === "deactivated") {
    return res.status(403).json({ message: "Your account has been deactivated by the admin." });
  }

  const isNewUser = !user;

  if (!user) {
    user = await User.create({
      name: email.split("@")[0],
      email,
      password: Math.random().toString(36).slice(2),
      role: "buyer",
      canPostProperty: false,
      ...buildFreeOnboardingPack(),
    });
  }

  if (isNewUser) {
    try {
      await sendWelcomeEmail(user, "registering with OTP");
      console.log(`[otpVerify] Welcome email sent to ${user.email}`);
    } catch (error) {
      console.error("[otpVerify] Welcome email failed:", error.message);
    }
  }

  const token = generateToken({ id: user._id, role: user.role });
  return res.json({
    token,
    user: sanitizeUser(user),
  });
};

const socialLogin = async (req, res) => {
  const { provider, token } = req.body;

  let verified;
  try {
    verified = provider === "google" ? await verifyGoogleToken(token) : await verifyFacebookToken(token);
  } catch (error) {
    return res.status(401).json({ message: error.message || "Invalid social token" });
  }

  let user = await User.findOne({ email: verified.email });
  if (user && user.status === "deactivated") {
    return res.status(403).json({ message: "Your account has been deactivated by the admin." });
  }

  const isNewUser = !user;

  if (!user) {
    user = await User.create({
      name: verified.name,
      email: verified.email,
      password: Math.random().toString(36).slice(2) + Date.now().toString(36),
      role: "buyer",
      canPostProperty: false,
      ...buildFreeOnboardingPack(),
    });
  }

  if (isNewUser) {
    try {
      await sendWelcomeEmail(user, `signing up with ${provider}`);
      console.log(`[socialLogin] Welcome email sent to ${user.email}`);
    } catch (error) {
      console.error("[socialLogin] Welcome email failed:", error.message);
    }
  }

  const jwt = generateToken({ id: user._id, role: user.role });
  return res.json({
    token: jwt,
    user: sanitizeUser(user),
  });
};

const me = async (req, res) => {
  return res.json({ user: req.user });
};

module.exports = {
  signupValidators,
  loginValidators,
  socialLoginValidators,
  signup,
  login,
  otpRequest,
  otpVerify,
  socialLogin,
  me,
};
