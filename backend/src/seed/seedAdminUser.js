require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");

const ADMIN_NAME = process.env.ADMIN_NAME || "admin4";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin4@myhosurproperty.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin4";
const ADMIN_PHONE = process.env.ADMIN_PHONE || "9688235536";

// Normalize a raw phone string: strips non-digits and prepends "91" for 10-digit numbers
const normalizePhoneForStorage = (phone) => {
  if (!phone) return null;
  const cleaned = String(phone).trim().replace(/\D/g, "");
  return cleaned.length === 10 ? `91${cleaned}` : cleaned;
};

const seedAdminUser = async () => {
  await connectDB();

  const normalizedPhone = normalizePhoneForStorage(ADMIN_PHONE);
  let user = await User.findOne({ email: ADMIN_EMAIL });

  if (!user) {
    user = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
      canPostProperty: true,
      phone: normalizedPhone,
    });
    console.log("Admin user created:", user.email);
  } else {
    user.name = ADMIN_NAME;
    user.role = "admin";
    user.canPostProperty = true;
    user.password = ADMIN_PASSWORD;
    user.phone = normalizedPhone;
    await user.save();
    console.log("Admin user updated:", user.email);
  }

  console.log("Login username:", ADMIN_NAME);
  console.log("Login email:", ADMIN_EMAIL);
  console.log("Login password:", ADMIN_PASSWORD);
  console.log("Login phone (normalized):", normalizedPhone);
  process.exit(0);
};

seedAdminUser().catch((error) => {
  console.error("Failed to seed admin user:", error.message);
  process.exit(1);
});

