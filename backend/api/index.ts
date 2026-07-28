import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";
import { seedDatabase } from "../src/config/seed.js";

let isConnected = false;

export default async function handler(req: unknown, res: unknown) {
  if (!isConnected) {
    try {
      await connectDB();
      await seedDatabase();
      isConnected = true;
    } catch (err) {
      console.error("[Database] Connection error in serverless function:", err);
    }
  }
  return app(req as Parameters<typeof app>[0], res as Parameters<typeof app>[1]);
}
