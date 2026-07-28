import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISupportMessage {
  user?: mongoose.Types.ObjectId | string | null;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  ticketCode: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISupportMessageDocument extends ISupportMessage, Document {}
export interface ISupportMessageModel extends Model<ISupportMessageDocument> {}

const supportMessageSchema = new Schema<ISupportMessageDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "General Query",
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    ticketCode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    adminResponse: {
      type: String,
      default: "",
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
