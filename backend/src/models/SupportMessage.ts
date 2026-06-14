import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISupportMessage {
  userId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISupportMessageDocument extends ISupportMessage, Document {}
export interface ISupportMessageModel extends Model<ISupportMessageDocument> {}

const supportMessageSchema = new Schema<ISupportMessageDocument>(
  {
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
  },
  {
    timestamps: true,
  }
);

const SupportMessage = mongoose.model<ISupportMessageDocument, ISupportMessageModel>(
  "SupportMessage",
  supportMessageSchema
);
export default SupportMessage;
