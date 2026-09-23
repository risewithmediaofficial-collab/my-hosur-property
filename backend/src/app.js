const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const { uploadDir } = require("./utils/uploadPaths");

const authRoutes = require("./routes/authRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const leadRoutes = require("./routes/leadRoutes");
const planRoutes = require("./routes/planRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const customerRequestRoutes = require("./routes/customerRequestRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const whatsappBotRoutes = require("./routes/whatsappBot.routes");
const seoController = require("./controllers/seoController");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

const envOrigins = [process.env.CLIENT_URL, process.env.CORS_ORIGINS]
  .filter(Boolean)
  .flatMap((value) => String(value).split(","))
  .map((value) => value.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envOrigins])];

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-bot-api-key"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(uploadDir));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running successfully",
    service: "MyHosurProperty API",
    docsHint: "Use /api/* routes to access backend resources",
  });
});

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "API root is live",
    health: "/api/health",
  });
});

app.get("/api/health", (req, res) =>
  res.json({
    success: true,
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
);

app.get("/api/admin-reset", async (req, res) => {
  const secret = req.query.secret;
  const RESET_SECRET = process.env.ADMIN_RESET_SECRET || "myhosur-admin-reset-2024";
  if (secret !== RESET_SECRET) {
    return res.status(403).json({ message: "Forbidden" });
  }
  try {
    const User = require("./models/User");
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin4@myhosurproperty.com";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin4";
    const ADMIN_PHONE_RAW = process.env.ADMIN_PHONE || "9688235536";
    const cleaned = String(ADMIN_PHONE_RAW).trim().replace(/\D/g, "");
    const normalizedPhone = cleaned.length === 10 ? `91${cleaned}` : cleaned;

    let user = await User.findOne({ email: ADMIN_EMAIL });
    if (!user) {
      user = await User.create({
        name: process.env.ADMIN_NAME || "admin4",
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: "admin",
        canPostProperty: true,
        phone: normalizedPhone,
      });
      return res.json({ message: "Admin user created", email: user.email, phone: normalizedPhone });
    }
    user.password = ADMIN_PASSWORD;
    user.phone = normalizedPhone;
    user.role = "admin";
    user.canPostProperty = true;
    await user.save();
    return res.json({ message: "Admin user updated", email: user.email, phone: normalizedPhone });
  } catch (err) {
    return res.status(500).json({ message: "Error resetting admin", error: err.message });
  }
});

app.get("/sitemap.xml", seoController.sitemap);
app.get("/robots.txt", seoController.robots);

app.use("/api/auth", authRoutes);
app.use("/api/admin-auth", adminAuthRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/customer-requests", customerRequestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/whatsapp/bot", whatsappBotRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
