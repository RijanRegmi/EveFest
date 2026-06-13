import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";
import Event from "./models/Event.js";
import User from "./models/User.js";

dotenv.config();

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// DB Connection
connectDB().then(async () => {
  // If DB connects, check and seed initial events if empty
  try {
    const eventCount = await Event.countDocuments({});
    if (eventCount === 0) {
      console.log("[Seeding] Database is empty. Seeding initial events...");
      
      // Create a mock user to host the seeded events
      let adminHost = await User.findOne({ email: "admin.host@university.edu" });
      if (!adminHost) {
        adminHost = await User.create({
          name: "Campus Events Coordinator",
          email: "admin.host@university.edu",
          password: "password123", // Pre-hashes via mongoose save pre hook
          role: "admin",
        });
      }

      const initialEvents = [
        {
          title: "EveFest Tech Hackathon 2026",
          description: "Collaborate with developers, designers, and visionaries to build web applications addressing climate change and educational access. Win cash prizes, certificates, and recruitment opportunities from top tech firms on campus.",
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: "09:00 AM - 06:00 PM",
          price: 0,
          limit: 150,
          registeredCount: 45,
          isOnline: false,
          location: "Main Engineering Hall, Block C",
          mapLink: "https://maps.google.com/?q=Campus+Engineering+Hall",
          locationDescription: "Second floor auditorium. Registered participants should check in at the reception desk to collect their developer badges and lunch coupons.",
          image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop",
          category: "Technology",
          hostName: "Computer Science Association",
          hostId: adminHost._id,
          proofDoc: "CS_Hackathon_Approval.pdf"
        },
        {
          title: "Acoustic Sunset Concert Night",
          description: "Join us for a cozy evening featuring the university's finest student bands and acoustic soloists. Free snacks and beverages will be served. Bring your friends and unwind under the sunset skies.",
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: "05:30 PM - 09:30 PM",
          price: 15,
          limit: 200,
          registeredCount: 188,
          isOnline: false,
          location: "Campus Amphitheatre",
          mapLink: "https://maps.google.com/?q=Campus+Amphitheatre",
          locationDescription: "Outdoor open-air arena. In case of rain, the concert will be relocated to the Indoor Sports Center.",
          image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
          category: "Music",
          hostName: "Music & Cultural Club",
          hostId: adminHost._id,
          proofDoc: "Cultural_Dept_Permit.pdf"
        },
        {
          title: "UI/UX Design Masterclass (Virtual)",
          description: "Learn essential design principles, layout strategies, color theory, and advanced Figma workflows. Ideal for beginners wishing to improve their project aesthetics and portfolios.",
          date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: "02:00 PM - 05:00 PM",
          price: 5,
          limit: "unlimited",
          registeredCount: 124,
          isOnline: true,
          location: "Zoom Video Conferencing",
          mapLink: "https://zoom.us/j/mock_meeting_id",
          locationDescription: "Online meeting. Access link and event material drive will be available in the group chat and emailed to attendees prior to start.",
          image: "https://images.unsplash.com/photo-1561070791-26c113006238?q=80&w=800&auto=format&fit=crop",
          category: "Design",
          hostName: "Design Society",
          hostId: adminHost._id,
          proofDoc: "Design_Masterclass_Flyer.pdf"
        }
      ];

      await Event.insertMany(initialEvents);
      console.log("[Seeding] Successfully seeded default events in MongoDB.");
    }
  } catch (err) {
    console.error("[Seeding] Error seeding initial database:", err.message);
  }
});

// Route registration
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);

// Root path test response
app.get("/", (req, res) => {
  res.json({ status: "running", api: "EveFest API v1.0.0" });
});

// Error handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Express server running on port ${PORT}`);
});
