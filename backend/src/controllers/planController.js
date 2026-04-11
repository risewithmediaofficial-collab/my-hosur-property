const Plan = require("../models/Plan");

const getPlans = async (req, res) => {
  const query = { isActive: true };
  if (req.query.category) query.category = req.query.category;
  if (req.query.targetRole) {
    query.$or = [{ targetRole: req.query.targetRole }, { targetRole: "all" }];
  }
  const items = await Plan.find(query).sort({ price: 1 });
  res.json({ items });
};

module.exports = {
  getPlans,
};
