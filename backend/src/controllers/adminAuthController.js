const { body } = require("express-validator");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const adminLoginValidators = [
  body("username").trim().notEmpty(),
  body("password").notEmpty(),
];

const sanitizeAdmin = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  canPostProperty: user.canPostProperty,
  activePlan: user.activePlan,
  contactAccess: user.contactAccess,
  leadCredits: user.leadCredits,
});

const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  const key = String(username || "").trim();

  const user = await User.findOne({
    $or: [{ email: key.toLowerCase() }, { name: key }],
  });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }

  if (user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }

  const token = generateToken({ id: user._id, role: user.role });
  return res.json({
    token,
    user: sanitizeAdmin(user),
    message: "Admin login successful",
  });
};

module.exports = {
  adminLoginValidators,
  adminLogin,
};
