import express from "express";
import SupportMessage from "../models/SupportMessage.js";
import User from "../models/User.js";
import { protect } from "../middlewares/authMiddleware.js";
import { admin } from "../middlewares/adminMiddleware.js";

const router = express.Router();

// Apply authentication to all support chat endpoints
router.use(protect);

// 1. Fetch current user's support messages (for regular users)
router.get("/", async (req, res, next) => {
  try {
    const messages = await SupportMessage.find({ userId: req.user._id }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
});

// 2. Send support message (user side)
router.post("/", async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message content cannot be empty" });
    }

    const newMessage = await SupportMessage.create({
      userId: req.user._id,
      senderId: req.user._id,
      senderName: req.user.name,
      text: text.trim(),
    });

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
});

// 3. Fetch all active support threads (admin only)
router.get("/admin/threads", admin, async (req, res, next) => {
  try {
    // Group support messages by userId to find all unique user conversations
    const threadUserIds = await SupportMessage.distinct("userId");
    
    // Fetch user details for each thread owner and their latest message
    const threads = await Promise.all(
      threadUserIds.map(async (userId) => {
        const userDetails = await User.findById(userId).select("name email username");
        const latestMessage = await SupportMessage.findOne({ userId })
          .sort({ createdAt: -1 })
          .select("text createdAt");
        
        return {
          userId,
          user: userDetails || { name: "Deleted User", email: "N/A" },
          latestMessage: latestMessage || { text: "", createdAt: new Date() },
        };
      })
    );

    // Sort threads by the latest message timestamp descending
    threads.sort((a, b) => b.latestMessage.createdAt - a.latestMessage.createdAt);

    res.status(200).json(threads);
  } catch (error) {
    next(error);
  }
});

// 4. Fetch specific thread logs (admin only)
router.get("/admin/threads/:userId", admin, async (req, res, next) => {
  try {
    const messages = await SupportMessage.find({ userId: req.params.userId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
});

// 5. Send support reply (admin side replying to user thread)
router.post("/admin/reply/:userId", admin, async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Reply message cannot be empty" });
    }

    const newMessage = await SupportMessage.create({
      userId: req.params.userId,
      senderId: req.user._id,
      senderName: `Support Admin (${req.user.name})`,
      text: text.trim(),
    });

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
});

export default router;
