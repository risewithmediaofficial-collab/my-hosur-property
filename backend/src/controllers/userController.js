const User = require("../models/User");

const toggleSavedProperty = async (req, res) => {
  const { propertyId } = req.body;
  const user = await User.findById(req.user._id);

  const exists = user.savedProperties.some((id) => String(id) === String(propertyId));
  if (exists) {
    user.savedProperties = user.savedProperties.filter((id) => String(id) !== String(propertyId));
  } else {
    user.savedProperties.push(propertyId);
  }

  await user.save();
  res.json({ savedProperties: user.savedProperties });
};

const getSavedProperties = async (req, res) => {
  const user = await User.findById(req.user._id).populate("savedProperties");
  res.json({ items: user.savedProperties });
};

const updateProfile = async (req, res) => {
  const { email, address, role } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (email && email.toLowerCase().trim() !== (user.email || "").toLowerCase().trim()) {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "Email address is already in use by another account." });
    }
    user.email = email.toLowerCase().trim();
  }

  if (address) user.address = address;
  if (role) user.role = role;

  await user.save();

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      canPostProperty: user.canPostProperty,
      isPhoneVerified: Boolean(user.isPhoneVerified),
      isEmailVerified: Boolean(user.isEmailVerified),
      freePost: user.freePost,
      activePlan: user.activePlan,
      savedProperties: user.savedProperties,
      contactAccess: user.contactAccess,
      leadCredits: user.leadCredits,
    }
  });
};

module.exports = {
  toggleSavedProperty,
  getSavedProperties,
  updateProfile,
};
