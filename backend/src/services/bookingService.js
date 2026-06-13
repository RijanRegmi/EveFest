import Booking from "../models/Booking.js";
import Event from "../models/Event.js";

export const createBooking = async (eventId, userId, paymentDetails) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  // 1. Capacity Validation
  if (event.limit !== "unlimited" && event.registeredCount >= event.limit) {
    throw new Error("This event is fully booked");
  }

  // 3. Paid Event Verification
  if (event.price > 0 && !paymentDetails) {
    throw new Error("Payment details are required for paid events");
  }

  // Generate unique Ticket Code
  const ticketCode = `EVF-${Math.floor(100000 + Math.random() * 900000)}`;

  // Create Booking
  const booking = await Booking.create({
    user: userId,
    event: eventId,
    paymentStatus: event.price > 0 ? "Paid" : "Free",
    ticketCode,
  });

  // Increment registeredCount on the Event (Heuristic 1: System Status Updates)
  event.registeredCount = (event.registeredCount || 0) + 1;
  await event.save();

  return booking;
};

export const cancelBooking = async (bookingId, userId) => {
  const booking = await Booking.findOne({ _id: bookingId, user: userId });
  if (!booking) {
    throw new Error("Booking not found or not authorized to cancel");
  }

  const eventId = booking.event._id;

  // Delete Booking
  await Booking.deleteOne({ _id: bookingId });

  // Decrement registeredCount on the Event (Heuristic 3: User Control)
  const event = await Event.findById(eventId);
  if (event) {
    event.registeredCount = Math.max(0, (event.registeredCount || 1) - 1);
    await event.save();
  }

  return { success: true };
};

export const getUserBookings = async (userId) => {
  return await Booking.find({ user: userId });
};
