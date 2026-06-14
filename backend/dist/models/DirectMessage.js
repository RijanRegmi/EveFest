import mongoose, { Schema } from "mongoose";
const directMessageSchema = new Schema({
    eventId: {
        type: Schema.Types.ObjectId,
        ref: "Event",
        required: true,
        index: true,
    },
    attendeeId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    attendeeName: {
        type: String,
        required: true,
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    senderName: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: [true, "Message content is required"],
        trim: true,
    },
    seen: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const DirectMessage = mongoose.model("DirectMessage", directMessageSchema);
export default DirectMessage;
//# sourceMappingURL=DirectMessage.js.map