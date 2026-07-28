import { Request, Response, NextFunction } from "express";
import * as bookingService from "../services/bookingService";

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { eventId, paymentDetails, ticketCount } = req.body as {
      eventId?: string;
      paymentDetails?: unknown;
      ticketCount?: number;
    };

    if (!eventId) {
      res.status(400);
      return next(new Error("Event ID is required"));
    }

    const booking = await bookingService.createBooking(
      eventId,
      req.user!._id.toString(),
      paymentDetails,
      ticketCount || 1
    );

    res.status(201).json(booking);
  } catch (error) {
    const err = error as Error;
    if (
      err.message.includes("available") ||
      err.message.includes("maximum") ||
      err.message.includes("Payment")
    ) {
      res.status(400);
    } else if (err.message === "Event not found") {
      res.status(404);
    } else {
      res.status(500);
    }
    next(error);
  }
};

export const getUserBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookings = await bookingService.getUserBookings(
      req.user!._id.toString()
    );
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

export const cancelBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await bookingService.cancelBooking(
      String(req.params.id),
      req.user!._id.toString()
    );
    res.status(200).json(result);
  } catch (error) {
    const err = error as Error;
    if (err.message.includes("not authorized")) {
      res.status(403);
    } else if (err.message.includes("not found")) {
      res.status(404);
    } else {
      res.status(400);
    }
    next(error);
  }
};
