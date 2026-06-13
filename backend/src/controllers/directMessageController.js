import DirectMessage from "../models/DirectMessage.js";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

/**
 * GET /api/direct-messages/event/:eventId
 * Retrieve direct support messages for an event.
 * If requesting user is the host: returns all direct messages for this event.
 * If requesting user is attendee: returns only direct messages between them and host.
 */
export const getDirectMessages = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    // Check if the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    const isHost = event.hostId.toString() === userId.toString();

    // Check if attendee (must have a booking)
    const booking = await Booking.findOne({ user: userId, event: eventId });
    
    if (!isHost && !booking) {
      return res.status(403).json({ message: "Only the host or registered attendees can access direct support messages." });
    }

    let messages;
    if (isHost) {
      // Host sees all direct messages for this event
      messages = await DirectMessage.find({ eventId }).sort({ createdAt: 1 });
    } else {
      // Attendee sees only their own conversation with the host
      messages = await DirectMessage.find({ eventId, attendeeId: userId }).sort({ createdAt: 1 });
    }

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/direct-messages/event/:eventId
 * Send a direct support message.
 */
export const sendDirectMessage = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { text, attendeeId: bodyAttendeeId, attendeeName: bodyAttendeeName } = req.body;
    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message content cannot be empty." });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    const isHost = event.hostId.toString() === userId.toString();
    
    let targetAttendeeId;
    let targetAttendeeName;

    if (isHost) {
      // Host is sending message to a specific attendee
      if (!bodyAttendeeId) {
        return res.status(400).json({ message: "Attendee ID is required when host sends a reply." });
      }
      targetAttendeeId = bodyAttendeeId;
      targetAttendeeName = bodyAttendeeName;
      if (!targetAttendeeName) {
        const attendee = await User.findById(targetAttendeeId);
        targetAttendeeName = attendee ? attendee.name : "Attendee";
      }
    } else {
      // Attendee is sending message to the host
      // Verify attendee has a booking
      const booking = await Booking.findOne({ user: userId, event: eventId });
      if (!booking) {
        return res.status(403).json({ message: "Only registered attendees can message the host." });
      }
      targetAttendeeId = userId;
      targetAttendeeName = req.user.name;
    }

    const newMessage = await DirectMessage.create({
      eventId,
      attendeeId: targetAttendeeId,
      attendeeName: targetAttendeeName,
      senderId: userId,
      senderName: req.user.name,
      text: text.trim(),
    });

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/direct-messages/seen/:eventId/:attendeeId
 * Mark all messages in a thread as seen.
 */
export const markThreadAsSeen = async (req, res, next) => {
  try {
    const { eventId, attendeeId } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    const isHost = event.hostId.toString() === userId.toString();

    // Only host or the attendee themselves can mark as seen
    if (!isHost && userId.toString() !== attendeeId.toString()) {
      return res.status(403).json({ message: "Not authorized to update seen status." });
    }

    // Mark messages as seen
    // If user is host, mark messages sent by attendee as seen
    // If user is attendee, mark messages sent by host as seen
    const query = {
      eventId,
      attendeeId,
      senderId: { $ne: userId },
      seen: false
    };

    await DirectMessage.updateMany(query, { $set: { seen: true } });

    res.status(200).json({ message: "Thread marked as seen." });
  } catch (error) {
    next(error);
  }
};
