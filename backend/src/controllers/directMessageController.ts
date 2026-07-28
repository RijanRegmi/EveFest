import { Request, Response, NextFunction } from "express";
import DirectMessage from "../models/DirectMessage";
import User from "../models/User";

export const getDirectMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUserId = req.user!._id.toString();
    const { otherUserId } = req.params;

    const messages = await DirectMessage.find({
      $or: [
        { senderId: currentUserId, attendeeId: otherUserId },
        { senderId: otherUserId, attendeeId: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

export const sendDirectMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sender = req.user!;
    const { otherUserId } = req.params;
    const { text, eventId } = req.body as { text?: string; eventId?: string };

    if (!text || text.trim() === "") {
      res.status(400);
      return next(new Error("Message text cannot be empty"));
    }

    const recipient = await User.findById(otherUserId);
    if (!recipient) {
      res.status(404);
      return next(new Error("Recipient user not found"));
    }

    const message = await DirectMessage.create({
      eventId: eventId || sender._id,
      senderId: sender._id,
      senderName: sender.name,
      attendeeId: recipient._id,
      attendeeName: recipient.name,
      text: text.trim(),
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

export const getConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUserId = req.user!._id;

    const messages = await DirectMessage.find({
      $or: [{ senderId: currentUserId }, { attendeeId: currentUserId }],
    }).sort({ createdAt: -1 });

    const conversationsMap = new Map<string, { otherUserId: string; otherUserName: string; lastMessage: string; updatedAt: Date }>();

    for (const msg of messages) {
      const isSender = msg.senderId.toString() === currentUserId.toString();
      const otherUserId = isSender ? msg.attendeeId.toString() : msg.senderId.toString();
      const otherUserName = isSender ? msg.attendeeName : msg.senderName;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          otherUserId,
          otherUserName,
          lastMessage: msg.text,
          updatedAt: msg.createdAt,
        });
      }
    }

    res.status(200).json(Array.from(conversationsMap.values()));
  } catch (error) {
    res.status(500);
    next(error);
  }
};
