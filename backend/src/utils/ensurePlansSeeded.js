const Plan = require("../models/Plan");
const plans = require("../seed/planData");

const ensurePlansSeeded = async () => {
  const count = await Plan.countDocuments();
  if (count > 0) {
    console.log(`[boot] Plans already available: ${count}`);
    return;
  }

  await Plan.insertMany(plans);
  console.log(`[boot] Seeded default plans: ${plans.length}`);
};

module.exports = ensurePlansSeeded;
