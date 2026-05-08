const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const app = require("./app");
const connectDB = require("./config/db");
const { verifyMailConnection } = require("./utils/sendEmail");

const PORT = process.env.PORT || 5001;

const start = async () => {
  try {
    await connectDB();

    await verifyMailConnection();
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
};

start();
