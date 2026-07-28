import mongoose, { Schema, Document } from "mongoose";
import { IUserDocument } from "./User";

export interface IEventDocument extends Document {
  title: string;
  description: string;
  date: string;
  time: string;
  price: number;
  limit: number | "unlimited";
  registeredCount: number;
  isOnline: boolean;
  location?: string;
  mapLink?: string;
  locationDescription?: string;
  image?: string;
  logo?: string;
  category: string;
  hostName: string;
  hostId: mongoose.Types.ObjectId | IUserDocument;
  proofDoc?: string | null;
  rules?: string;
  maxSeatsPerUser?: number;
  isTakedown?: boolean;
  takedownReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEventDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    price: { type: Number, default: 0 },
    limit: { type: Schema.Types.Mixed, default: 50 },
    registeredCount: { type: Number, default: 0 },
    isOnline: { type: Boolean, default: false },
    location: { type: String },
    mapLink: { type: String },
    locationDescription: { type: String },
    image: { type: String },
    logo: { type: String, default: "" },
    category: { type: String, required: true },
    hostName: { type: String, required: true },
    hostId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    proofDoc: { type: String, default: null },
    rules: { type: String, default: "" },
    maxSeatsPerUser: { type: Number, default: 5 },
    isTakedown: { type: Boolean, default: false },
    takedownReason: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Event ||
  mongoose.model<IEventDocument>("Event", eventSchema);
