import mongoose from "mongoose";
import Event, { IEventDocument } from "../models/Event.js";

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

export const getAllEvents = async (): Promise<IEventDocument[]> => {
  return await Event.find({}).sort({ createdAt: -1 });
};

export const createEvent = async (
  eventData: EventData,
  userId: mongoose.Types.ObjectId | string,
  userName: string
): Promise<IEventDocument> => {
  const {
    title,
    description,
    date,
    time,
    price,
    limit,
    isOnline,
    location,
    mapLink,
    locationDescription,
    image,
    logo,
    category,
    proofDocName,
    rules,
  } = eventData;

  const event = new Event({
    title,
    description,
    date,
    time,
    price: Number(price || 0),
    limit: limit === "unlimited" ? "unlimited" : Number(limit || 50),
    isOnline: isOnline === "true" || isOnline === true,
    location: isOnline ? "Zoom Video Conferencing" : location,
    mapLink: isOnline ? "https://zoom.us/j/meeting" : mapLink,
    locationDescription,
    image,
    logo: logo || "",
    category,
    hostName: userName,
    hostId: userId,
    proofDoc: proofDocName || null,
    rules: rules || "",
    maxSeatsPerUser: Number(eventData.maxSeatsPerUser || 5),
  });

  return await event.save();
};

export const getEventById = async (
  eventId: string
): Promise<IEventDocument | null> => {
  return await Event.findById(eventId);
};

export const updateEvent = async (
  eventId: string,
  userId: mongoose.Types.ObjectId | string,
  updateData: EventData
): Promise<IEventDocument> => {
  const event = await Event.findById(eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  if (event.hostId.toString() !== userId.toString()) {
    throw new Error("You are not authorized to edit this event");
  }

  const allowedFields = [
    "title",
    "description",
    "date",
    "time",
    "price",
    "limit",
    "isOnline",
    "location",
    "mapLink",
    "locationDescription",
    "image",
    "logo",
    "category",
    "rules",
    "maxSeatsPerUser",
  ] as const;

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      (event as unknown as Record<string, unknown>)[field] = updateData[field];
    }
  });

  if (updateData.price !== undefined)
    event.price = Number(updateData.price || 0);
  if (updateData.limit !== undefined) {
    event.limit =
      updateData.limit === "unlimited"
        ? "unlimited"
        : Number(updateData.limit);
  }
  if (updateData.isOnline !== undefined) {
    event.isOnline =
      updateData.isOnline === "true" || updateData.isOnline === true;
  }
  if (updateData.maxSeatsPerUser !== undefined) {
    event.maxSeatsPerUser = Number(updateData.maxSeatsPerUser || 5);
  }

  return await event.save();
};

export const deleteEvent = async (
  eventId: string,
  userId: mongoose.Types.ObjectId | string
): Promise<{ success: boolean }> => {
  const event = await Event.findById(eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  if (event.hostId.toString() !== userId.toString()) {
    throw new Error("You are not authorized to delete this event");
  }

  await Event.findByIdAndDelete(eventId);
  return { success: true };
};
