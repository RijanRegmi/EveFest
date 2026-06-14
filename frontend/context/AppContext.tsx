"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  fetchEvents, 
  createEventApi, 
  bookEventApi, 
  cancelBookingApi, 
  updateEventApi, 
  deleteEventApi,
  fetchUsersAdmin,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  takedownEventAdmin
} from "@/services/eventService";
import { loginApi, registerApi, getProfileApi, updateProfileApi } from "@/services/authService";
import {
  fetchSupportMessages,
  sendSupportMessage,
  fetchAdminThreads,
  fetchAdminThreadMessages,
  sendAdminReply
} from "@/services/supportService";
import type { 
  IUser, 
  IUserWithBookings, 
  IEvent, 
  IBooking, 
  IGroupChatMessage, 
  IDirectMessage, 
  ISupportMessage 
} from "@/types";

export interface AppContextType {
  theme: string;
  toggleTheme: () => void;
  user: IUserWithBookings | null;
  events: IEvent[];
  setEvents: React.Dispatch<React.SetStateAction<IEvent[]>>;
  bookings: IBooking[];
  chatMessages: Record<string, IGroupChatMessage[]>;
  directMessages: IDirectMessage[];
  fetchDirectMessages: (eventId: string) => Promise<void>;
  fetchGroupMessages: (eventId: string) => Promise<void>;
  sendChatMessage: (eventId: string, text: string) => Promise<void>;
  sendDirectMessage: (eventId: string, attendeeId: string, attendeeName: string, text: string) => Promise<void>;
  markDirectMessagesAsSeen: (eventId: string, attendeeId: string) => Promise<void>;
  authModal: { open: boolean; tab: string };
  setAuthModal: React.Dispatch<React.SetStateAction<{ open: boolean; tab: string }>>;
  loading: boolean;
  toasts: Array<{ id: number; message: string; type: string }>;
  showToast: (message: string, type?: "success" | "error" | "warning") => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, username: string, email: string, phoneNumber: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<IUser>) => Promise<boolean>;
  bookEvent: (eventId: string, paymentDetails?: any, ticketCount?: number) => Promise<boolean>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  hostEvent: (eventForm: FormData) => Promise<boolean>;
  updateEvent: (eventId: string, eventForm: FormData) => Promise<boolean>;
  deleteEvent: (eventId: string) => Promise<boolean>;
  adminUsers: IUser[];
  getAdminUsers: () => Promise<IUser[]>;
  createAdminUser: (userData: any) => Promise<boolean>;
  updateAdminUser: (userId: string, userData: any) => Promise<boolean>;
  deleteAdminUser: (userId: string) => Promise<boolean>;
  takedownEvent: (eventId: string, reason: string) => Promise<boolean>;
  supportMessages: ISupportMessage[];
  getSupportMessages: () => Promise<void>;
  postSupportMessage: (text: string) => Promise<boolean>;
  adminThreads: any[];
  getAdminThreads: () => Promise<any[]>;
  getAdminThreadMessages: (userId: string) => Promise<ISupportMessage[]>;
  postAdminReply: (userId: string, text: string) => Promise<ISupportMessage | null>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<string>("dark"); // Default theme is dark as requested
  const [user, setUser] = useState<IUserWithBookings | null>(null);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  
  const [chatMessages, setChatMessages] = useState<Record<string, IGroupChatMessage[]>>({});
  const [directMessages, setDirectMessages] = useState<IDirectMessage[]>([]);

  const [authModal, setAuthModal] = useState<{ open: boolean; tab: string }>({ open: false, tab: "login" });
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: string }>>([]);

  // Toast Helper
  const showToast = (message: string, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // 1. Theme handler
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // 2. Fetch Events & User Profile on Load
  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load user profile from stored token
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const profile = await getProfileApi(token);
          setUser(profile);
          // Set user bookings if returned
          if (profile.bookings) {
            setBookings(profile.bookings);
          }
        } catch (err) {
          console.warn("Session expired or invalid token.");
          localStorage.removeItem("token");
        }
      }

      // Load events
      const eventData = await fetchEvents();
      setEvents(eventData);
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // 3. User authentication actions
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await loginApi(email, password);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setBookings(data.user.bookings || []);
      showToast(`Welcome back, ${data.user.name}!`);
      return true;
    } catch (error: any) {
      showToast(error.message || "Login failed. Please check credentials.", "error");
      throw error;
    }
  };

  const register = async (name: string, username: string, email: string, phoneNumber: string, password: string): Promise<boolean> => {
    try {
      const data = await registerApi(name, username, email, phoneNumber, password);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setBookings([]);
      showToast(`Account created! Welcome to EveFest, ${data.user.name}`);
      return true;
    } catch (error: any) {
      showToast(error.message || "Registration failed.", "error");
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setBookings([]);
    showToast("Logged out successfully.");
  };

  const updateProfile = async (userData: Partial<IUser>): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const updatedUser = await updateProfileApi(userData, token);
      setUser((prev) => prev ? { ...prev, ...updatedUser } : null);
      showToast("Profile updated successfully!");
      return true;
    } catch (error: any) {
      showToast(error.message || "Failed to update profile.", "error");
      return false;
    }
  };

  // 4. Booking actions
  const bookEvent = async (eventId: string, paymentDetails: any = null, ticketCount = 1): Promise<boolean> => {
    if (!user) {
      window.location.href = "/login";
      showToast("Please sign in to book this event.", "warning");
      return false;
    }

    const count = Number(ticketCount || 1);

    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const booking = await bookEventApi(eventId, paymentDetails, token, count);
      
      if (Array.isArray(booking)) {
        setBookings((prev) => [...prev, ...booking]);
      } else {
        setBookings((prev) => [...prev, booking]);
      }
      
      // Update local event seat count
      setEvents((prevEvents) =>
        prevEvents.map((evt) => {
          if (evt._id === eventId && evt.limit && evt.limit !== "unlimited") {
            return { ...evt, registeredCount: (evt.registeredCount || 0) + count };
          }
          return evt;
        })
      );
      
      showToast("Event ticket booked successfully!");
      return true;
    } catch (error: any) {
      showToast(error.message || "Booking failed.", "error");
      return false;
    }
  };

  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      await cancelBookingApi(bookingId, token);
      
      const cancelledBooking = bookings.find((b) => b._id === bookingId);
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));

      if (cancelledBooking) {
        // Update local event seat count (increment available seats)
        setEvents((prevEvents) =>
          prevEvents.map((evt) => {
            const bookingEventId = typeof cancelledBooking.event === "object" ? cancelledBooking.event._id : cancelledBooking.event;
            if (evt._id === bookingEventId && evt.limit && evt.limit !== "unlimited") {
              return { ...evt, registeredCount: Math.max(0, (evt.registeredCount || 1) - 1) };
            }
            return evt;
          })
        );
      }

      showToast("Booking cancelled successfully.");
      return true;
    } catch (error: any) {
      showToast(error.message || "Failed to cancel booking.", "error");
      return false;
    }
  };

  // 5. Host event actions
  const hostEvent = async (eventForm: FormData): Promise<boolean> => {
    if (!user) {
      window.location.href = "/login";
      showToast("Please sign in to host an event.", "warning");
      return false;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const newEvt = await createEventApi(eventForm, token);
      setEvents((prev) => [newEvt, ...prev]);
      showToast("Your event has been hosted successfully!");
      return true;
    } catch (error: any) {
      showToast(error.message || "Failed to host event.", "error");
      return false;
    }
  };

  // 5b. Update event actions
  const updateEvent = async (eventId: string, eventForm: FormData): Promise<boolean> => {
    if (!user) {
      window.location.href = "/login";
      return false;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const updatedEvt = await updateEventApi(eventId, eventForm, token);
      setEvents((prev) => prev.map((e) => (e._id === eventId ? updatedEvt : e)));
      showToast("Event updated successfully!");
      return true;
    } catch (error: any) {
      showToast(error.message || "Failed to update event.", "error");
      return false;
    }
  };

  // 5c. Delete event
  const deleteEvent = async (eventId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      await deleteEventApi(eventId, token);
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
      showToast("Event deleted.", "success");
      return true;
    } catch (error: any) {
      showToast(error.message || "Failed to delete event.", "error");
      return false;
    }
  };

  // === Admin Panel Actions ===
  const [adminUsers, setAdminUsers] = useState<IUser[]>([]);
  const [supportMessages, setSupportMessages] = useState<ISupportMessage[]>([]);
  const [adminThreads, setAdminThreads] = useState<any[]>([]);

  // Fetch all users (admin only)
  const getAdminUsers = async (): Promise<IUser[]> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return [];
      const usersData = await fetchUsersAdmin(token);
      setAdminUsers(usersData);
      return usersData;
    } catch (error: any) {
      showToast(error.message || "Failed to fetch users.", "error");
      return [];
    }
  };

  // Create new user (admin only)
  const createAdminUser = async (userData: any): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const newUser = await createUserAdmin(userData, token);
      setAdminUsers((prev) => [...prev, newUser]);
      showToast(`User ${newUser.name} created successfully!`, "success");
      return true;
    } catch (error: any) {
      showToast(error.message || "Failed to create user.", "error");
      return false;
    }
  };

  // Update user (admin only)
  const updateAdminUser = async (userId: string, userData: any): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const updatedUser = await updateUserAdmin(userId, userData, token);
      setAdminUsers((prev) => prev.map((u) => (u._id === userId ? updatedUser : u)));
      showToast(`User ${updatedUser.name} updated successfully!`, "success");
      return true;
    } catch (error: any) {
      showToast(error.message || "Failed to update user.", "error");
      return false;
    }
  };

  // Delete user (admin only)
  const deleteAdminUser = async (userId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      await deleteUserAdmin(userId, token);
      setAdminUsers((prev) => prev.filter((u) => u._id !== userId));
      showToast("User deleted successfully.", "success");
      return true;
    } catch (error: any) {
      showToast(error.message || "Failed to delete user.", "error");
      return false;
    }
  };

  // Take down event with reason (admin only)
  const takedownEvent = async (eventId: string, reason: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      await takedownEventAdmin(eventId, reason, token);
      setEvents((prev) => prev.map((e) => (e._id === eventId ? { ...e, isTakedown: true, takedownReason: reason } : e)));
      showToast("Event taken down successfully.", "success");
      return true;
    } catch (error: any) {
      showToast(error.message || "Failed to take down event.", "error");
      return false;
    }
  };

  // === Live Support Chat Actions ===

  // Fetch support messages (user side)
  const getSupportMessages = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const msgs = await fetchSupportMessages(token);
      setSupportMessages(msgs);
    } catch (error) {
      console.error("Failed to load support messages:", error);
    }
  };

  // Send support message (user side)
  const postSupportMessage = async (text: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const newMsg = await sendSupportMessage(text, token);
      setSupportMessages((prev) => [...prev, newMsg]);
      return true;
    } catch (error: any) {
      showToast(error.message || "Failed to send message.", "error");
      return false;
    }
  };

  // Fetch all support threads (admin side)
  const getAdminThreads = async (): Promise<any[]> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return [];
      const threads = await fetchAdminThreads(token);
      setAdminThreads(threads);
      return threads;
    } catch (error) {
      console.error("Failed to fetch admin threads:", error);
      return [];
    }
  };

  // Fetch messages in specific thread (admin side)
  const getAdminThreadMessages = async (userId: string): Promise<ISupportMessage[]> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return [];
      return await fetchAdminThreadMessages(userId, token);
    } catch (error) {
      console.error("Failed to fetch thread messages:", error);
      return [];
    }
  };

  // Reply to thread (admin side)
  const postAdminReply = async (userId: string, text: string): Promise<ISupportMessage | null> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const newMsg = await sendAdminReply(userId, text, token);
      setAdminThreads((prev) =>
        prev.map((t) =>
          t.userId === userId
            ? { ...t, latestMessage: { text: newMsg.text, createdAt: newMsg.createdAt } }
            : t
        )
      );
      return newMsg;
    } catch (error: any) {
      showToast(error.message || "Failed to send reply.", "error");
      return null;
    }
  };

  // 6. Group Chat Room actions — backed by real API
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // Fetch group chat messages for an event from the server
  const fetchGroupMessages = async (eventId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_URL}/chat/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return; // silently ignore (e.g. not a registered attendee)
      const msgs = await res.json();
      setChatMessages((prev) => ({ ...prev, [eventId]: msgs }));
    } catch (err) {
      console.error("[GroupChat] fetch error:", err);
    }
  };

  // Send a message to the event group chat
  const sendChatMessage = async (eventId: string, text: string) => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/chat/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.message || "Failed to send message.", "error");
        return;
      }
      const newMsg = await res.json();
      // Optimistically add to local state so sender sees it instantly
      setChatMessages((prev) => {
        const current = prev[eventId] || [];
        // Avoid duplicate if polling already picked it up
        if (current.find((m) => m._id === newMsg._id)) return prev;
        return { ...prev, [eventId]: [...current, newMsg] };
      });
    } catch (err) {
      showToast("Network error. Message not sent.", "error");
    }
  };

  // 7. Direct Messages (Support Chat) — backed by real API
  const fetchDirectMessages = async (eventId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_URL}/direct-messages/event/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const msgs = await res.json();
      setDirectMessages(msgs);
    } catch (err) {
      console.error("[DirectMessages] fetch error:", err);
    }
  };

  const sendDirectMessage = async (eventId: string, attendeeId: string, attendeeName: string, text: string) => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/direct-messages/event/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, attendeeId, attendeeName }),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.message || "Failed to send message.", "error");
        return;
      }
      const newMsg = await res.json();
      setDirectMessages((prev) => {
        if (prev.find((m) => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });
    } catch (err) {
      showToast("Network error. Message not sent.", "error");
    }
  };

  const markDirectMessagesAsSeen = async (eventId: string, attendeeId: string) => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/direct-messages/seen/${eventId}/${attendeeId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      setDirectMessages((prev) =>
        prev.map((msg) =>
          msg.eventId === eventId && msg.attendeeId === attendeeId && msg.senderId !== user._id
            ? { ...msg, seen: true }
            : msg
        )
      );
    } catch (err) {
      console.error("[DirectMessages] mark seen error:", err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        user,
        events,
        setEvents,
        bookings,
        chatMessages,
        directMessages,
        fetchDirectMessages,
        fetchGroupMessages,
        sendChatMessage,
        sendDirectMessage,
        markDirectMessagesAsSeen,
        authModal,
        setAuthModal,
        loading,
        toasts,
        showToast,
        login,
        register,
        logout,
        updateProfile,
        bookEvent,
        cancelBooking,
        hostEvent,
        updateEvent,
        deleteEvent,
        adminUsers,
        getAdminUsers,
        createAdminUser,
        updateAdminUser,
        deleteAdminUser,
        takedownEvent,
        supportMessages,
        getSupportMessages,
        postSupportMessage,
        adminThreads,
        getAdminThreads,
        getAdminThreadMessages,
        postAdminReply,
        refreshData: loadInitialData,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type} animate-slide-up`}>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
      <style jsx global>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 9999;
          max-width: 380px;
        }
        .toast {
          padding: 12px 20px;
          border-radius: var(--border-radius-md);
          font-size: 0.9rem;
          font-weight: 600;
          color: white;
          box-shadow: var(--shadow-lg);
          display: flex;
          align-items: center;
          backdrop-filter: blur(8px);
        }
        .toast-success {
          background: rgba(16, 185, 129, 0.95);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .toast-error {
          background: rgba(239, 68, 68, 0.95);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .toast-warning {
          background: rgba(245, 158, 11, 0.95);
          border: 1px solid rgba(245, 158, 11, 0.2);
        }
      `}</style>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
