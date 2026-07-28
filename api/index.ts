import type { IncomingMessage, ServerResponse } from "http";
import app from "../backend/src/app.js";
import { connectDB } from "../backend/src/config/db.js";
import { seedDatabase } from "../backend/src/config/seed.js";

let isInitialized = false;

async function initServerless() {
  if (!isInitialized) {
    try {
      await connectDB();
      await seedDatabase();
      isInitialized = true;
    } catch (err) {
      console.error("Vercel DB initialization error:", err);
    }
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await initServerless();
  return (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(req, res);
}
