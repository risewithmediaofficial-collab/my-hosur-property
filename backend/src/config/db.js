const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI is missing");
    }

    mongoose.set("strictQuery", true);

    console.log("[db] Attempting MongoDB connection...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[db] MongoDB Connected Successfully");
  } catch (error) {
    console.error("[db] MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
