require("dotenv").config();
const connectDB = require("../config/db");
const Plan = require("../models/Plan");
const plans = require("./planData");

const seed = async () => {
  await connectDB();
  await Plan.deleteMany({});
  await Plan.insertMany(plans);
  console.log("Plans seeded");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
