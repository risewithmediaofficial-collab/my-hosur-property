const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB_NAME;

    if (!uri) {
      throw new Error("MONGO_URI is missing");
    }

    mongoose.set("strictQuery", true);

    console.log("[db] Attempting MongoDB connection...");
    await mongoose.connect(uri, {
      dbName: dbName || undefined,
      serverSelectionTimeoutMS: 10000,
    });

    console.log(
      `[db] MongoDB Connected Successfully to ${mongoose.connection.host}/${mongoose.connection.name}`
    );
  } catch (error) {
    console.error("[db] MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
