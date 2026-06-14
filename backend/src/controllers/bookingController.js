import * as bookingService from "../services/bookingService.js";

export const createBooking = async (req, res, next) => {
  try {
    const { eventId, paymentDetails, ticketCount } = req.body;
    const booking = await bookingService.createBooking(eventId, req.user._id, paymentDetails, ticketCount);
    res.status(201).json(booking);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const result = await bookingService.cancelBooking(bookingId, req.user._id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400);
    next(error);
  }
};
