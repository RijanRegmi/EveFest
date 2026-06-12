import { request } from "./api";
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
      // Offline fallback
      return getLocalEvents();
    }
    throw error;
  }
}

export async function createEventApi(eventData, token) {
  try {
    return await request("/events", {
      method: "POST",
      body: eventData,
    });
  } catch (error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      // Offline fallback
      const events = getLocalEvents();
      
      // Decode user ID from token
      const hostId = token.replace("mock_token_", "");
      const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
      const host = mockUsers.find((u) => u._id === hostId) || { name: "Guest Host" };

      // Handle proof document name if uploaded
      let proofDocName = null;
      if (eventData.proofDoc) {
        proofDocName = eventData.proofDocName || "Uploaded_Document.pdf";
      }

      const newEvent = {
        _id: `evt_${Date.now()}`,
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        price: Number(eventData.price || 0),
        limit: eventData.limit === "unlimited" ? "unlimited" : Number(eventData.limit || 50),
        registeredCount: 0,
        isOnline: eventData.isOnline === "true" || eventData.isOnline === true,
        location: eventData.location,
        mapLink: eventData.mapLink || "",
        locationDescription: eventData.locationDescription || "",
        image: eventData.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop",
        category: eventData.category || "General",
        hostName: host.name,
        hostId: hostId,
        proofDoc: proofDocName,
      };

      events.unshift(newEvent);
      saveLocalEvents(events);
      return newEvent;
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
      // Offline fallback
      const events = getLocalEvents();
      const bookings = getLocalBookings();
      const eventIdx = events.findIndex((e) => e._id === eventId);
      
      if (eventIdx === -1) {
        throw new Error("Event not found (Local Database Mode)");
      }

      const event = events[eventIdx];
      if (event.limit !== "unlimited" && event.registeredCount >= event.limit) {
        throw new Error("This event is fully booked!");
      }

      const userId = token.replace("mock_token_", "");

      // Register checking: check if already booked
      const alreadyBooked = bookings.some((b) => b.event._id === eventId && b.user === userId);
      if (alreadyBooked) {
        throw new Error("You have already registered for this event!");
      }

      // Increment registered attendees
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
      
      // Update local storage user profile bookings list
      return newBooking;
    }
    throw error;
  }
}

export async function cancelBookingApi(bookingId, token) {
  try {
    return await request(`/bookings/${bookingId}`, {
      method: "DELETE",
    });
  } catch (error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      // Offline fallback
      const bookings = getLocalBookings();
      const bookingIdx = bookings.findIndex((b) => b._id === bookingId);
      
      if (bookingIdx === -1) {
        throw new Error("Booking not found");
      }

      const booking = bookings[bookingIdx];
      
      // Decrement registered count in events
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
