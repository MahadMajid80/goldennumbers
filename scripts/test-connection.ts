import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

import connectDB from "../lib/mongodb";

const testConnection = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    await connectDB();
    console.log("✅ MongoDB connected successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error(error);
    process.exit(1);
  }
};

testConnection();

