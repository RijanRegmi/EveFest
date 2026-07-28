import express from "express";
import SupportMessage from "../models/SupportMessage";
import User from "../models/User";
import { protect } from "../middlewares/authMiddleware";
import { admin } from "../middlewares/adminMiddleware";

const router = express.Router();

// Submit new support ticket/message
router.post("/", async (req, res, next) => {
  try {
    const { name, email, subject, category, message } = req.body as {
      name?: string;
      email?: string;
      subject?: string;
      category?: string;
      message?: string;
    };

    if (!name || !email || !subject || !message) {
      res.status(400);
      return next(new Error("Please provide all required fields"));
    }

    let userId: string | null = null;
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      userId = existingUser._id.toString();
    }

    const ticketCode = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

    const supportMsg = await SupportMessage.create({
      user: userId,
      name,
      email: email.toLowerCase(),
      subject,
      category: category || "General Query",
      message,
      ticketCode,
      status: "Open",
    });

    res.status(201).json({
      message: "Support ticket created successfully",
      ticketCode: supportMsg.ticketCode,
      supportMessage: supportMsg,
    });
  } catch (error) {
    res.status(500);
    next(error);
  }
});

// User or Admin get support messages
router.get("/my-tickets", protect, async (req, res, next) => {
  try {
    const userEmail = req.user!.email;
    const tickets = await SupportMessage.find({ email: userEmail }).sort({
      createdAt: -1,
    });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500);
    next(error);
  }
});

// Admin: List all support tickets
router.get("/admin/all", protect, admin, async (_req, res, next) => {
  try {
    const tickets = await SupportMessage.find({}).sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500);
    next(error);
  }
});

// Admin: Respond or update ticket status
router.patch("/admin/:id/respond", protect, admin, async (req, res, next) => {
  try {
    const { status, adminResponse } = req.body as {
      status?: "Open" | "In Progress" | "Resolved" | "Closed";
      adminResponse?: string;
    };

    const ticket = await SupportMessage.findById(req.params.id);
    if (!ticket) {
      res.status(404);
      return next(new Error("Ticket not found"));
    }

    if (status) ticket.status = status;
    if (adminResponse) ticket.adminResponse = adminResponse;

    await ticket.save();

    res.status(200).json({ message: "Ticket updated successfully", ticket });
  } catch (error) {
    res.status(500);
    next(error);
  }
});

export default router;
