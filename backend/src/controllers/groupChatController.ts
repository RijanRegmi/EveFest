import { Request, Response, NextFunction } from "express";
import GroupChatMessage from "../models/GroupChatMessage";
import Booking from "../models/Booking";
import Event from "../models/Event";

export const getGroupChatMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { eventId } = req.params;
    const userId = req.user!._id;

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404);
      return next(new Error("Event not found"));
    }

    const isHost = event.hostId.toString() === userId.toString();
    const hasBooking = await Booking.findOne({ user: userId, event: eventId });

    if (!isHost && !hasBooking) {
      res.status(403);
      return next(new Error("Access denied. You must be registered for this event to access the group chat."));
    }

    const messages = await GroupChatMessage.find({
      $or: [{ eventId: eventId }, { event: eventId }],
    })
      .sort({ createdAt: 1 })
      .limit(100);

    res.status(200).json(messages);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

export const postGroupChatMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { text } = req.body as { text?: string };
    const user = req.user!;

    if (!text || text.trim() === "") {
      res.status(400);
      return next(new Error("Message text cannot be empty"));
    }

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404);
      return next(new Error("Event not found"));
    }

    const isHost = event.hostId.toString() === user._id.toString();
    const hasBooking = await Booking.findOne({ user: user._id, event: eventId });

    if (!isHost && !hasBooking) {
      res.status(403);
      return next(new Error("Access denied. You must be registered for this event to post in the group chat."));
    }

    const message = await GroupChatMessage.create({
      eventId: eventId,
      senderId: user._id,
      senderName: user.name || user.username || "Attendee",
      text: text.trim(),
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500);
    next(error);
  }
};
