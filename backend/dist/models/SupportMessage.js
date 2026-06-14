import mongoose, { Schema } from "mongoose";
const supportMessageSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
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
}, {
    timestamps: true,
});
const SupportMessage = mongoose.model("SupportMessage", supportMessageSchema);
export default SupportMessage;
//# sourceMappingURL=SupportMessage.js.map