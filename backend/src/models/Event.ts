import mongoose, { Document, Model, Schema } from "mongoose";
import { IUserDocument } from "./User.js";

export interface IEvent {
  title: string;
  description: string;
  date: string;
  time: string;
  price: number;
  limit: number | "unlimited";
  registeredCount: number;
  isOnline: boolean;
  location: string;
  mapLink: string;
  locationDescription: string;
  image: string;
  category: string;
  hostName: string;
  hostId: mongoose.Types.ObjectId | IUserDocument;
  proofDoc: string | null;
  rules: string;
  logo: string;
  isTakedown: boolean;
  maxSeatsPerUser: number;
  takedownReason: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEventDocument extends IEvent, Document {}
export interface IEventModel extends Model<IEventDocument> {}

const eventSchema = new Schema<IEventDocument>(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    date: {
      type: String, // stored as YYYY-MM-DD
      required: [true, "Date is required"],
    },
    time: {
      type: String, // stored as "10:00 AM - 01:00 PM"
      required: [true, "Time range is required"],
    },
    price: {
      type: Number,
      default: 0,
    },
    limit: {
      type: Schema.Types.Mixed, // 'unlimited' or Number
      default: "unlimited",
    },
    registeredCount: {
      type: Number,
      default: 0,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      required: [true, "Venue/Location name is required"],
    },
    mapLink: {
      type: String,
      default: "",
    },
    locationDescription: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop",
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    hostName: {
      type: String,
      required: true,
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    proofDoc: {
      type: String, // filename of uploaded document
      default: null,
    },
    rules: {
      type: String, // event rules / code of conduct
      default: "",
    },
    logo: {
      type: String, // URL to event/organizer logo
      default: "",
    },
    isTakedown: {
      type: Boolean,
      default: false,
    },
    maxSeatsPerUser: {
      type: Number,
      default: 5,
      min: [1, "Maximum seats per user must be at least 1"],
    },
    takedownReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model<IEventDocument, IEventModel>("Event", eventSchema);
export default Event;
