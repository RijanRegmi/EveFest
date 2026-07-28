import express from "express";
import DirectMessage from "../models/DirectMessage";
import User from "../models/User";
import { protect } from "../middlewares/authMiddleware";
import {
  getDirectMessages,
  sendDirectMessage,
  getConversations,
} from "../controllers/directMessageController";

const router = express.Router();

// List user conversations
router.get("/conversations", protect, getConversations);

// Mark direct messages seen
router.put("/seen/:eventId/:attendeeId", protect, async (req, res, next) => {
  try {
    const { eventId, attendeeId } = req.params;
    await DirectMessage.updateMany(
      { eventId, attendeeId, senderId: { $ne: req.user!._id } },
      { $set: { seen: true } }
    );
    res.status(200).json({ message: "Messages marked as seen" });
  } catch (error) {
    res.status(500);
    next(error);
  }
});

// Event-specific host support chat endpoints (matches frontend /api/direct-messages/event/:eventId)
router.get(["/event/:eventId", "/:otherUserId"], protect, async (req, res, next) => {
  try {
    const currentUserId = req.user!._id.toString();
    const { eventId, otherUserId } = req.params;
    const targetId = eventId || otherUserId;

    const messages = await DirectMessage.find({
      $or: [
        { eventId: targetId },
        { senderId: currentUserId, attendeeId: targetId },
        { senderId: targetId, attendeeId: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500);
    next(error);
  }
});

router.post(["/event/:eventId", "/:otherUserId"], protect, async (req, res, next) => {
  try {
    const sender = req.user!;
    const { eventId, otherUserId } = req.params;
    const targetId = eventId || otherUserId;

    const { text, attendeeId, attendeeName } = req.body as {
      text?: string;
      attendeeId?: string;
      attendeeName?: string;
    };

    if (!text || text.trim() === "") {
      res.status(400);
      return next(new Error("Message text cannot be empty"));
    }

    let recipientId = attendeeId;
    let recipientName = attendeeName || "Host";

    if (!recipientId && targetId) {
      const targetUser = await User.findById(targetId);
      if (targetUser) {
        recipientId = targetUser._id.toString();
        recipientName = targetUser.name;
      }
    }

    const message = await DirectMessage.create({
      eventId: targetId,
      senderId: sender._id,
      senderName: sender.name,
      attendeeId: recipientId || sender._id,
      attendeeName: recipientName,
      text: text.trim(),
      seen: false,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500);
    next(error);
  }
});

export default router;
