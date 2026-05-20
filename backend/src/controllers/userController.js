const User = require("../models/User");
const Property = require("../models/Property");
const { buildAgentSlug } = require("../utils/seo");

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

const listPublicAgents = async (_req, res) => {
  const agents = await User.find({
    role: { $in: ["agent", "broker", "builder"] },
    status: "active",
  })
    .select("name email phone role createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const agentIds = agents.map((agent) => agent._id);
  const propertyCounts = await Property.aggregate([
    {
      $match: {
        status: "approved",
        ownerId: { $in: agentIds },
      },
    },
    {
      $group: {
        _id: "$ownerId",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = propertyCounts.reduce((acc, item) => {
    acc[String(item._id)] = item.count;
    return acc;
  }, {});

  res.json({
    items: agents.map((agent) => ({
      ...agent,
      slug: buildAgentSlug(agent),
      propertyCount: countMap[String(agent._id)] || 0,
      areaServed: "Hosur",
    })),
  });
};

const getAgentBySlug = async (req, res) => {
  const agents = await User.find({
    role: { $in: ["agent", "broker", "builder"] },
    status: "active",
  })
    .select("name email phone role createdAt")
    .sort({ createdAt: -1 });

  const agent = agents.find((item) => buildAgentSlug(item) === req.params.slug);

  if (!agent) {
    return res.status(404).json({ message: "Agent not found" });
  }

  const properties = await Property.find({
    status: "approved",
    ownerId: agent._id,
  })
    .populate("ownerId", "name email phone role")
    .sort({ updatedAt: -1 })
    .limit(12);
  const propertyCount = await Property.countDocuments({
    status: "approved",
    ownerId: agent._id,
  });

  res.json({
    agent: {
      ...agent.toObject(),
      slug: buildAgentSlug(agent),
      areaServed: "Hosur",
      propertyCount,
    },
    properties,
  });
};

module.exports = {
  toggleSavedProperty,
  getSavedProperties,
  listPublicAgents,
  getAgentBySlug,
};
