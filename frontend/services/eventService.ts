import { request, uploadRequest, uploadPutRequest } from "./api";
import type { IEvent, IBooking, IUser } from "@/types";
import { INITIAL_MOCK_EVENTS } from "../data/mockEvents";

function isNetworkError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError"))
  );
}

// LocalStorage Database Helpers
const getLocalEvents = (): IEvent[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("mock_events");
  if (!stored) {
    localStorage.setItem("mock_events", JSON.stringify(INITIAL_MOCK_EVENTS));
    return INITIAL_MOCK_EVENTS as IEvent[];
  }
  return JSON.parse(stored) as IEvent[];
};

const saveLocalEvents = (events: IEvent[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("mock_events", JSON.stringify(events));
};

const getLocalBookings = (): IBooking[] => {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("mock_bookings") || "[]") as IBooking[];
};

const saveLocalBookings = (bookings: IBooking[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("mock_bookings", JSON.stringify(bookings));
};

// Services API Methods
export async function fetchEvents(): Promise<IEvent[]> {
  try {
    return await request<IEvent[]>("/events");
  } catch (error) {
    if (isNetworkError(error)) {
      return getLocalEvents();
    }
    throw error;
  }
}

export async function createEventApi(
  eventData: FormData | Record<string, unknown>,
  token: string
): Promise<IEvent> {
  try {
    if (eventData instanceof FormData) {
      return await uploadRequest<IEvent>("/events", eventData);
    }
    return await request<IEvent>("/events", {
      method: "POST",
      body: eventData,
    });
  } catch (error) {
    if (isNetworkError(error)) {
      const events = getLocalEvents();
      const hostId = token.replace("mock_token_", "");
      const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "[]") as Array<{ _id: string; name: string }>;
      const host = mockUsers.find((u) => u._id === hostId) || { name: "Guest Host" };

      const getData = (key: string): string | null =>
        eventData instanceof FormData
          ? (eventData.get(key) as string | null)
          : ((eventData[key] as string | null) ?? null);

      const newEvent: IEvent = {
        _id: `evt_${Date.now()}`,
        title: getData("title") ?? "",
        description: getData("description") ?? "",
        date: getData("date") ?? "",
        time: getData("time") ?? "",
        price: Number(getData("price") || 0),
        limit: (() => {
          const l = getData("limit");
          return l === "unlimited" ? "unlimited" : Number(l || 50);
        })(),
        registeredCount: 0,
        isOnline: getData("isOnline") === "true",
        location: getData("location") ?? "",
        mapLink: getData("mapLink") ?? "",
        locationDescription: getData("locationDescription") ?? "",
        image:
          getData("bannerPreview") ||
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop",
        logo: getData("logoPreview") ?? "",
        category: getData("category") ?? "General",
        hostName: host.name,
        hostId,
        proofDoc: getData("proofDocName"),
        rules: getData("rules") ?? "",
        isTakedown: false,
        maxSeatsPerUser: Number(getData("maxSeatsPerUser") || 5),
        takedownReason: "",
      };

      events.unshift(newEvent);
      saveLocalEvents(events);
      return newEvent;
    }
    throw error;
  }
}

export async function updateEventApi(
  eventId: string,
  eventData: FormData | Record<string, unknown>,
  _token: string
): Promise<IEvent> {
  try {
    if (eventData instanceof FormData) {
      return await uploadPutRequest<IEvent>(`/events/${eventId}`, eventData);
    }
    return await request<IEvent>(`/events/${eventId}`, {
      method: "PUT",
      body: eventData,
    });
  } catch (error) {
    if (isNetworkError(error)) {
      const events = getLocalEvents();
      const idx = events.findIndex((e) => e._id === eventId);
      if (idx === -1) throw new Error("Event not found");

      const getData = (key: string): string | null =>
        eventData instanceof FormData
          ? (eventData.get(key) as string | null)
          : ((eventData[key] as string | null) ?? null);

      const updatedEvent: IEvent = {
        ...events[idx],
        title: getData("title") ?? events[idx].title,
        description: getData("description") ?? events[idx].description,
        date: getData("date") ?? events[idx].date,
        time: getData("time") ?? events[idx].time,
        price: Number(getData("price") ?? events[idx].price),
        category: getData("category") ?? events[idx].category,
        isOnline:
          getData("isOnline") === "true" ||
          getData("isOnline") === "true" ||
          events[idx].isOnline,
        location: getData("location") ?? events[idx].location,
        mapLink: getData("mapLink") ?? events[idx].mapLink,
        locationDescription:
          getData("locationDescription") ?? events[idx].locationDescription,
        rules: getData("rules") ?? events[idx].rules,
        logo: getData("logoPreview") ?? events[idx].logo,
        image: getData("bannerPreview") ?? events[idx].image,
      };

      const limitVal = getData("limit");
      if (limitVal !== null) {
        updatedEvent.limit =
          limitVal === "unlimited" ? "unlimited" : Number(limitVal);
      }

      events[idx] = updatedEvent;
      saveLocalEvents(events);
      return updatedEvent;
    }
    throw error;
  }
}

export async function deleteEventApi(
  eventId: string,
  _token: string
): Promise<{ success: boolean }> {
  try {
    return await request<{ success: boolean }>(`/events/${eventId}`, {
      method: "DELETE",
    });
  } catch (error) {
    if (isNetworkError(error)) {
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

export async function bookEventApi(
  eventId: string,
  paymentDetails: unknown,
  token: string,
  ticketCount: number = 1
): Promise<IBooking | IBooking[]> {
  try {
    return await request<IBooking | IBooking[]>("/bookings", {
      method: "POST",
      body: { eventId, paymentDetails, ticketCount },
    });
  } catch (error) {
    if (isNetworkError(error)) {
      const events = getLocalEvents();
      const bookings = getLocalBookings();
      const eventIdx = events.findIndex((e) => e._id === eventId);

      if (eventIdx === -1) throw new Error("Event not found (Local Database Mode)");

      const event = events[eventIdx];
      const count = Number(ticketCount || 1);
      if (
        event.limit !== "unlimited" &&
        (event.registeredCount || 0) + count > (event.limit as number)
      ) {
        throw new Error("This event is fully booked!");
      }

      const userId = token.replace("mock_token_", "");

      const newBookings: IBooking[] = [];
      for (let i = 0; i < count; i++) {
        const newBooking: IBooking = {
          _id: `booking_${Date.now()}_${i}`,
          user: userId,
          event: {
            _id: event._id,
            title: event.title,
            date: event.date,
            time: event.time,
            price: event.price,
            location: event.location,
            isOnline: event.isOnline,
          } as IEvent,
          paymentStatus: event.price > 0 ? "Paid" : "Free",
          ticketCode: `EVF-${Math.floor(100000 + Math.random() * 900000)}`,
          createdAt: new Date().toISOString(),
        };
        bookings.push(newBooking);
        newBookings.push(newBooking);
      }

      event.registeredCount = (event.registeredCount || 0) + count;
      events[eventIdx] = event;

      saveLocalEvents(events);
      saveLocalBookings(bookings);

      return count === 1 ? newBookings[0] : newBookings;
    }
    throw error;
  }
}

export async function cancelBookingApi(
  bookingId: string,
  _token: string
): Promise<{ success: boolean }> {
  try {
    return await request<{ success: boolean }>(`/bookings/${bookingId}`, {
      method: "DELETE",
    });
  } catch (error) {
    if (isNetworkError(error)) {
      const bookings = getLocalBookings();
      const bookingIdx = bookings.findIndex((b) => b._id === bookingId);
      if (bookingIdx === -1) throw new Error("Booking not found");

      const booking = bookings[bookingIdx];
      const events = getLocalEvents();
      const bookingEvent = booking.event as IEvent;
      const eventIdx = events.findIndex((e) => e._id === bookingEvent._id);
      if (eventIdx !== -1) {
        events[eventIdx].registeredCount = Math.max(
          0,
          (events[eventIdx].registeredCount || 1) - 1
        );
        saveLocalEvents(events);
      }

      bookings.splice(bookingIdx, 1);
      saveLocalBookings(bookings);
      return { success: true };
    }
    throw error;
  }
}

export async function fetchEventById(id: string): Promise<IEvent> {
  try {
    return await request<IEvent>(`/events/${id}`);
  } catch (error) {
    if (isNetworkError(error)) {
      const localEvents = getLocalEvents();
      const event = localEvents.find((e) => e._id === id);
      if (!event) throw new Error("Event not found");
      return event;
    }
    throw error;
  }
}

// === Admin Services ===

export async function fetchUsersAdmin(
  _token: string
): Promise<IUser[]> {
  try {
    return await request<IUser[]>("/admin/users");
  } catch (error) {
    if (isNetworkError(error)) {
      return JSON.parse(localStorage.getItem("mock_users") || "[]") as IUser[];
    }
    throw error;
  }
}

export async function createUserAdmin(
  userData: Partial<IUser>,
  _token: string
): Promise<IUser> {
  try {
    return await request<IUser>("/admin/users", {
      method: "POST",
      body: userData,
    });
  } catch (error) {
    if (isNetworkError(error)) {
      const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "[]") as IUser[];
      const newUser: IUser = {
        _id: `user_${Date.now()}`,
        name: userData.name || "",
        username: userData.username || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        role: (userData.role as "user" | "admin") || "user",
      };
      mockUsers.push(newUser);
      localStorage.setItem("mock_users", JSON.stringify(mockUsers));
      return newUser;
    }
    throw error;
  }
}

export async function updateUserAdmin(
  userId: string,
  userData: Partial<IUser>,
  _token: string
): Promise<IUser> {
  try {
    return await request<IUser>(`/admin/users/${userId}`, {
      method: "PUT",
      body: userData,
    });
  } catch (error) {
    if (isNetworkError(error)) {
      const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "[]") as IUser[];
      const idx = mockUsers.findIndex((u) => u._id === userId);
      if (idx !== -1) {
        mockUsers[idx] = { ...mockUsers[idx], ...userData };
        localStorage.setItem("mock_users", JSON.stringify(mockUsers));
        return mockUsers[idx];
      }
      throw new Error("Mock user not found");
    }
    throw error;
  }
}

export async function deleteUserAdmin(
  userId: string,
  _token: string
): Promise<{ success: boolean }> {
  try {
    return await request<{ success: boolean }>(`/admin/users/${userId}`, {
      method: "DELETE",
    });
  } catch (error) {
    if (isNetworkError(error)) {
      const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "[]") as Array<{ _id: string }>;
      const filtered = mockUsers.filter((u) => u._id !== userId);
      localStorage.setItem("mock_users", JSON.stringify(filtered));

      const bookings = getLocalBookings().filter((b) => b.user !== userId);
      saveLocalBookings(bookings);

      const events = getLocalEvents().filter((e) => e.hostId !== userId);
      saveLocalEvents(events);

      return { success: true };
    }
    throw error;
  }
}

export async function takedownEventAdmin(
  eventId: string,
  reason: string,
  _token: string
): Promise<{ success: boolean; event?: IEvent }> {
  try {
    return await request<{ success: boolean; event?: IEvent }>(
      `/admin/events/${eventId}/takedown`,
      {
        method: "POST",
        body: { reason },
      }
    );
  } catch (error) {
    if (isNetworkError(error)) {
      const events = getLocalEvents();
      const idx = events.findIndex((e) => e._id === eventId);
      if (idx !== -1) {
        events[idx].isTakedown = true;
        events[idx].takedownReason = reason;
        saveLocalEvents(events);
        return { success: true, event: events[idx] };
      }
      throw new Error("Mock event not found");
    }
    throw error;
  }
}
