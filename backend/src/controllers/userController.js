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

module.exports = {
  toggleSavedProperty,
  getSavedProperties,
};
