import Event from "../models/Event.js";

export const getAllEvents = async () => {
  // Return all events, sorted by newest first
  return await Event.find({}).sort({ createdAt: -1 });
};

export const createEvent = async (eventData, userId, userName) => {
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
    category,
    proofDocName,
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
    category,
    hostName: userName,
    hostId: userId,
    proofDoc: proofDocName || null,
  });

  return await event.save();
};
