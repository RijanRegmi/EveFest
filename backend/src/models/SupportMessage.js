import mongoose from "mongoose";

const supportMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
  }
);

const SupportMessage = mongoose.model("SupportMessage", supportMessageSchema);
export default SupportMessage;
