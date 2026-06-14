import mongoose, { Schema } from "mongoose";
const bookingSchema = new Schema({
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
}, {
    timestamps: true,
});
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
//# sourceMappingURL=Booking.js.map