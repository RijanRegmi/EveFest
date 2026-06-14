import Booking from "../models/Booking.js";
import Event from "../models/Event.js";

export const createBooking = async (eventId, userId, paymentDetails, ticketCount = 1) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  const count = Number(ticketCount) || 1;
  if (count < 1) {
    throw new Error("Ticket count must be at least 1");
  }

  // 1. Capacity Validation
  if (event.limit !== "unlimited" && (event.registeredCount || 0) + count > event.limit) {
    const remaining = Math.max(0, event.limit - (event.registeredCount || 0));
    throw new Error(`Only ${remaining} tickets/seats are available for this event.`);
  }

  // 2. Max Seats Per User Limitation check
  const maxSeats = event.maxSeatsPerUser || 5;
  const existingBookingsCount = await Booking.countDocuments({ user: userId, event: eventId });
  if (existingBookingsCount + count > maxSeats) {
    throw new Error(`You can only book a maximum of ${maxSeats} seats for this event. You already have ${existingBookingsCount} seat(s) booked.`);
  }

  // 3. Paid Event Verification
  if (event.price > 0 && !paymentDetails) {
    throw new Error("Payment details are required for paid events");
  }

  const createdBookings = [];

  for (let i = 0; i < count; i++) {
    // Generate unique Ticket Code
    const ticketCode = `EVF-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create Booking
    const booking = await Booking.create({
      user: userId,
      event: eventId,
      paymentStatus: event.price > 0 ? "Paid" : "Free",
      ticketCode,
    });
    createdBookings.push(booking);
  }

  // Increment registeredCount on the Event
  event.registeredCount = (event.registeredCount || 0) + count;
  await event.save();

  // Return the created bookings (array or single document if count === 1)
  return count === 1 ? createdBookings[0] : createdBookings;
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
