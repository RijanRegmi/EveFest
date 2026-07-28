import express from "express";
import User from "../models/User";
import Event from "../models/Event";
import Booking from "../models/Booking";
import { protect } from "../middlewares/authMiddleware";
import { admin } from "../middlewares/adminMiddleware";

const router = express.Router();

// Get Admin Overview Metrics
router.get("/stats", protect, admin, async (_req, res, next) => {
  try {
    const totalUsersCount = await User.countDocuments({});
    const totalEventsCount = await Event.countDocuments({ isTakedown: { $ne: true } });
    const takedownEventsCount = await Event.countDocuments({ isTakedown: true });
    const totalBookingsCount = await Booking.countDocuments({});

    const allEvents = await Event.find({});
    const revenueTotal = allEvents.reduce((acc, curr) => {
      const p = curr.price || 0;
      const c = curr.registeredCount || 0;
      return acc + p * c;
    }, 0);

    res.status(200).json({
      totalUsers: totalUsersCount,
      totalEvents: totalEventsCount,
      takedownEvents: takedownEventsCount,
      totalBookings: totalBookingsCount,
      totalRevenue: revenueTotal,
    });
  } catch (error) {
    res.status(500);
    next(error);
  }
});

// Admin Takedown Event
router.patch("/events/:id/takedown", protect, admin, async (req, res, next) => {
  try {
    const { reason } = req.body as { reason?: string };
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      return next(new Error("Event not found"));
    }

    event.isTakedown = true;
    event.takedownReason = reason || "Violation of campus community guidelines.";
    await event.save();

    res.status(200).json({ message: "Event taken down successfully", event });
  } catch (error) {
    res.status(500);
    next(error);
  }
});

// Admin Restore Takedown Event
router.patch("/events/:id/restore", protect, admin, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      return next(new Error("Event not found"));
    }

    event.isTakedown = false;
    event.takedownReason = "";
    await event.save();

    res.status(200).json({ message: "Event restored successfully", event });
  } catch (error) {
    res.status(500);
    next(error);
  }
});

// Admin List All Users
router.get("/users", protect, admin, async (_req, res, next) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500);
    next(error);
  }
});

// Admin Change User Role
router.patch("/users/:id/role", protect, admin, async (req, res, next) => {
  try {
    const { role } = req.body as { role?: string };
    if (!role || !["user", "admin"].includes(role)) {
      res.status(400);
      return next(new Error("Invalid role specified"));
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      return next(new Error("User not found"));
    }

    user.role = role as "user" | "admin";
    await user.save();

    res.status(200).json({ message: `User role updated to ${role}`, user });
  } catch (error) {
    res.status(500);
    next(error);
  }
});

export default router;
