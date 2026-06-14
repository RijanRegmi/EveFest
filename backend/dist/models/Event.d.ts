import mongoose, { Document, Model } from "mongoose";
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
export interface IEventDocument extends IEvent, Document {
}
export interface IEventModel extends Model<IEventDocument> {
}
declare const Event: IEventModel;
export default Event;
//# sourceMappingURL=Event.d.ts.map