import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Error connecting to MongoDB: ${error.message}`);
    // Do not crash the process in local development to allow offline demo fallback
    console.warn(`[Database] Database is offline. The application will continue running, and the frontend will fallback to local storage mode.`);
  }
};
