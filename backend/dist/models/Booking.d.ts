import mongoose, { Document, Model } from "mongoose";
export interface IBooking {
    user: mongoose.Types.ObjectId;
    event: mongoose.Types.ObjectId;
    paymentStatus: "Paid" | "Free";
    ticketCode: string;
    userName?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IBookingDocument extends IBooking, Document {
}
export interface IBookingModel extends Model<IBookingDocument> {
}
declare const Booking: IBookingModel;
export default Booking;
//# sourceMappingURL=Booking.d.ts.map