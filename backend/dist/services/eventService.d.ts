import mongoose from "mongoose";
import { IEventDocument } from "../models/Event.js";
interface EventData {
    title?: string;
    description?: string;
    date?: string;
    time?: string;
    price?: string | number;
    limit?: string | number;
    isOnline?: string | boolean;
    location?: string;
    mapLink?: string;
    locationDescription?: string;
    image?: string;
    logo?: string;
    category?: string;
    proofDocName?: string;
    rules?: string;
    maxSeatsPerUser?: string | number;
    [key: string]: unknown;
}
export declare const getAllEvents: () => Promise<IEventDocument[]>;
export declare const createEvent: (eventData: EventData, userId: mongoose.Types.ObjectId | string, userName: string) => Promise<IEventDocument>;
export declare const getEventById: (eventId: string) => Promise<IEventDocument | null>;
export declare const updateEvent: (eventId: string, userId: mongoose.Types.ObjectId | string, updateData: EventData) => Promise<IEventDocument>;
export declare const deleteEvent: (eventId: string, userId: mongoose.Types.ObjectId | string) => Promise<{
    success: boolean;
}>;
export {};
//# sourceMappingURL=eventService.d.ts.map