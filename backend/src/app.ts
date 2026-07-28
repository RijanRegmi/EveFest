import "./types/express.d.ts";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import adminRoutes from "./routes/adminRoutes";
import supportRoutes from "./routes/supportRoutes";
import chatRoutes from "./routes/chatRoutes";
import directMessageRoutes from "./routes/directMessageRoutes";
import { notFound, errorHandler } from "./middlewares/errorMiddleware";

dotenv.config();

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Route registration
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/direct-messages", directMessageRoutes);

// Root path test response
app.get("/", (_req, res) => {
  res.json({ status: "running", api: "EveFest API v1.0.0" });
});

app.get("/api", (_req, res) => {
  res.json({ status: "running", api: "EveFest API v1.0.0" });
});

// Error handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
