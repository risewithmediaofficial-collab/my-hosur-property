const User = require("../models/User");
const RoleChangeRequest = require("../models/RoleChangeRequest");

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

const requestRoleChange = async (req, res) => {
  try {
    const { requestedRole, reason } = req.body;
    const allowedRoles = ["buyer", "customer", "seller", "agent", "broker", "builder"];
    if (!allowedRoles.includes(requestedRole)) {
      return res.status(400).json({ message: "Invalid role requested" });
    }

    if (req.user.role === requestedRole) {
      return res.status(400).json({ message: `You are already registered as ${requestedRole}` });
    }

    const existingPending = await RoleChangeRequest.findOne({
      userId: req.user._id,
      status: "pending",
    });

    if (existingPending) {
      existingPending.requestedRole = requestedRole;
      existingPending.reason = reason || existingPending.reason;
      existingPending.currentRole = req.user.role;
      await existingPending.save();
      return res.json({
        message: "Your role change request has been updated and sent to Admin for approval",
        request: existingPending,
      });
    }

    const request = await RoleChangeRequest.create({
      userId: req.user._id,
      currentRole: req.user.role,
      requestedRole,
      reason: reason || "",
      status: "pending",
    });

    return res.json({
      message: "Role change request submitted successfully. Admin will review your request.",
      request,
    });
  } catch (error) {
    console.error("[requestRoleChange] Error:", error.message);
    return res.status(500).json({ message: "Failed to submit role change request", error: error.message });
  }
};

const getMyRoleChangeRequests = async (req, res) => {
  try {
    const requests = await RoleChangeRequest.find({ userId: req.user._id }).sort("-createdAt");
    return res.json({ items: requests });
  } catch (error) {
    console.error("[getMyRoleChangeRequests] Error:", error.message);
    return res.status(500).json({ message: "Failed to fetch role change requests", error: error.message });
  }
};

module.exports = {
  toggleSavedProperty,
  getSavedProperties,
  updateProfile,
  requestRoleChange,
  getMyRoleChangeRequests,
};

