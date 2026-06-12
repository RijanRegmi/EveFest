import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
  }
);

// Populate event details when querying bookings automatically
bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: "event",
    select: "title date time price location isOnline",
  });
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
