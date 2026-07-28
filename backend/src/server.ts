import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/db";
import { seedDatabase } from "./config/seed";

dotenv.config();

// DB Connection & Seeding
connectDB().then(async () => {
  await seedDatabase();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Express server running on port ${PORT}`);
});
