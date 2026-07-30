const Plan = require("../models/Plan");
const plans = require("../seed/planData");

const ensurePlansSeeded = async () => {
  try {
    for (const plan of plans) {
      await Plan.findOneAndUpdate(
        { name: plan.name },
        plan,
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
    }

    // Remove any obsolete or duplicate plans in DB that are not in planData
    const activeNames = plans.map((p) => p.name);
    const deleted = await Plan.deleteMany({ name: { $nin: activeNames } });

    const totalCount = await Plan.countDocuments();
    console.log(`[boot] Plans synchronized: ${plans.length} official plans active (deleted ${deleted.deletedCount || 0} obsolete plans, ${totalCount} in DB)`);
  } catch (error) {
    console.error("[boot] Error synchronizing plans:", error.message);
  }
};

module.exports = ensurePlansSeeded;
