import express from "express";
import jwt from "jsonwebtoken";
import SupportMessage from "../models/SupportMessage";
import User from "../models/User";
import { protect } from "../middlewares/authMiddleware";
import { admin } from "../middlewares/adminMiddleware";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Submit new support ticket/message (works for both authenticated users and guest queries)
router.post("/", async (req, res, next) => {
  try {
    const { name, email, subject, category, message, text } = req.body as {
      name?: string;
      email?: string;
      subject?: string;
      category?: string;
      message?: string;
      text?: string;
    };

    const content = message || text;
    if (!content || content.trim() === "") {
      res.status(400);
      return next(new Error("Please provide a message or text content"));
    }

    let userId: string | null = null;
    let senderName = name || "Campus User";
    let senderEmail = email || "";

    // Extract user from authorization token if present
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        const authUser = await User.findById(decoded.id);
        if (authUser) {
          userId = authUser._id.toString();
          senderName = authUser.name || authUser.username;
          senderEmail = authUser.email;
        }
      } catch (err) {
        // Fallback to body data if token is invalid/mock
      }
    }

    if (!senderEmail && email) {
      senderEmail = email;
    }

    const ticketCode = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

    const supportMsg = await SupportMessage.create({
      user: userId,
      senderId: userId,
      senderName: senderName,
      name: senderName,
      email: (senderEmail || "user@evefest.com").toLowerCase(),
      subject: subject || "Campus Live Admin Support",
      category: category || "General Query",
      message: content.trim(),
      text: content.trim(),
      ticketCode,
      status: "Open",
    });

    res.status(201).json(supportMsg);
  } catch (error) {
    res.status(500);
    next(error);
  }
});

// User get support messages (/api/support or /api/support/my-tickets)
router.get(["/", "/my-tickets"], protect, async (req, res, next) => {
  try {
    const userEmail = req.user!.email.toLowerCase();
    const userId = req.user!._id.toString();

    const tickets = await SupportMessage.find({
      $or: [
        { user: userId },
        { senderId: userId },
        { email: userEmail },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(tickets);
  } catch (error) {
    res.status(500);
    next(error);
  }
});

// Admin: List all support tickets or threads
router.get(["/admin/all", "/admin/threads"], protect, admin, async (_req, res, next) => {
  try {
    const tickets = await SupportMessage.find({}).sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500);
    next(error);
  }
});

// Admin: Get thread by user ID
router.get("/admin/threads/:userId", protect, admin, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const tickets = await SupportMessage.find({
      $or: [{ user: userId }, { senderId: userId }, { email: userId }],
    }).sort({ createdAt: 1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500);
    next(error);
  }
});

// Admin: Send admin reply to user thread
router.post("/admin/reply/:userId", protect, admin, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { text } = req.body as { text?: string };

    const targetUser = await User.findById(userId);

    const replyMsg = await SupportMessage.create({
      user: userId,
      senderId: req.user!._id,
      senderName: "Support Admin",
      name: "Support Admin",
      email: targetUser ? targetUser.email : "admin@evefest.com",
      subject: "Support Response",
      category: "Admin Response",
      message: text || "Admin response",
      text: text || "Admin response",
      ticketCode: `REP-${Math.floor(100000 + Math.random() * 900000)}`,
      status: "Resolved",
      adminResponse: text || "",
    });

    res.status(201).json(replyMsg);
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
