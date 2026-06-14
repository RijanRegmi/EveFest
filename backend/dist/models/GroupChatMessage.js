import mongoose, { Schema } from "mongoose";
const groupChatMessageSchema = new Schema({
    eventId: {
        type: Schema.Types.ObjectId,
        ref: "Event",
        required: true,
        index: true,
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    senderName: {
        type: String,
        required: true,
        trim: true,
    },
    text: {
        type: String,
        required: [true, "Message content is required"],
        trim: true,
        maxlength: 1000,
    },
}, {
    timestamps: true,
});
const GroupChatMessage = mongoose.model("GroupChatMessage", groupChatMessageSchema);
export default GroupChatMessage;
//# sourceMappingURL=GroupChatMessage.js.map