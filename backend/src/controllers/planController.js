const Plan = require("../models/Plan");

const getPlans = async (req, res) => {
  const query = { isActive: true };
  if (req.query.category) query.category = req.query.category;
  if (req.query.targetRole) {
    const roleAliases = {
      buyer: ["buyer", "customer"],
      customer: ["customer", "buyer"],
    };
    const roles = roleAliases[req.query.targetRole] || [req.query.targetRole];
    query.$or = roles.flatMap((role) => [{ targetRole: role }, { targetRole: "all" }]);
  }
  const items = await Plan.find(query).sort({ price: 1 });
  res.json({ items });
};

module.exports = {
  getPlans,
};
