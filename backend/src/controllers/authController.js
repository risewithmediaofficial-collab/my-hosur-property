const { body } = require("express-validator");
const axios = require("axios");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const buildFreeOnboardingPack = () => {
  const resetAt = new Date();
  resetAt.setDate(resetAt.getDate() + 30);
  return {
    leadCredits: 5,
    contactAccess: {
      monthlyLimit: 10,
      usedCount: 0,
      resetAt,
      isPremium: false,
    },
  };
};

const signupValidators = [
  body("name").trim().notEmpty(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  body("role").optional().isIn(["buyer", "customer", "seller", "agent", "broker", "builder", "admin"]),
  body("canPostProperty").optional().isBoolean(),
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
  activePlan: user.activePlan,
  savedProperties: user.savedProperties,
  contactAccess: user.contactAccess,
  leadCredits: user.leadCredits,
});

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
    // Fallback for OAuth popup access_token flow.
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
  const { name, email, password, phone, role = "buyer", canPostProperty = false } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role,
    canPostProperty,
    ...buildFreeOnboardingPack(),
  });
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
