require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");

const ADMIN_NAME = "admin4";
const ADMIN_EMAIL = "admin4@myhosurproperty.com";
const ADMIN_PASSWORD = "admin4";

const seedAdminUser = async () => {
  await connectDB();

  let user = await User.findOne({ email: ADMIN_EMAIL });
  if (!user) {
    user = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
      canPostProperty: true,
      phone: "9999999999",
    });
    console.log("Admin user created:", user.email);
  } else {
    user.name = ADMIN_NAME;
    user.role = "admin";
    user.canPostProperty = true;
    user.password = ADMIN_PASSWORD;
    await user.save();
    console.log("Admin user updated:", user.email);
  }

  console.log("Login username:", ADMIN_NAME);
  console.log("Login email:", ADMIN_EMAIL);
  console.log("Login password:", ADMIN_PASSWORD);
  process.exit(0);
};

seedAdminUser().catch((error) => {
  console.error("Failed to seed admin user:", error.message);
  process.exit(1);
});
