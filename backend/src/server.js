const path = require("path");
const dotenv = require("dotenv");

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = require("./app");
const connectDB = require("./config/db");
const { verifyMailConnection } = require("./utils/sendEmail");

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";

const start = async () => {
  try {
    console.log("[boot] Starting backend service...");
    console.log(`[boot] Node environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`[boot] Port configured: ${PORT}`);
    console.log(`[boot] Host configured: ${HOST}`);
    console.log(`[boot] Mongo URI present: ${process.env.MONGO_URI ? "yes" : "no"}`);
    console.log(`[boot] Client URL: ${process.env.CLIENT_URL || "not set"}`);

    await connectDB();

    const mailReady = await verifyMailConnection();
    console.log(`[boot] Mail verification status: ${mailReady ? "ready" : "skipped or failed"}`);

    app.listen(PORT, HOST, () => {
      console.log(`[boot] Server running on ${HOST}:${PORT}`);
    });
  } catch (err) {
    console.error("[boot] Failed to start server:", err);
    process.exit(1);
  }
};

process.on("unhandledRejection", (reason) => {
  console.error("[boot] Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[boot] Uncaught Exception:", error);
  process.exit(1);
});

start();
