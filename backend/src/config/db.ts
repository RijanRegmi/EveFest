import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || "";
    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    const err = error as Error;
    console.error(`[Database] Error connecting to MongoDB: ${err.message}`);
    // Do not crash the process in local development to allow offline demo fallback
    console.warn(
      `[Database] Database is offline. The application will continue running, and the frontend will fallback to local storage mode.`
    );
  }
};
