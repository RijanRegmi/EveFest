"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { X, Calendar, MapPin, Tv, Users, CreditCard, Send, ShieldCheck, ExternalLink, HelpCircle } from "lucide-react";

export default function EventDetails({ event, onClose }) {
  const { user, bookings, bookEvent, cancelBooking, chatMessages, sendChatMessage, setAuthModal } = useApp();
  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'chat'
  const [chatInput, setChatInput] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ cardNum: "", expiry: "", cvv: "" });
  const [checkoutError, setCheckoutError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  if (!event) return null;

  // Check registration status
  const userBooking = bookings.find((b) => b.event._id === event._id);
  const isRegistered = !!userBooking;

  // Pricing & Capacity Details
  const isUnlimited = event.limit === "unlimited" || !event.limit;
  const seatsLeft = isUnlimited ? null : Math.max(0, event.limit - (event.registeredCount || 0));
  const isSoldOut = !isUnlimited && seatsLeft <= 0;

  // Chat room messages
  const eventChats = chatMessages[event._id] || [];

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(event._id, chatInput);
    setChatInput("");
  };

  const handleBookClick = () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (event.price > 0) {
      setShowCheckout(true);
    } else {
      processBooking();
    }
  };

  const processBooking = async () => {
    setBookingLoading(true);
    setCheckoutError("");
    try {
      // Simulate network latency (Heuristic 1: Visibility of System Status)
      await new Promise((res) => setTimeout(res, 1200));
      
      const success = await bookEvent(event._id, event.price > 0 ? checkoutData : null);
      if (success) {
        setShowCheckout(false);
        setCheckoutData({ cardNum: "", expiry: "", cvv: "" });
      }
    } catch (err) {
      setCheckoutError(err.message || "Checkout failed");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (checkoutData.cardNum.replace(/\s/g, "").length !== 16) {
      setCheckoutError("Card number must be 16 digits.");
      return;
    }
    if (!/^\d\d\/\d\d$/.test(checkoutData.expiry)) {
      setCheckoutError("Expiry date must be in MM/YY format.");
      return;
    }
    if (checkoutData.cvv.length !== 3) {
      setCheckoutError("CVV must be 3 digits.");
      return;
    }
    processBooking();
  };

  const handleCancel = async () => {
    if (window.confirm("Are you sure you want to cancel your registration? (Heuristic 3: User Control)")) {
      setBookingLoading(true);
      await cancelBooking(userBooking._id);
      setBookingLoading(false);
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div 
        className="modal-content glass-panel animate-slide-up" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className="close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {/* Event Header Banner */}
        <div className="event-banner">
          <img src={event.image} alt={event.title} className="banner-img" />
          <div className="banner-overlay">
            <span className="category-tag">{event.category}</span>
            <h2 className="event-title">{event.title}</h2>
            <p className="event-host">Hosted by {event.hostName}</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="details-tabs">
          <button 
            className={`tab-item ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Event Details
          </button>
          <button 
            className={`tab-item ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            Attendee Group Chat
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="modal-body-scroll scroll-container">
          
          {/* TAB 1: DETAILS */}
          {activeTab === "details" && (
            <div className="details-pane animate-fade-in">
              <div className="info-grid-vertical">
                
                {/* Basic Meta Cards */}
                <div className="meta-cards-row">
                  <div className="meta-card">
                    <Calendar size={18} className="card-icon-indigo" />
                    <div className="meta-card-text">
                      <span className="meta-card-label">Date & Time</span>
                      <span className="meta-card-val">{event.date} | {event.time}</span>
                    </div>
                  </div>

                  <div className="meta-card">
                    {event.isOnline ? (
                      <Tv size={18} className="card-icon-cyan" />
                    ) : (
                      <MapPin size={18} className="card-icon-cyan" />
                    )}
                    <div className="meta-card-text">
                      <span className="meta-card-label">Location / Platform</span>
                      <span className="meta-card-val">{event.location}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="desc-section">
                  <h4 className="pane-title">Event Description</h4>
                  <p className="description-text">{event.description}</p>
                </div>

                {/* Venue details / Map (Heuristic 2: Match with Real World) */}
                {!event.isOnline && (event.locationDescription || event.mapLink) && (
                  <div className="venue-section">
                    <h4 className="pane-title">Venue Details & Directions</h4>
                    {event.locationDescription && (
                      <p className="venue-directions">{event.locationDescription}</p>
                    )}
                    {event.mapLink && (
                      <a 
                        href={event.mapLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-secondary map-link-btn"
                      >
                        <MapPin size={16} />
                        Open Google Maps Location
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                )}

                {/* Proof Document Status */}
                {event.proofDoc && (
                  <div className="verification-badge">
                    <ShieldCheck size={16} className="verify-icon" />
                    <span>Host provided legal verification document ({event.proofDoc})</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GROUP CHAT (Heuristic 10: Help and Doc & Heuristic 1: Visibility) */}
          {activeTab === "chat" && (
            <div className="chat-pane animate-fade-in">
              {!isRegistered ? (
                <div className="chat-locked-message">
                  <HelpCircle size={36} className="lock-icon" />
                  <h4>Group Chat Locked</h4>
                  <p>You must register and book a ticket for this event to access the live attendee group chat.</p>
                  <button className="btn btn-primary" onClick={handleBookClick} disabled={isSoldOut}>
                    {isSoldOut ? "Event Full" : "Book Ticket Now"}
                  </button>
                </div>
              ) : (
                <div className="chat-container">
                  <div className="chat-header-small">
                    <span>Active Attendee Chat Room</span>
                    <span className="pulse-dot"></span>
                  </div>

                  <div className="chat-messages-box">
                    {eventChats.length === 0 ? (
                      <div className="chat-empty">
                        <p>No messages yet. Say hello to other attendees!</p>
                      </div>
                    ) : (
                      eventChats.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`chat-bubble ${msg.senderId === user._id ? "own-message" : ""}`}
                        >
                          <span className="chat-sender">{msg.sender}</span>
                          <p className="chat-text">{msg.text}</p>
                          <span className="chat-time">{msg.time}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendChat} className="chat-input-row">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="form-control chat-input"
                    />
                    <button type="submit" className="btn btn-primary send-btn">
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="details-footer">
          <div className="footer-status">
            <span className="footer-price-tag">
              {event.price === 0 ? "FREE ENTRY" : `Pass Price: $${event.price}`}
            </span>
            <span className="footer-capacity-tag">
              {isUnlimited 
                ? "Unlimited Capacity" 
                : isSoldOut 
                  ? "Sold Out" 
                  : `${seatsLeft} / ${event.limit} seats remaining`}
            </span>
          </div>

          <div className="footer-actions">
            {isRegistered ? (
              <div className="registered-badge-group">
                <span className="registered-text">
                  <ShieldCheck size={16} className="text-success" /> Registered
                </span>
                <button 
                  className="btn btn-secondary cancel-booking-btn" 
                  onClick={handleCancel}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? "Cancelling..." : "Cancel Ticket"}
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-primary book-btn-action" 
                onClick={handleBookClick}
                disabled={isSoldOut || bookingLoading}
              >
                {bookingLoading 
                  ? "Processing..." 
                  : isSoldOut 
                    ? "Registration Closed" 
                    : event.price > 0 
                      ? "Purchase Pass" 
                      : "Register Free"}
              </button>
            )}
          </div>
        </div>

        {/* Simulated Checkout Modal (Heuristic 5: Error Prevention) */}
        {showCheckout && (
          <div className="checkout-overlay animate-fade-in">
            <div className="checkout-content glass-panel animate-slide-up">
              <button className="close-checkout" onClick={() => setShowCheckout(false)}>
                <X size={18} />
              </button>

              <h3 className="checkout-title">Secure Checkout</h3>
              <p className="checkout-subtitle">Secure reservation for "{event.title}"</p>

              {checkoutError && <div className="checkout-error">{checkoutError}</div>}

              <form onSubmit={handleCheckoutSubmit} className="checkout-form">
                <div className="price-summary-box">
                  <span>Ticket Price:</span>
                  <span className="summary-val">${event.price}</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Cardholder Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={user?.name || "Enter name"}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Credit Card Number</label>
                  <div className="input-with-icon">
                    <CreditCard size={16} className="input-icon" />
                    <input
                      type="text"
                      className="form-control"
                      value={checkoutData.cardNum}
                      onChange={(e) => {
                        // Numeric filter
                        const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                        setCheckoutData((prev) => ({ ...prev, cardNum: val }));
                      }}
                      placeholder="0000 0000 0000 0000"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={checkoutData.expiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^\d/]/g, "").slice(0, 5);
                        if (val.length === 2 && !val.includes("/")) {
                          val += "/";
                        }
                        setCheckoutData((prev) => ({ ...prev, expiry: val }));
                      }}
                      placeholder="MM/YY"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input
                      type="password"
                      className="form-control"
                      value={checkoutData.cvv}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 3);
                        setCheckoutData((prev) => ({ ...prev, cvv: val }));
                      }}
                      placeholder="•••"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary pay-btn" 
                  disabled={bookingLoading}
                >
                  {bookingLoading ? "Processing..." : `Pay $${event.price}`}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 900;
          padding: 1.5rem;
        }
        
        .modal-content {
          width: 100%;
          max-width: 680px;
          max-height: 90vh;
          border-radius: var(--border-radius-md);
          padding: 0;
          position: relative;
          box-shadow: var(--shadow-lg), 0 20px 40px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          color: white;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
          z-index: 10;
          transition: var(--transition-fast);
        }
        .close-btn:hover {
          background: rgba(0, 0, 0, 0.6);
        }
        
        /* Event Banner Cover */
        .event-banner {
          position: relative;
          height: 230px;
          width: 100%;
        }
        
        .banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .banner-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.5rem;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 60%, transparent 100%);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.35rem;
        }
        
        .category-tag {
          background: var(--accent-primary);
          color: white;
          font-size: 0.72rem;
          font-weight: 750;
          padding: 0.25rem 0.65rem;
          border-radius: var(--border-radius-full);
          text-transform: uppercase;
        }
        
        .event-title {
          font-size: 1.6rem;
          font-weight: 850;
          color: white;
          line-height: 1.2;
        }
        
        .event-host {
          font-size: 0.82rem;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 550;
        }
        
        /* Tabs Row */
        .details-tabs {
          display: flex;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--glass-border);
        }
        
        .tab-item {
          flex: 1;
          text-align: center;
          padding: 0.85rem;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--fg-secondary);
          border-bottom: 2px solid transparent;
          transition: var(--transition-fast);
        }
        
        .tab-item:hover, .tab-item.active {
          color: var(--accent-primary);
        }
        
        .tab-item.active {
          border-color: var(--accent-primary);
          background: var(--bg-primary);
        }
        
        /* Body Content Scroll */
        .modal-body-scroll {
          overflow-y: auto;
          padding: 1.5rem;
          flex-grow: 1;
        }
        
        .details-pane {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        
        .meta-cards-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .meta-card {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1.1rem;
          border-radius: var(--border-radius-md);
          background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
        }
        
        .card-icon-indigo {
          color: var(--accent-primary);
          flex-shrink: 0;
        }
        
        .card-icon-cyan {
          color: var(--accent-secondary);
          flex-shrink: 0;
        }
        
        .meta-card-text {
          display: flex;
          flex-direction: column;
        }
        
        .meta-card-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--fg-tertiary);
          text-transform: uppercase;
        }
        
        .meta-card-val {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--fg-primary);
        }
        
        .desc-section, .venue-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .pane-title {
          font-size: 1rem;
          font-weight: 800;
          color: var(--fg-primary);
        }
        
        .description-text {
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--fg-secondary);
        }
        
        .venue-directions {
          font-size: 0.88rem;
          line-height: 1.5;
          color: var(--fg-secondary);
        }
        
        .map-link-btn {
          width: fit-content;
          font-size: 0.85rem;
          padding: 0.5rem 1rem;
          margin-top: 0.25rem;
        }
        
        .verification-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 0.85rem;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.15);
          border-radius: var(--border-radius-sm);
          color: var(--color-success);
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        /* Chat Room tab style */
        .chat-locked-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 3rem 1.5rem;
          gap: 0.75rem;
        }
        
        .lock-icon {
          color: var(--fg-tertiary);
        }
        
        .chat-locked-message h4 {
          font-size: 1.15rem;
          font-weight: 800;
        }
        
        .chat-locked-message p {
          font-size: 0.9rem;
          color: var(--fg-secondary);
          max-width: 350px;
          margin-bottom: 0.5rem;
        }
        
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 380px;
        }
        
        .chat-header-small {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--fg-tertiary);
          text-transform: uppercase;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-success);
          animation: pulseGlow 2s infinite;
        }
        
        .chat-messages-box {
          flex-grow: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          padding-right: 0.5rem;
          margin-bottom: 0.85rem;
        }
        
        .chat-empty {
          margin: auto;
          color: var(--fg-tertiary);
          font-size: 0.88rem;
        }
        
        .chat-bubble {
          align-self: flex-start;
          background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-md);
          border-top-left-radius: 0;
          padding: 0.6rem 0.85rem;
          max-width: 75%;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        
        .chat-bubble.own-message {
          align-self: flex-end;
          background: rgba(99, 102, 241, 0.08);
          border-color: rgba(99, 102, 241, 0.2);
          border-radius: var(--border-radius-md);
          border-top-right-radius: 0;
        }
        
        .chat-sender {
          font-size: 0.7rem;
          font-weight: 750;
          color: var(--accent-primary);
        }
        
        .chat-text {
          font-size: 0.85rem;
          color: var(--fg-primary);
          line-height: 1.4;
          word-break: break-word;
        }
        
        .chat-time {
          font-size: 0.65rem;
          color: var(--fg-tertiary);
          align-self: flex-end;
        }
        
        .chat-input-row {
          display: flex;
          gap: 0.5rem;
        }
        
        .chat-input {
          flex-grow: 1;
        }
        
        .send-btn {
          width: 44px;
          height: 44px;
          padding: 0;
          border-radius: var(--border-radius-md);
        }
        
        /* Modal Footer details */
        .details-footer {
          padding: 1.25rem 2rem;
          border-top: 1px solid var(--glass-border);
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 5;
        }
        
        .footer-status {
          display: flex;
          flex-direction: column;
        }
        
        .footer-price-tag {
          font-size: 1.15rem;
          font-weight: 850;
          color: var(--fg-primary);
        }
        
        .footer-capacity-tag {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--fg-tertiary);
        }
        
        .registered-badge-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .registered-text {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--color-success);
        }
        
        .cancel-booking-btn {
          font-size: 0.82rem;
          padding: 0.4rem 0.8rem;
        }
        
        /* Checkout Dialog */
        .checkout-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
          padding: 1.5rem;
        }
        
        .checkout-content {
          width: 100%;
          max-width: 380px;
          padding: 1.75rem;
          border-radius: var(--border-radius-md);
          position: relative;
          box-shadow: var(--shadow-lg);
        }
        
        .close-checkout {
          position: absolute;
          top: 14px;
          right: 14px;
          color: var(--fg-tertiary);
        }
        
        .checkout-title {
          font-size: 1.15rem;
          font-weight: 800;
        }
        
        .checkout-subtitle {
          font-size: 0.78rem;
          color: var(--fg-tertiary);
          margin-bottom: 1rem;
        }
        
        .checkout-error {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--border-radius-sm);
          padding: 0.5rem 0.75rem;
          color: var(--color-danger);
          font-size: 0.78rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        
        .price-summary-box {
          display: flex;
          justify-content: space-between;
          padding: 0.65rem 0.85rem;
          background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-sm);
          font-size: 0.88rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        
        .summary-val {
          color: var(--accent-primary);
        }
        
        .pay-btn {
          width: 100%;
          padding: 0.75rem;
          font-size: 0.95rem;
          margin-top: 0.5rem;
        }
        
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 12px;
          color: var(--fg-tertiary);
          pointer-events: none;
        }
        .input-with-icon .form-control {
          padding-left: 2.5rem;
          width: 100%;
        }
        
        @media (max-width: 640px) {
          .meta-cards-row {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          .details-footer {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
