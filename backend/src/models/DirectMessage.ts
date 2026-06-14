import mongoose, { Document, Model, Schema } from "mongoose";

export interface IDirectMessage {
  eventId: mongoose.Types.ObjectId;
  attendeeId: mongoose.Types.ObjectId;
  attendeeName: string;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  text: string;
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDirectMessageDocument extends IDirectMessage, Document {}
export interface IDirectMessageModel extends Model<IDirectMessageDocument> {}

const directMessageSchema = new Schema<IDirectMessageDocument>(
  {
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
  },
  {
    timestamps: true,
  }
);

const DirectMessage = mongoose.model<IDirectMessageDocument, IDirectMessageModel>(
  "DirectMessage",
  directMessageSchema
);
export default DirectMessage;
