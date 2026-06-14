import mongoose, { Document, Model, Schema } from "mongoose";

export interface IGroupChatMessage {
  eventId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroupChatMessageDocument extends IGroupChatMessage, Document {}
export interface IGroupChatMessageModel extends Model<IGroupChatMessageDocument> {}

const groupChatMessageSchema = new Schema<IGroupChatMessageDocument>(
  {
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
  },
  {
    timestamps: true,
  }
);

const GroupChatMessage = mongoose.model<
  IGroupChatMessageDocument,
  IGroupChatMessageModel
>("GroupChatMessage", groupChatMessageSchema);
export default GroupChatMessage;
