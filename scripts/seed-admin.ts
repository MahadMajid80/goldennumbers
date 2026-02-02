import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

import connectDB from "../lib/mongodb";
import Admin from "../models/Admin";
import bcrypt from "bcryptjs";

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL || "admin@goldennumbers.pk";
    const password = process.env.ADMIN_PASSWORD || "admin123";

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.create({
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created successfully!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error("Error seeding admin:", error);
  } finally {
    process.exit(0);
  }
};

seedAdmin();

