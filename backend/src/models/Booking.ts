import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBooking {
  user: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  paymentStatus: "Paid" | "Free";
  ticketCode: string;
  userName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBookingDocument extends IBooking, Document {}
export interface IBookingModel extends Model<IBookingDocument> {}

const bookingSchema = new Schema<IBookingDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Free"],
      required: true,
    },
    ticketCode: {
      type: String,
      required: true,
      unique: true,
    },
    userName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Populate event details when querying bookings automatically
bookingSchema.pre(/^find/, function (next) {
  (this as mongoose.Query<unknown, IBookingDocument>).populate({
    path: "event",
    select: "title date time price location isOnline",
  });
  next();
});

const Booking = mongoose.model<IBookingDocument, IBookingModel>(
  "Booking",
  bookingSchema
);
export default Booking;
