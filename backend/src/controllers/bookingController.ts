import { Request, Response, NextFunction } from "express";
import * as bookingService from "../services/bookingService.js";

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { eventId, paymentDetails, ticketCount } = req.body as {
      eventId: string;
      paymentDetails: unknown;
      ticketCount?: number;
    };
    const booking = await bookingService.createBooking(
      eventId,
      req.user!._id.toString(),
      paymentDetails,
      ticketCount
    );
    res.status(201).json(booking);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

export const cancelBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookingId = String(req.params.id);
    const result = await bookingService.cancelBooking(
      bookingId,
      req.user!._id.toString()
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400);
    next(error);
  }
};
