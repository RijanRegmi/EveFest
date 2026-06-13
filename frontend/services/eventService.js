import { request, uploadRequest, uploadPutRequest } from "./api";
import { INITIAL_MOCK_EVENTS } from "../data/mockEvents";

// LocalStorage Database Helpers
const getLocalEvents = () => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("mock_events");
  if (!stored) {
    localStorage.setItem("mock_events", JSON.stringify(INITIAL_MOCK_EVENTS));
    return INITIAL_MOCK_EVENTS;
  }
  return JSON.parse(stored);
};

const saveLocalEvents = (events) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("mock_events", JSON.stringify(events));
};

const getLocalBookings = () => {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("mock_bookings") || "[]");
};

const saveLocalBookings = (bookings) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("mock_bookings", JSON.stringify(bookings));
};

// Services API Methods
export async function fetchEvents() {
  try {
    return await request("/events");
  } catch (error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      return getLocalEvents();
    }
    throw error;
  }
}

export async function createEventApi(eventData, token) {
  try {
    // If eventData is already FormData (file upload), use uploadRequest
    if (eventData instanceof FormData) {
      return await uploadRequest("/events", eventData);
    }
    return await request("/events", {
      method: "POST",
      body: eventData,
    });
  } catch (error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      // Offline fallback
      const events = getLocalEvents();
      const hostId = token.replace("mock_token_", "");
      const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
      const host = mockUsers.find((u) => u._id === hostId) || { name: "Guest Host" };

      let proofDocName = null;
      if (eventData instanceof FormData) {
        proofDocName = eventData.get("proofDocName") || null;
      } else if (eventData.proofDoc) {
        proofDocName = eventData.proofDocName || "Uploaded_Document.pdf";
      }

      // Extract image / logo from FormData or plain object
      const imageVal = eventData instanceof FormData
        ? (eventData.get("bannerPreview") || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop")
        : (eventData.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop");

      const logoVal = eventData instanceof FormData
        ? (eventData.get("logoPreview") || "")
        : (eventData.logo || "");

      const rulesVal = eventData instanceof FormData
        ? (eventData.get("rules") || "")
        : (eventData.rules || "");

      const newEvent = {
        _id: `evt_${Date.now()}`,
        title: eventData instanceof FormData ? eventData.get("title") : eventData.title,
        description: eventData instanceof FormData ? eventData.get("description") : eventData.description,
        date: eventData instanceof FormData ? eventData.get("date") : eventData.date,
        time: eventData instanceof FormData ? eventData.get("time") : eventData.time,
        price: Number((eventData instanceof FormData ? eventData.get("price") : eventData.price) || 0),
        limit: (() => {
          const l = eventData instanceof FormData ? eventData.get("limit") : eventData.limit;
          return l === "unlimited" ? "unlimited" : Number(l || 50);
        })(),
        registeredCount: 0,
        isOnline: (eventData instanceof FormData ? eventData.get("isOnline") : eventData.isOnline) === "true" || false,
        location: eventData instanceof FormData ? eventData.get("location") : eventData.location,
        mapLink: eventData instanceof FormData ? (eventData.get("mapLink") || "") : (eventData.mapLink || ""),
        locationDescription: eventData instanceof FormData ? (eventData.get("locationDescription") || "") : (eventData.locationDescription || ""),
        image: imageVal,
        logo: logoVal,
        category: eventData instanceof FormData ? (eventData.get("category") || "General") : (eventData.category || "General"),
        hostName: host.name,
        hostId: hostId,
        proofDoc: proofDocName,
        rules: rulesVal,
      };

      events.unshift(newEvent);
      saveLocalEvents(events);
      return newEvent;
    }
    throw error;
  }
}

export async function updateEventApi(eventId, eventData, token) {
  try {
    if (eventData instanceof FormData) {
      return await uploadPutRequest(`/events/${eventId}`, eventData);
    }
    return await request(`/events/${eventId}`, {
      method: "PUT",
      body: eventData,
    });
  } catch (error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      // Offline fallback
      const events = getLocalEvents();
      const idx = events.findIndex((e) => e._id === eventId);
      if (idx === -1) throw new Error("Event not found");

      const getData = (key) => eventData instanceof FormData ? eventData.get(key) : eventData[key];

      const updatedEvent = {
        ...events[idx],
        title: getData("title") ?? events[idx].title,
        description: getData("description") ?? events[idx].description,
        date: getData("date") ?? events[idx].date,
        time: getData("time") ?? events[idx].time,
        price: Number(getData("price") ?? events[idx].price),
        category: getData("category") ?? events[idx].category,
        isOnline: getData("isOnline") === "true" || getData("isOnline") === true || events[idx].isOnline,
        location: getData("location") ?? events[idx].location,
        mapLink: getData("mapLink") ?? events[idx].mapLink,
        locationDescription: getData("locationDescription") ?? events[idx].locationDescription,
        rules: getData("rules") ?? events[idx].rules,
        logo: getData("logoPreview") ?? events[idx].logo,
        image: getData("bannerPreview") ?? events[idx].image,
      };

      const limitVal = getData("limit");
      if (limitVal !== null) {
        updatedEvent.limit = limitVal === "unlimited" ? "unlimited" : Number(limitVal);
      }

      events[idx] = updatedEvent;
      saveLocalEvents(events);
      return updatedEvent;
    }
    throw error;
  }
}

export async function deleteEventApi(eventId, token) {
  try {
    return await request(`/events/${eventId}`, { method: "DELETE" });
  } catch (error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      const events = getLocalEvents();
      const idx = events.findIndex((e) => e._id === eventId);
      if (idx === -1) throw new Error("Event not found");
      events.splice(idx, 1);
      saveLocalEvents(events);
      return { success: true };
    }
    throw error;
  }
}

export async function bookEventApi(eventId, paymentDetails, token) {
  try {
    return await request(`/bookings`, {
      method: "POST",
      body: { eventId, paymentDetails },
    });
  } catch (error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      const events = getLocalEvents();
      const bookings = getLocalBookings();
      const eventIdx = events.findIndex((e) => e._id === eventId);
      
      if (eventIdx === -1) throw new Error("Event not found (Local Database Mode)");

      const event = events[eventIdx];
      if (event.limit !== "unlimited" && event.registeredCount >= event.limit) {
        throw new Error("This event is fully booked!");
      }

      const userId = token.replace("mock_token_", "");
      const alreadyBooked = bookings.some((b) => b.event._id === eventId && b.user === userId);
      if (alreadyBooked) throw new Error("You have already registered for this event!");

      event.registeredCount = (event.registeredCount || 0) + 1;
      events[eventIdx] = event;
      saveLocalEvents(events);

      const newBooking = {
        _id: `booking_${Date.now()}`,
        user: userId,
        event: {
          _id: event._id,
          title: event.title,
          date: event.date,
          time: event.time,
          price: event.price,
          location: event.location,
          isOnline: event.isOnline,
        },
        paymentStatus: event.price > 0 ? "Paid" : "Free",
        ticketCode: `EVF-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toISOString(),
      };

      bookings.push(newBooking);
      saveLocalBookings(bookings);
      return newBooking;
    }
    throw error;
  }
}

export async function cancelBookingApi(bookingId, token) {
  try {
    return await request(`/bookings/${bookingId}`, { method: "DELETE" });
  } catch (error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      const bookings = getLocalBookings();
      const bookingIdx = bookings.findIndex((b) => b._id === bookingId);
      if (bookingIdx === -1) throw new Error("Booking not found");

      const booking = bookings[bookingIdx];
      const events = getLocalEvents();
      const eventIdx = events.findIndex((e) => e._id === booking.event._id);
      if (eventIdx !== -1) {
        events[eventIdx].registeredCount = Math.max(0, (events[eventIdx].registeredCount || 1) - 1);
        saveLocalEvents(events);
      }

      bookings.splice(bookingIdx, 1);
      saveLocalBookings(bookings);
      return { success: true };
    }
    throw error;
  }
}

export async function fetchEventById(id) {
  try {
    return await request(`/events/${id}`);
  } catch (error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      const localEvents = getLocalEvents();
      const event = localEvents.find((e) => e._id === id);
      if (!event) throw new Error("Event not found");
      return event;
    }
    throw error;
  }
}
