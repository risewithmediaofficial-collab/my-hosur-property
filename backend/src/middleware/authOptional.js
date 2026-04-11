const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authOptional = async (req, res, next) => {
  try {
    const bearer = req.headers.authorization;
    if (!bearer || !bearer.startsWith("Bearer ")) {
      return next();
    }

    const token = bearer.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (user) {
      req.user = user;
    }
  } catch {
    // Ignore invalid token for optional auth.
  }
  return next();
};

module.exports = authOptional;
