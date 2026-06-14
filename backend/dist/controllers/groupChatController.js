import GroupChatMessage from "../models/GroupChatMessage.js";
import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
/**
 * GET /api/chat/:eventId
 * Returns all group chat messages for an event.
 * Requires: user must be a registered attendee (have a booking for this event) or the event host.
 */
export const getGroupMessages = async (req, res) => {
    try {
        const { eventId } = req.params;
        const booking = await Booking.findOne({
            user: req.user._id,
            event: eventId,
        });
        let isHost = false;
        if (!booking) {
            const event = await Event.findById(eventId);
            if (event &&
                (event.hostId?.toString() === req.user._id.toString() ||
                    String(event.hostId) === String(req.user._id))) {
                isHost = true;
            }
        }
        if (!booking && !isHost) {
            res.status(403).json({
                message: "Only registered attendees or the event host can view group chat.",
            });
            return;
        }
        const messages = await GroupChatMessage.find({ eventId })
            .sort({ createdAt: 1 })
            .limit(200);
        res.json(messages);
    }
    catch (error) {
        console.error("[GroupChat] getGroupMessages error:", error);
        res.status(500).json({ message: "Server error fetching group chat." });
    }
};
/**
 * POST /api/chat/:eventId
 * Send a group chat message.
 * Requires: user must be a registered attendee or the event host.
 */
export const sendGroupMessage = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { text } = req.body;
        if (!text || !text.trim()) {
            res.status(400).json({ message: "Message text is required." });
            return;
        }
        const booking = await Booking.findOne({
            user: req.user._id,
            event: eventId,
        });
        let isHost = false;
        if (!booking) {
            const event = await Event.findById(eventId);
            if (event &&
                (event.hostId?.toString() === req.user._id.toString() ||
                    String(event.hostId) === String(req.user._id))) {
                isHost = true;
            }
        }
        if (!booking && !isHost) {
            res.status(403).json({
                message: "Only registered attendees or the event host can send messages.",
            });
            return;
        }
        const message = await GroupChatMessage.create({
            eventId,
            senderId: req.user._id,
            senderName: req.user.name,
            text: text.trim(),
        });
        res.status(201).json(message);
    }
    catch (error) {
        console.error("[GroupChat] sendGroupMessage error:", error);
        res.status(500).json({ message: "Server error sending message." });
    }
};
//# sourceMappingURL=groupChatController.js.map