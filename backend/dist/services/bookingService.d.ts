import mongoose from "mongoose";
import { IBookingDocument } from "../models/Booking.js";
export declare const createBooking: (eventId: string, userId: string | mongoose.Types.ObjectId, paymentDetails: unknown, ticketCount?: number) => Promise<IBookingDocument | IBookingDocument[]>;
export declare const cancelBooking: (bookingId: string, userId: string | mongoose.Types.ObjectId) => Promise<{
    success: boolean;
}>;
export declare const getUserBookings: (userId: string | mongoose.Types.ObjectId) => Promise<IBookingDocument[]>;
//# sourceMappingURL=bookingService.d.ts.map