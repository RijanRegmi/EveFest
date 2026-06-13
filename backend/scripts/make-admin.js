import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../src/models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const email = process.argv[2];

if (!email) {
  console.error("Please provide a user email. Usage: node scripts/make-admin.js <email>");
  process.exit(1);
}

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI not found in environment variables.");
    }

    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(uri);
    console.log("Connected successfully.");

    console.log(`Finding user with email: ${email}`);
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`User with email "${email}" not found.`);
      process.exit(1);
    }

    console.log(`Found user: ${user.name} (@${user.username}) | Current Role: ${user.role}`);
    
    if (user.role === "admin") {
      console.log("User is already an admin!");
    } else {
      user.role = "admin";
      await user.save();
      console.log(`Success! User role updated to admin.`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error running script:", error.message);
    process.exit(1);
  }
};

run();
