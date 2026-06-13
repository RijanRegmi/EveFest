"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchEvents, createEventApi, bookEventApi, cancelBookingApi, updateEventApi, deleteEventApi } from "@/services/eventService";
import { loginApi, registerApi, getProfileApi } from "@/services/authService";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [theme, setTheme] = useState("dark"); // Default theme is dark as requested
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  const [chatMessages, setChatMessages] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("evefest_chat_messages") || "{}");
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  const [directMessages, setDirectMessages] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("evefest_direct_messages") || "[]");
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("evefest_chat_messages", JSON.stringify(chatMessages));
    }
  }, [chatMessages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("evefest_direct_messages", JSON.stringify(directMessages));
    }
  }, [directMessages]);

  const [authModal, setAuthModal] = useState({ open: false, tab: "login" });
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const showToast = (message, type = "success") => {
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
  const login = async (email, password) => {
    try {
      const data = await loginApi(email, password);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setBookings(data.user.bookings || []);
      showToast(`Welcome back, ${data.user.name}!`);
      return true;
    } catch (error) {
      showToast(error.message || "Login failed. Please check credentials.", "error");
      throw error;
    }
  };

  const register = async (name, username, email, phoneNumber, password) => {
    try {
      const data = await registerApi(name, username, email, phoneNumber, password);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setBookings([]);
      showToast(`Account created! Welcome to EveFest, ${data.user.name}`);
      return true;
    } catch (error) {
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

  // 4. Booking actions
  const bookEvent = async (eventId, paymentDetails = null) => {
    if (!user) {
      window.location.href = "/login";
      showToast("Please sign in to book this event.", "warning");
      return false;
    }

    try {
      const token = localStorage.getItem("token");
      const booking = await bookEventApi(eventId, paymentDetails, token);
      
      setBookings((prev) => [...prev, booking]);
      
      // Update local event seat count
      setEvents((prevEvents) =>
        prevEvents.map((evt) => {
          if (evt._id === eventId && evt.limit && evt.limit !== "unlimited") {
            return { ...evt, registeredCount: (evt.registeredCount || 0) + 1 };
          }
          return evt;
        })
      );
      
      showToast("Event ticket booked successfully!");
      return true;
    } catch (error) {
      showToast(error.message || "Booking failed.", "error");
      return false;
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      await cancelBookingApi(bookingId, token);
      
      const cancelledBooking = bookings.find((b) => b._id === bookingId);
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));

      if (cancelledBooking) {
        // Update local event seat count (increment available seats)
        setEvents((prevEvents) =>
          prevEvents.map((evt) => {
            if (evt._id === cancelledBooking.event._id && evt.limit && evt.limit !== "unlimited") {
              return { ...evt, registeredCount: Math.max(0, (evt.registeredCount || 1) - 1) };
            }
            return evt;
          })
        );
      }

      showToast("Booking cancelled successfully.");
      return true;
    } catch (error) {
      showToast(error.message || "Failed to cancel booking.", "error");
      return false;
    }
  };

  // 5. Host event actions
  const hostEvent = async (eventForm) => {
    if (!user) {
      window.location.href = "/login";
      showToast("Please sign in to host an event.", "warning");
      return false;
    }

    try {
      const token = localStorage.getItem("token");
      const newEvt = await createEventApi(eventForm, token);
      setEvents((prev) => [newEvt, ...prev]);
      showToast("Your event has been hosted successfully!");
      return true;
    } catch (error) {
      showToast(error.message || "Failed to host event.", "error");
      return false;
    }
  };

  // 5b. Update event actions
  const updateEvent = async (eventId, eventForm) => {
    if (!user) {
      window.location.href = "/login";
      return false;
    }
    try {
      const token = localStorage.getItem("token");
      const updatedEvt = await updateEventApi(eventId, eventForm, token);
      setEvents((prev) => prev.map((e) => (e._id === eventId ? updatedEvt : e)));
      showToast("Event updated successfully!");
      return true;
    } catch (error) {
      showToast(error.message || "Failed to update event.", "error");
      return false;
    }
  };

  // 5c. Delete event
  const deleteEvent = async (eventId) => {
    if (!user) return false;
    try {
      const token = localStorage.getItem("token");
      await deleteEventApi(eventId, token);
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
      showToast("Event deleted.", "success");
      return true;
    } catch (error) {
      showToast(error.message || "Failed to delete event.", "error");
      return false;
    }
  };

  // 6. Group Chat Room actions
  const sendChatMessage = (eventId, text) => {
    if (!user) return;
    
    const newMessage = {
      id: Date.now(),
      sender: user.name,
      senderId: user._id,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => {
      const current = prev[eventId] || [];
      return { ...prev, [eventId]: [...current, newMessage] };
    });
  };

  // 7. Direct Messages (Support Chat)
  const sendDirectMessage = (eventId, attendeeId, attendeeName, text) => {
    if (!user) return;

    const newMessage = {
      id: Date.now(),
      eventId,
      attendeeId,
      attendeeName,
      senderId: user._id,
      senderName: user.name,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setDirectMessages((prev) => [...prev, newMessage]);
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
        authModal,
        setAuthModal,
        loading,
        toasts,
        showToast,
        login,
        register,
        logout,
        bookEvent,
        cancelBooking,
        hostEvent,
        updateEvent,
        deleteEvent,
        sendChatMessage,
        sendDirectMessage,
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
