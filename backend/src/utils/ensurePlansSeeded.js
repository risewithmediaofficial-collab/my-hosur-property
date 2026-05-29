const Plan = require("../models/Plan");
const plans = require("../seed/planData");

const ensurePlansSeeded = async () => {
  const count = await Plan.countDocuments();
  if (count > 0) {
    for (const plan of plans) {
      await Plan.findOneAndUpdate(
        { name: plan.name },
        plan,
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
    }
    console.log(`[boot] Plans synchronized: ${plans.length} definitions, ${count} existing`);
    return;
  }

  await Plan.insertMany(plans);
  console.log(`[boot] Seeded default plans: ${plans.length}`);
};

module.exports = ensurePlansSeeded;
