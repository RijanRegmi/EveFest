"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useApp } from "../../../context/AppContext";
import { fetchEventById } from "../../../services/eventService";
import Navbar from "../../../components/Navbar";
import AuthModal from "../../../components/AuthModal";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tv,
  Users,
  CreditCard,
  Send,
  ShieldCheck,
  ExternalLink,
  Lock,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  ShieldCheck as VerifiedIcon,
  BookOpen,
  Edit,
  Trash2,
  ShieldOff
} from "lucide-react";

function EventDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = params;
  
  const {
    user,
    bookings,
    bookEvent,
    cancelBooking,
    chatMessages,
    directMessages,
    sendChatMessage,
    sendDirectMessage,
    showToast,
    deleteEvent,
  } = useApp();

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

  const resolveImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("blob:")) return url;
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    const cleanBackend = BACKEND_URL.endsWith("/") ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
    return `${cleanBackend}${cleanUrl}`;
  };

  const [event, setEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [chatTab, setChatTab] = useState("group"); // 'group' | 'support'
  const [chatInput, setChatInput] = useState("");
  const [supportInput, setSupportInput] = useState("");
  const [selectedAttendeeId, setSelectedAttendeeId] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ cardNum: "", expiry: "", cvv: "" });
  const [checkoutError, setCheckoutError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // Check registration status - hooks and variables moved to top to prevent Rules of Hooks violations
  const userEventBookings = event ? bookings.filter(
    (b) => b.event?._id === event._id || b.event === event._id
  ) : [];
  const isRegistered = userEventBookings.length > 0;
  const [activeTicketIndex, setActiveTicketIndex] = useState(0);
  const activeBooking = userEventBookings[activeTicketIndex] || userEventBookings[0] || null;
  const qrCanvasRef = useRef(null);

  // QR Code drawing logic
  useEffect(() => {
    if (!qrCanvasRef.current || !activeBooking) return;
    const canvas = qrCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Pseudo QR Code deterministic random seeding from ticketCode
    const code = activeBooking.ticketCode || "TICKET-SAMPLE";
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // 15x15 grid
    const gridSize = 15;
    const cellSize = size / gridSize;
    
    // Draw background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    
    // Corner patterns helper
    const drawFinderPattern = (x, y) => {
      ctx.fillStyle = "#000000";
      ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = "#000000";
      ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    };
    
    // Helper to check if coordinate is inside corner patterns
    const isFinder = (r, c) => {
      if (r < 7 && c < 7) return true;
      if (r < 7 && c >= gridSize - 7) return true;
      if (r >= gridSize - 7 && c < 7) return true;
      return false;
    };
    
    // Draw finder patterns
    drawFinderPattern(0, 0);
    drawFinderPattern(gridSize - 7, 0);
    drawFinderPattern(0, gridSize - 7);
    
    // Draw random data block
    ctx.fillStyle = "#000000";
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (isFinder(r, c)) continue;
        const val = Math.sin(hash + r * 13.5 + c * 37.7) * 10000;
        const isFilled = (val - Math.floor(val)) > 0.48;
        if (isFilled) {
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [activeBooking]);

  // Handle activeTicketIndex safety bounds when bookings change
  useEffect(() => {
    if (activeTicketIndex >= userEventBookings.length) {
      setActiveTicketIndex(Math.max(0, userEventBookings.length - 1));
    }
  }, [userEventBookings.length, activeTicketIndex]);

  // Scroll to top on page load/navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  // Fetch event details on mount/ID change
  useEffect(() => {
    if (!id) return;
    
    const getEvent = async () => {
      setLoadingEvent(true);
      setErrorMsg("");
      try {
        const data = await fetchEventById(id);
        setEvent(data);
      } catch (err) {
        console.error("Failed to load event:", err);
        setErrorMsg(err.message || "Event not found");
      } finally {
        setLoadingEvent(false);
      }
    };
    
    getEvent();
  }, [id]);

  if (loadingEvent) {
    return (
      <>
        <Navbar />
        <div className="loading-container container">
          <div className="skeleton-hero animate-pulse"></div>
          <div className="skeleton-grid">
            <div className="skeleton-main">
              <div className="skeleton-title animate-pulse"></div>
              <div className="skeleton-text animate-pulse"></div>
              <div className="skeleton-text animate-pulse" style={{ width: "80%" }}></div>
              <div className="skeleton-map animate-pulse"></div>
            </div>
            <div className="skeleton-sidebar">
              <div className="skeleton-card animate-pulse"></div>
            </div>
          </div>
        </div>
        <style jsx>{`
          .loading-container {
            padding-top: 2.5rem;
            padding-bottom: 4rem;
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }
          .skeleton-hero {
            height: 320px;
            background: var(--bg-secondary);
            border-radius: var(--border-radius-lg);
            border: 1px solid var(--glass-border);
          }
          .skeleton-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2rem;
          }
          .skeleton-main {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }
          .skeleton-title {
            height: 40px;
            background: var(--bg-secondary);
            border-radius: var(--border-radius-sm);
            width: 60%;
          }
          .skeleton-text {
            height: 18px;
            background: var(--bg-secondary);
            border-radius: var(--border-radius-sm);
            width: 100%;
          }
          .skeleton-map {
            height: 300px;
            background: var(--bg-secondary);
            border-radius: var(--border-radius-md);
            margin-top: 1rem;
          }
          .skeleton-sidebar {
            display: flex;
            flex-direction: column;
          }
          .skeleton-card {
            height: 400px;
            background: var(--bg-secondary);
            border-radius: var(--border-radius-md);
            border: 1px solid var(--glass-border);
          }
          .animate-pulse {
            animation: pulse 1.5s infinite ease-in-out;
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 0.35; }
          }
          @media (max-width: 968px) {
            .skeleton-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </>
    );
  }

  if (errorMsg || !event) {
    return (
      <>
        <Navbar />
        <div className="error-container container animate-fade-in">
          <div className="error-card glass-panel">
            <AlertTriangle size={56} className="error-icon" />
            <h2>Event Not Found</h2>
            <p>{errorMsg || "The event you are looking for does not exist, or has been removed by the administrator."}</p>
            <button className="btn btn-primary" onClick={() => router.push("/")}>
              <ArrowLeft size={16} />
              Return to Explore
            </button>
          </div>
        </div>
        <style jsx>{`
          .error-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: calc(100vh - 150px);
            padding: 2rem 0;
          }
          .error-card {
            width: 100%;
            max-width: 500px;
            padding: 3rem 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 1.25rem;
            box-shadow: var(--shadow-lg);
          }
          .error-icon {
            color: var(--color-warning);
          }
          .error-card h2 {
            font-size: 1.75rem;
            font-weight: 850;
            color: var(--fg-primary);
          }
          .error-card p {
            color: var(--fg-secondary);
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 0.5rem;
          }
        `}</style>
      </>
    );
  }

  const isHost = user && event && (
    user._id === event.hostId ||
    user._id === event.hostId?._id ||
    user._id === event.hostId?.toString()
  );

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
      router.push("/login");
      showToast("Please sign in to book event tickets", "warning");
      return;
    }
    if (event.isTakedown) {
      showToast("Booking is suspended for this event", "error");
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
      setCheckoutError("Expiry date must be MM/YY.");
      return;
    }
    if (checkoutData.cvv.length !== 3) {
      setCheckoutError("CVV must be 3 digits.");
      return;
    }
    processBooking();
  };

  const handleCancel = async () => {
    if (window.confirm("Are you sure you want to cancel your ticket registration?")) {
      setBookingLoading(true);
      await cancelBooking(activeBooking._id);
      setBookingLoading(false);
    }
  };

  const handleCancelSpecific = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this ticket pass?")) {
      setBookingLoading(true);
      await cancelBooking(bookingId);
      setBookingLoading(false);
    }
  };

  const handleBackClick = () => {
    const view = searchParams.get("view") || "explore";
    router.push(`/?view=${view}`);
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this event? This action cannot be undone.")) return;
    const success = await deleteEvent(event._id);
    if (success) {
      router.push("/");
    }
  };

  return (
    <>
      <Navbar />
      
      <main className="event-detail-page container animate-fade-in">
        
        {/* Navigation Breadcrumb */}
        <div className="breadcrumb-row">
          <button onClick={handleBackClick} className="back-link">
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>

        {/* Takedown Banner Warning */}
        {event.isTakedown && (
          <div className="takedown-warning-banner glass-panel">
            <AlertTriangle size={24} className="takedown-warning-icon" />
            <div className="takedown-warning-content">
              <h3>ATTENTION: THIS EVENT HAS BEEN TAKEN DOWN BY ADMINISTRATORS</h3>
              <p>Reason: {event.takedownReason || "Violation of campus community guidelines."}</p>
            </div>
          </div>
        )}

        {/* Hero Banner Area */}
        <section className="event-hero glass-panel">
          <img src={resolveImageUrl(event.image)} alt={event.title} className="hero-banner-img" />
          <div className="hero-overlay">
            <div className="badge-row">
              <span className="category-tag">{event.category}</span>
              {event.isOnline ? (
                <span className="format-tag virtual">
                  <Tv size={12} />
                  VIRTUAL
                </span>
              ) : (
                <span className="format-tag physical">
                  <MapPin size={12} />
                  IRL VENUE
                </span>
              )}
            </div>
            <h1 className="hero-title">{event.title}</h1>
            <div className="hero-host">
              {event.logo ? (
                <img src={resolveImageUrl(event.logo)} alt="Event Logo" className="host-logo-img" />
              ) : (
                <div className="host-avatar">
                  {event.hostName.charAt(0).toUpperCase()}
                </div>
              )}
              <p>Hosted by <strong>{event.hostName}</strong></p>
            </div>
          </div>
          {/* Host Controls Overlay */}
          {isHost && (
            <div className="host-controls-bar">
              <button
                className="host-ctrl-btn edit-btn"
                onClick={() => router.push(`/edit-event/${event._id}`)}
              >
                <Edit size={14} /> Edit Event
              </button>
              <button
                className="host-ctrl-btn delete-btn"
                onClick={handleDeleteEvent}
              >
                <Trash2 size={14} /> Delete Event
              </button>
            </div>
          )}
        </section>

        {/* Main 2-Column Grid */}
        <div className="content-grid">
          
          {/* LEFT COLUMN: Event Content & Map */}
          <div className="grid-main-col">
            
            {/* Meta Stats row */}
            <div className="meta-card-section glass-panel">
              <div className="meta-card-item">
                <div className="meta-icon-wrapper purple-glow">
                  <Calendar size={20} className="icon-purple" />
                </div>
                <div className="meta-item-info">
                  <span className="meta-label">Date & Time</span>
                  <span className="meta-val">{event.date}</span>
                  <span className="meta-subval">{event.time}</span>
                </div>
              </div>

              <div className="meta-card-item">
                <div className="meta-icon-wrapper cyan-glow">
                  {event.isOnline ? (
                    <Tv size={20} className="icon-cyan" />
                  ) : (
                    <MapPin size={20} className="icon-cyan" />
                  )}
                </div>
                <div className="meta-item-info">
                  <span className="meta-label">Location</span>
                  <span className="meta-val">{event.isOnline ? "Online Live Stream" : event.location}</span>
                  {!event.isOnline && (
                    <span className="meta-subval text-truncate">{event.locationDescription || "Campus venue"}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Event Description */}
            <div className="content-section glass-panel">
              <h2 className="section-heading">About This Event</h2>
              <p className="description-text">{event.description}</p>
            </div>

            {/* Embedded Map Section */}
            {!event.isOnline && (
              <div className="content-section map-section glass-panel">
                <div className="section-header-row">
                  <div>
                    <h2 className="section-heading">Venue & Location Map</h2>
                    <p className="directions-text">{event.locationDescription || "Find your directions below."}</p>
                  </div>
                  {event.mapLink && (
                    <a
                      href={event.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-link-external"
                    >
                      Google Maps Link <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                
                {/* Embed Map Iframe */}
                <div className="interactive-map-container">
                  <iframe
                    title="Event Location Map"
                    width="100%"
                    height="350"
                    style={{ border: 0, borderRadius: "var(--border-radius-md)" }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      event.location + " " + (event.locationDescription || "")
                    )}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                  ></iframe>
                </div>
              </div>
            )}

            {/* Event Rules Section */}
            {event.rules && event.rules.trim() && (
              <div className="content-section rules-section glass-panel">
                <div className="rules-header">
                  <BookOpen size={18} className="rules-icon" />
                  <h2 className="section-heading">Event Rules & Code of Conduct</h2>
                </div>
                <div className="rules-content">
                  {event.rules.split("\n").map((line, i) => (
                    line.trim() ? <p key={i} className="rule-line">{line}</p> : <br key={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Proof Document Status */}
            {event.proofDoc && (
              <div className="legal-banner glass-panel">
                <VerifiedIcon size={18} className="verified-icon" />
                <span>
                  This event is verified. The host uploaded official campus approval file: <strong>{event.proofDoc}</strong>.
                </span>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Bookings & Chat */}
          <div className="grid-sidebar-col">
            
             {/* Booking Card */}
             <div className="sidebar-card glass-panel booking-sticky-card">
               {isHost ? (
                 <div className="host-info-card-content">
                   <h3 className="card-heading" style={{ color: "var(--accent-primary)" }}>Host Control Panel</h3>
                   <div className="success-badge" style={{ background: "rgba(99, 102, 241, 0.15)", color: "var(--accent-primary)", border: "1px solid rgba(99, 102, 241, 0.3)", display: "inline-flex", marginBottom: "1rem" }}>
                     <ShieldCheck size={16} />
                     Organizer Mode
                   </div>
                   <p className="host-desc-text" style={{ fontSize: "0.85rem", lineHeight: "1.6", color: "var(--fg-secondary)", marginBottom: "1.25rem" }}>
                     You are hosting this event. You have full permission to moderate the group chat, answer attendee support messages, and edit or cancel the event.
                   </p>
                   
                   <div className="capacity-badge-row">
                     <span className="capacity-status">
                       {isUnlimited 
                         ? "Unlimited Registration" 
                         : `${event.registeredCount || 0} / ${event.limit} spots booked`}
                     </span>
                     {!isUnlimited && (
                       <div className="progress-bar-bg">
                         <div 
                           className="progress-bar-fill"
                           style={{ width: `${((event.registeredCount || 0) / event.limit) * 100}%` }}
                         ></div>
                       </div>
                     )}
                   </div>
 
                   <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.5rem" }}>
                     <button 
                       className="btn btn-primary btn-block"
                       onClick={() => router.push(`/edit-event/${event._id}`)}
                     >
                       Edit Event Details
                     </button>
                   </div>
                 </div>
               ) : (
                 <>
                   <h3 className="card-heading">Register Ticket</h3>
                   <div className="price-tag-row">
                     <span className="price-label">Ticket Price</span>
                     <span className="price-value">
                       {event.price === 0 ? "FREE ENTRY" : `$${event.price}`}
                     </span>
                   </div>
 
                   <div className="capacity-badge-row">
                     <span className="capacity-status">
                       {isUnlimited 
                         ? "Unlimited Registration" 
                         : isSoldOut 
                           ? "Sold Out" 
                           : `${seatsLeft} of ${event.limit} seats remaining`}
                     </span>
                     {!isUnlimited && !isSoldOut && (
                       <div className="progress-bar-bg">
                         <div 
                           className="progress-bar-fill"
                           style={{ width: `${(event.registeredCount / event.limit) * 100}%` }}
                         ></div>
                       </div>
                     )}
                   </div>
 
                   <div className="booking-action-wrapper">
                     {event.isTakedown ? (
                       <div className="takedown-sidebar-banner" style={{ padding: "1rem 0", textAlign: "center" }}>
                         <ShieldOff size={32} className="text-danger" style={{ marginBottom: "0.5rem", display: "block", marginLeft: "auto", marginRight: "auto" }} />
                         <h4 style={{ color: "var(--color-danger)", fontWeight: "800", fontSize: "0.95rem" }}>Booking Suspended</h4>
                         <p style={{ fontSize: "0.8rem", color: "var(--fg-secondary)", textAlign: "center", lineHeight: "1.4", marginTop: "0.25rem" }}>
                           This event has been taken down by moderators and ticket booking is closed.
                         </p>
                       </div>
                     ) : isRegistered ? (
                       <div className="registered-actions">
                         <div className="success-badge">
                           <ShieldCheck size={16} />
                           Booked: {userEventBookings.length} {userEventBookings.length === 1 ? "Ticket" : "Tickets"}
                         </div>
                         
                         {/* STACKED TICKETS CAROUSEL */}
                         <div className="ticket-stack-container" style={{ position: "relative", minHeight: "270px", marginTop: "0.75rem" }}>
                           {userEventBookings.map((b, idx) => {
                             const isActive = idx === activeTicketIndex;
                             const offset = idx - activeTicketIndex;
                             
                             if (offset < 0 || offset > 2) return null;
                             
                             const scale = 1 - offset * 0.05;
                             const translateY = offset * 12;
                             const rotate = offset === 0 ? 0 : offset * 2.5 * (idx % 2 === 0 ? 1 : -1);
                             const zIndex = 10 - offset;
                             const opacity = 1 - offset * 0.35;

                             return (
                               <div 
                                 key={b._id} 
                                 className={`ticket-card-stack-item glass-panel ${isActive ? "active" : ""}`}
                                 style={{
                                   transform: `scale(${scale}) translateY(${translateY}px) rotate(${rotate}deg)`,
                                   zIndex: zIndex,
                                   opacity: opacity,
                                   position: offset === 0 ? "relative" : "absolute",
                                   top: 0,
                                   left: 0,
                                   right: 0,
                                   transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                   pointerEvents: isActive ? "auto" : "none",
                                   padding: "1.25rem",
                                   background: "rgba(18, 18, 20, 0.95)",
                                   border: isActive ? "1px solid var(--accent-primary)" : "1px solid var(--glass-border)",
                                   borderRadius: "var(--border-radius-md)"
                                 }}
                               >
                                 {/* Ticket physical shape styling */}
                                 <div className="ticket-body" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                   <div className="ticket-info-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px dashed var(--glass-border)", paddingBottom: "0.5rem" }}>
                                     <span className="ticket-num" style={{ fontSize: "0.72rem", fontWeight: "800", color: "var(--accent-primary)" }}>PASS {idx + 1} of {userEventBookings.length}</span>
                                     <span className="ticket-holder" style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--fg-primary)", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.userName || user?.name}</span>
                                   </div>
                                   
                                   <div className="qr-box-wrapper" style={{ display: "flex", justifyContent: "center", padding: "0.5rem", background: "white", borderRadius: "var(--border-radius-sm)", width: "100px", height: "100px", margin: "0 auto" }}>
                                     {isActive && (
                                       <canvas 
                                         ref={qrCanvasRef} 
                                         width="90" 
                                         height="90"
                                         style={{ imageRendering: "pixelated" }}
                                       />
                                     )}
                                   </div>

                                   <div className="ticket-reference-box">
                                     <span className="ref-lbl">Code Reference</span>
                                     <span className="ref-val" style={{ fontSize: "0.8rem" }}>{b.ticketCode}</span>
                                   </div>
                                 </div>

                                 <div className="ticket-footer" style={{ marginTop: "0.75rem" }}>
                                   <button 
                                     className="btn btn-secondary cancel-booking-btn"
                                     onClick={() => handleCancelSpecific(b._id)}
                                     disabled={bookingLoading}
                                     style={{ padding: "0.45rem", fontSize: "0.78rem" }}
                                   >
                                     {bookingLoading ? "Processing..." : "Cancel This Pass"}
                                   </button>
                                 </div>
                               </div>
                             );
                           })}
                         </div>

                         {/* Dots / Navigation Indicator */}
                         {userEventBookings.length > 1 && (
                           <div className="stack-navigation" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0.75rem 0 1.25rem" }}>
                             <button 
                               className="btn btn-secondary" 
                               style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                               onClick={() => setActiveTicketIndex((prev) => (prev > 0 ? prev - 1 : userEventBookings.length - 1))}
                             >
                               &larr; Prev
                             </button>
                             <div className="dots-row" style={{ display: "flex", gap: "0.35rem" }}>
                               {userEventBookings.map((_, idx) => (
                                 <span 
                                   key={idx} 
                                   className={`dot ${idx === activeTicketIndex ? "active" : ""}`}
                                   onClick={() => setActiveTicketIndex(idx)}
                                   style={{
                                     width: "6px",
                                     height: "6px",
                                     borderRadius: "50%",
                                     background: idx === activeTicketIndex ? "var(--accent-primary)" : "var(--fg-tertiary)",
                                     cursor: "pointer",
                                     transition: "all 0.2s"
                                   }}
                                 />
                               ))}
                             </div>
                             <button 
                               className="btn btn-secondary" 
                               style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                               onClick={() => setActiveTicketIndex((prev) => (prev < userEventBookings.length - 1 ? prev + 1 : 0))}
                             >
                               Next &rarr;
                             </button>
                           </div>
                         )}

                         {/* Book Another Ticket option */}
                         <button 
                           className="btn btn-primary btn-block"
                           onClick={handleBookClick}
                           disabled={isSoldOut || bookingLoading}
                           style={{ marginTop: "0.5rem" }}
                         >
                           {bookingLoading 
                             ? "Processing..." 
                             : isSoldOut 
                               ? "Sold Out" 
                               : event.price > 0 
                                 ? "Book Another Pass" 
                                 : "Register Another Free Pass"}
                         </button>
                       </div>
                     ) : (
                       <button 
                         className="btn btn-primary btn-block"
                         onClick={handleBookClick}
                         disabled={isSoldOut || bookingLoading}
                       >
                         {bookingLoading 
                           ? "Processing..." 
                           : isSoldOut 
                             ? "Sold Out" 
                             : event.price > 0 
                               ? "Purchase Pass" 
                               : "Register Free"}
                       </button>
                     )}
                   </div>
                 </>
               )}
             </div>

            {/* Chat Room Card */}
            <div className="sidebar-card glass-panel chat-card">
              <div className="chat-tabs-header">
                <button 
                  className={`chat-tab-btn ${chatTab === "group" ? "active" : ""}`}
                  onClick={() => setChatTab("group")}
                >
                  Group Chat
                </button>
                <button 
                  className={`chat-tab-btn ${chatTab === "support" ? "active" : ""}`}
                  onClick={() => setChatTab("support")}
                >
                  Host Support
                </button>
              </div>

              {chatTab === "group" ? (
                /* 1. PUBLIC GROUP CHAT TAB */
                !isRegistered && !isHost ? (
                  <div className="chat-locked-overlay">
                    <Lock size={32} className="lock-icon" />
                    <h4>Chat Room Locked</h4>
                    <p>Only registered attendees can message and see messages here.</p>
                    <button
                      onClick={handleBookClick}
                      disabled={isSoldOut}
                      className="btn btn-outline btn-sm"
                    >
                      {isSoldOut ? "Event Sold Out" : "Book Ticket"}
                    </button>
                  </div>
                ) : (
                  <div className="live-chat-interface">
                    <div className="chat-msg-area scroll-container">
                      {eventChats.length === 0 ? (
                        <div className="empty-chat">
                          <MessageSquare size={20} />
                          <p>No messages yet. Say hello!</p>
                        </div>
                      ) : (
                        eventChats.map((msg) => (
                          <div 
                            key={msg.id} 
                            className={`chat-bubble ${msg.senderId === user?._id ? "own" : ""}`}
                          >
                            <span className="sender-name">{msg.sender}</span>
                            <p className="bubble-text">{msg.text}</p>
                            <span className="msg-time">{msg.time}</span>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={handleSendChat} className="chat-form">
                      <input 
                        type="text" 
                        placeholder="Send message to room..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="form-control"
                        required
                      />
                      <button type="submit" className="btn btn-primary send-btn">
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                )
              ) : (
                /* 2. DIRECT SUPPORT CHAT TAB */
                !isRegistered && !isHost ? (
                  <div className="chat-locked-overlay">
                    <Lock size={32} className="lock-icon" />
                    <h4>Support locked</h4>
                    <p>Only registered attendees or the event host can access direct support chat.</p>
                    <button
                      onClick={handleBookClick}
                      disabled={isSoldOut}
                      className="btn btn-outline btn-sm"
                    >
                      {isSoldOut ? "Event Sold Out" : "Book Ticket"}
                    </button>
                  </div>
                ) : isHost ? (
                  /* HOST VIEW: THREAD SELECTOR & CHAT */
                  <div className="live-chat-interface">
                    {selectedAttendeeId ? (
                      /* Active chat window inside Host view */
                      <div className="live-chat-interface">
                        <div className="thread-back-row">
                          <button 
                            className="btn-link-small" 
                            onClick={() => setSelectedAttendeeId(null)}
                          >
                            ← Back to Threads
                          </button>
                          <span className="thread-title-text text-truncate">
                            Chatting with {
                              directMessages.find(m => m.eventId === event._id && m.attendeeId === selectedAttendeeId)?.attendeeName || "Attendee"
                            }
                          </span>
                        </div>
                        
                        <div className="chat-msg-area scroll-container">
                          {directMessages
                            .filter(msg => msg.eventId === event._id && msg.attendeeId === selectedAttendeeId)
                            .length === 0 ? (
                              <div className="empty-chat">
                                <MessageSquare size={20} />
                                <p>No messages in this thread yet.</p>
                              </div>
                            ) : (
                              directMessages
                                .filter(msg => msg.eventId === event._id && msg.attendeeId === selectedAttendeeId)
                                .map((msg) => (
                                  <div 
                                    key={msg.id} 
                                    className={`chat-bubble ${msg.senderId === user?._id ? "own" : ""}`}
                                  >
                                    <span className="sender-name">{msg.senderName}</span>
                                    <p className="bubble-text">{msg.text}</p>
                                    <span className="msg-time">{msg.time}</span>
                                  </div>
                                ))
                            )}
                        </div>

                        <form onSubmit={(e) => {
                          e.preventDefault();
                          if (!supportInput.trim()) return;
                          const tMsg = directMessages.find(m => m.eventId === event._id && m.attendeeId === selectedAttendeeId);
                          const attName = tMsg ? tMsg.attendeeName : "Attendee";
                          sendDirectMessage(event._id, selectedAttendeeId, attName, supportInput);
                          setSupportInput("");
                        }} className="chat-form">
                          <input 
                            type="text" 
                            placeholder="Type reply to attendee..."
                            value={supportInput}
                            onChange={(e) => setSupportInput(e.target.value)}
                            className="form-control"
                            required
                          />
                          <button type="submit" className="btn btn-primary send-btn">
                            <Send size={14} />
                          </button>
                        </form>
                      </div>
                    ) : (
                      /* Directory list of attendee threads inside Host view */
                      <div className="threads-list scroll-container">
                        {(() => {
                          const eventDirectMessages = directMessages.filter(msg => msg.eventId === event._id);
                          const threads = {};
                          eventDirectMessages.forEach(msg => {
                            if (!threads[msg.attendeeId]) {
                              threads[msg.attendeeId] = {
                                attendeeId: msg.attendeeId,
                                attendeeName: msg.attendeeName,
                                lastMessage: msg.text,
                                time: msg.time
                              };
                            } else {
                              threads[msg.attendeeId].lastMessage = msg.text;
                              threads[msg.attendeeId].time = msg.time;
                            }
                          });
                          const threadList = Object.values(threads);

                          if (threadList.length === 0) {
                            return (
                              <div className="empty-threads">
                                <MessageSquare size={28} />
                                <p>No direct messages from attendees yet.</p>
                              </div>
                            );
                          }

                          return threadList.map((t) => (
                            <div 
                              key={t.attendeeId} 
                              className="thread-item"
                              onClick={() => setSelectedAttendeeId(t.attendeeId)}
                            >
                              <div className="thread-meta">
                                <span className="thread-user">{t.attendeeName}</span>
                                <span className="thread-time">{t.time}</span>
                              </div>
                              <p className="thread-last-msg">{t.lastMessage}</p>
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  /* ATTENDEE VIEW: CHATTING WITH HOST */
                  <div className="live-chat-interface">
                    <div className="support-header-row">
                      <span>Message Host ({event.hostName}) directly</span>
                    </div>

                    <div className="chat-msg-area scroll-container">
                      {directMessages.filter(msg => msg.eventId === event._id && msg.attendeeId === user?._id).length === 0 ? (
                        <div className="empty-chat">
                          <MessageSquare size={20} />
                          <p>Ask the host any questions about venue, time, or passes here!</p>
                        </div>
                      ) : (
                        directMessages
                          .filter(msg => msg.eventId === event._id && msg.attendeeId === user?._id)
                          .map((msg) => (
                            <div 
                              key={msg.id} 
                              className={`chat-bubble ${msg.senderId === user?._id ? "own" : ""}`}
                            >
                              <span className="sender-name">{msg.senderName}</span>
                              <p className="bubble-text">{msg.text}</p>
                              <span className="msg-time">{msg.time}</span>
                            </div>
                          ))
                      )}
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!supportInput.trim()) return;
                      sendDirectMessage(event._id, user._id, user.name, supportInput);
                      setSupportInput("");
                    }} className="chat-form">
                      <input 
                        type="text" 
                        placeholder="Type question to host..."
                        value={supportInput}
                        onChange={(e) => setSupportInput(e.target.value)}
                        className="form-control"
                        required
                      />
                      <button type="submit" className="btn btn-primary send-btn">
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                )
              )}
            </div>

          </div>

        </div>

      </main>

      {/* simulated Checkout Dialog */}
      {showCheckout && (
        <div className="checkout-overlay animate-fade-in" onClick={() => setShowCheckout(false)}>
          <div className="checkout-modal glass-panel animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="checkout-title">Secure Checkout</h3>
            <p className="checkout-desc">Checkout verification powered by EveFest Sandbox</p>
            
            {checkoutError && <div className="checkout-error-banner">{checkoutError}</div>}

            <div className="checkout-summary">
              <span>Event Pass Price:</span>
              <strong>${event.price}</strong>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="checkout-form">
              <div className="form-group">
                <label className="form-label">Name on Card</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={user?.name || "Jane Doe"} 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Credit Card Number</label>
                <div className="input-icon-wrapper">
                  <CreditCard size={16} />
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="0000 0000 0000 0000"
                    value={checkoutData.cardNum}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                      setCheckoutData((prev) => ({ ...prev, cardNum: val }));
                    }}
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
                    placeholder="MM/YY"
                    value={checkoutData.expiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^\d/]/g, "").slice(0, 5);
                      if (val.length === 2 && !val.includes("/")) {
                        val += "/";
                      }
                      setCheckoutData((prev) => ({ ...prev, expiry: val }));
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CVV</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="•••"
                    value={checkoutData.cvv}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 3);
                      setCheckoutData((prev) => ({ ...prev, cvv: val }));
                    }}
                    required
                  />
                </div>
              </div>

              <div className="checkout-btns">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowCheckout(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? "Processing..." : `Pay $${event.price}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shared Overlay Modals */}
      <AuthModal />

      <footer className="footer-layout">
        <div className="container footer-container">
          <div className="footer-left">
            <span className="footer-logo">EveFest</span>
            <p className="footer-text">© {new Date().getFullYear()} EveFest. Modern campus activities scheduler.</p>
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Support Desk</a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .event-detail-page {
          padding-top: 2rem;
          padding-bottom: 4rem;
        }

        .breadcrumb-row {
          margin-bottom: 1.5rem;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--fg-secondary);
          transition: var(--transition-fast);
        }
        .back-link:hover {
          color: var(--accent-primary);
        }

        /* Hero banner box */
        .event-hero {
          position: relative;
          height: 380px;
          border-radius: var(--border-radius-lg);
          overflow: hidden;
          margin-bottom: 2.5rem;
          box-shadow: var(--shadow-lg);
        }

        .hero-banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 2.5rem;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.9) 0%,
            rgba(0, 0, 0, 0.4) 60%,
            transparent 100%
          );
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .badge-row {
          display: flex;
          gap: 0.5rem;
        }

        .category-tag {
          background: var(--accent-primary);
          color: white;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.35rem 0.85rem;
          border-radius: var(--border-radius-full);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .format-tag {
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.35rem 0.85rem;
          border-radius: var(--border-radius-full);
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          letter-spacing: 0.5px;
          border: 1px solid transparent;
        }
        .format-tag.virtual {
          background: rgba(6, 182, 212, 0.25);
          color: var(--accent-secondary);
          border-color: rgba(6, 182, 212, 0.4);
        }
        .format-tag.physical {
          background: rgba(99, 102, 241, 0.25);
          color: var(--accent-primary);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .hero-title {
          font-size: 2.2rem;
          font-weight: 850;
          color: white;
          line-height: 1.2;
          letter-spacing: -0.03em;
        }

        .hero-host {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.9rem;
        }

        .host-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
          font-weight: 750;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid white;
        }

        /* Event logo image in hero */
        .host-logo-img {
          width: 38px;
          height: 38px;
          border-radius: var(--border-radius-sm);
          object-fit: contain;
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.5);
          backdrop-filter: blur(4px);
          padding: 2px;
        }

        /* Host Management Controls Bar */
        .host-controls-bar {
          position: absolute;
          top: 14px;
          right: 14px;
          display: flex;
          gap: 0.5rem;
          z-index: 10;
        }

        .host-ctrl-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.9rem;
          border-radius: var(--border-radius-sm);
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid transparent;
          backdrop-filter: blur(12px);
          transition: var(--transition-fast);
        }

        .host-ctrl-btn.edit-btn {
          background: rgba(99, 102, 241, 0.85);
          color: white;
          border-color: rgba(99, 102, 241, 0.5);
        }
        .host-ctrl-btn.edit-btn:hover {
          background: rgba(99, 102, 241, 1);
          transform: translateY(-1px);
        }

        .host-ctrl-btn.delete-btn {
          background: rgba(239, 68, 68, 0.8);
          color: white;
          border-color: rgba(239, 68, 68, 0.4);
        }
        .host-ctrl-btn.delete-btn:hover {
          background: rgba(239, 68, 68, 1);
          transform: translateY(-1px);
        }

        /* Rules Section */
        .rules-section {
          border-color: rgba(99, 102, 241, 0.15);
          background: rgba(99, 102, 241, 0.02);
        }

        .rules-header {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 0.5rem;
        }

        .rules-icon {
          color: var(--accent-primary);
          flex-shrink: 0;
        }

        .rules-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .rule-line {
          font-size: 0.9rem;
          line-height: 1.65;
          color: var(--fg-secondary);
          padding: 0.25rem 0;
          border-bottom: 1px solid var(--glass-border);
        }
        .rule-line:last-child {
          border-bottom: none;
        }


        .content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2.5rem;
          align-items: start;
        }

        .grid-main-col {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        /* Meta cards section layout */
        .meta-card-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          padding: 1.5rem;
          border-radius: var(--border-radius-md);
        }

        .meta-card-item {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
        }

        .meta-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
        }
        .purple-glow {
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.05);
        }
        .cyan-glow {
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.05);
        }

        .icon-purple {
          color: var(--accent-primary);
        }
        .icon-cyan {
          color: var(--accent-secondary);
        }

        .meta-item-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          overflow: hidden;
        }

        .meta-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--fg-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .meta-val {
          font-size: 0.95rem;
          font-weight: 750;
          color: var(--fg-primary);
          white-space: nowrap;
        }

        .meta-subval {
          font-size: 0.8rem;
          color: var(--fg-secondary);
          font-weight: 550;
          white-space: nowrap;
        }

        .text-truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Main Content sections */
        .content-section {
          padding: 2rem;
          border-radius: var(--border-radius-md);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .section-heading {
          font-size: 1.35rem;
          font-weight: 850;
          color: var(--fg-primary);
          letter-spacing: -0.02em;
        }

        .description-text {
          font-size: 0.98rem;
          line-height: 1.75;
          color: var(--fg-secondary);
          white-space: pre-line;
        }

        /* Location Map UI */
        .section-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .directions-text {
          font-size: 0.88rem;
          color: var(--fg-secondary);
          margin-top: 0.25rem;
          line-height: 1.5;
        }

        .btn-link-external {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--accent-primary);
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.85rem;
          border-radius: var(--border-radius-sm);
          background: rgba(99, 102, 241, 0.05);
          border: 1px dashed var(--accent-primary);
          transition: var(--transition-fast);
        }
        .btn-link-external:hover {
          background: rgba(99, 102, 241, 0.1);
        }

        .interactive-map-container {
          width: 100%;
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-md);
          overflow: hidden;
          background: var(--bg-secondary);
          box-shadow: var(--shadow-sm);
        }

        .legal-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: rgba(16, 185, 129, 0.06);
          border: 1px solid rgba(16, 185, 129, 0.15);
          border-radius: var(--border-radius-sm);
          color: var(--fg-primary);
          font-size: 0.88rem;
        }
        .verified-icon {
          color: var(--color-success);
          flex-shrink: 0;
        }

        /* SIDEBAR STYLES */
        .grid-sidebar-col {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .sidebar-card {
          padding: 1.75rem;
          border-radius: var(--border-radius-md);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          box-shadow: var(--shadow-md);
        }

        .booking-sticky-card {
          position: sticky;
          top: 90px;
        }

        .card-heading {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--fg-primary);
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.75rem;
        }

        .flex-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .live-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.68rem;
          font-weight: 800;
          color: var(--color-success);
          background: rgba(16, 185, 129, 0.08);
          padding: 0.15rem 0.5rem;
          border-radius: var(--border-radius-full);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-success);
          animation: pulse 2s infinite;
        }

        .price-tag-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .price-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--fg-secondary);
        }

        .price-value {
          font-size: 1.35rem;
          font-weight: 850;
          color: var(--fg-primary);
        }

        .capacity-badge-row {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .capacity-status {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--fg-secondary);
        }

        .progress-bar-bg {
          height: 6px;
          width: 100%;
          background: var(--bg-tertiary);
          border-radius: var(--border-radius-full);
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
          border-radius: var(--border-radius-full);
        }

        .booking-action-wrapper {
          width: 100%;
        }

        .btn-block {
          width: 100%;
          padding: 0.85rem 1.5rem;
        }

        .registered-actions {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .success-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          padding: 0.65rem;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: var(--border-radius-sm);
          color: var(--color-success);
          font-size: 0.88rem;
          font-weight: 700;
        }

        .ticket-reference-box {
          background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-sm);
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15rem;
        }

        .ref-lbl {
          font-size: 0.65rem;
          text-transform: uppercase;
          color: var(--fg-tertiary);
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .ref-val {
          font-family: var(--font-geist-mono), monospace;
          font-size: 0.95rem;
          font-weight: 750;
          color: var(--fg-primary);
        }

        .cancel-booking-btn {
          width: 100%;
          font-size: 0.85rem;
          padding: 0.65rem;
        }

        /* CHAT CARD & TAB CONTROL */
        .chat-card {
          height: 480px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 1.25rem;
        }

        .chat-tabs-header {
          display: flex;
          border-bottom: 1px solid var(--glass-border);
          margin-bottom: 1rem;
        }

        .chat-tab-btn {
          flex: 1;
          padding: 0.65rem;
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--fg-secondary);
          text-align: center;
          border-bottom: 2px solid transparent;
          transition: var(--transition-fast);
        }
        .chat-tab-btn:hover, .chat-tab-btn.active {
          color: var(--accent-primary);
        }
        .chat-tab-btn.active {
          border-bottom-color: var(--accent-primary);
        }

        .chat-locked-overlay {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 1rem;
          gap: 0.65rem;
        }
        .lock-icon {
          color: var(--fg-tertiary);
        }
        .chat-locked-overlay h4 {
          font-size: 1rem;
          font-weight: 800;
        }
        .chat-locked-overlay p {
          font-size: 0.8rem;
          color: var(--fg-secondary);
          line-height: 1.4;
          max-width: 220px;
          margin-bottom: 0.5rem;
        }

        .live-chat-interface {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-msg-area {
          flex-grow: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-right: 0.35rem;
          margin-bottom: 0.75rem;
        }

        .empty-chat {
          margin: auto;
          text-align: center;
          color: var(--fg-tertiary);
          font-size: 0.8rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
        }

        .chat-bubble {
          align-self: flex-start;
          background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-md);
          border-top-left-radius: 0;
          padding: 0.5rem 0.75rem;
          max-width: 85%;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          box-shadow: var(--shadow-sm);
        }

        .chat-bubble.own {
          align-self: flex-end;
          background: rgba(99, 102, 241, 0.08);
          border-color: rgba(99, 102, 241, 0.2);
          border-radius: var(--border-radius-md);
          border-top-right-radius: 0;
        }

        .sender-name {
          font-size: 0.68rem;
          font-weight: 750;
          color: var(--accent-primary);
        }

        .bubble-text {
          font-size: 0.85rem;
          color: var(--fg-primary);
          line-height: 1.4;
          word-break: break-word;
        }

        .msg-time {
          font-size: 0.62rem;
          color: var(--fg-tertiary);
          align-self: flex-end;
        }

        .chat-form {
          display: flex;
          gap: 0.5rem;
        }

        .send-btn {
          width: 40px;
          height: 40px;
          padding: 0;
          border-radius: var(--border-radius-sm);
          flex-shrink: 0;
        }

        /* Support chat elements */
        .support-header-row {
          font-size: 0.78rem;
          font-weight: 750;
          color: var(--fg-tertiary);
          text-transform: uppercase;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .thread-back-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.5rem;
          margin-bottom: 0.5rem;
          gap: 0.75rem;
        }

        .btn-link-small {
          font-size: 0.78rem;
          font-weight: 750;
          color: var(--accent-primary);
        }

        .thread-title-text {
          font-size: 0.78rem;
          font-weight: 750;
          color: var(--fg-secondary);
          text-transform: uppercase;
        }

        .threads-list {
          flex-grow: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          padding-right: 0.25rem;
        }

        .empty-threads {
          margin: auto;
          text-align: center;
          color: var(--fg-tertiary);
          font-size: 0.82rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .thread-item {
          padding: 0.75rem 0.85rem;
          background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          transition: var(--transition-fast);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .thread-item:hover {
          border-color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.02);
        }

        .thread-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .thread-user {
          font-size: 0.85rem;
          font-weight: 750;
          color: var(--fg-primary);
        }

        .thread-time {
          font-size: 0.65rem;
          color: var(--fg-tertiary);
        }

        .thread-last-msg {
          font-size: 0.78rem;
          color: var(--fg-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* CHECKOUT MODAL SYSTEM */
        .checkout-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .checkout-modal {
          width: 100%;
          max-width: 480px;
          padding: 2.5rem 2rem;
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-lg), 0 20px 40px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .checkout-title {
          font-size: 1.4rem;
          font-weight: 850;
        }

        .checkout-desc {
          font-size: 0.8rem;
          color: var(--fg-tertiary);
          margin-top: -0.5rem;
        }

        .checkout-error-banner {
          padding: 0.65rem 1rem;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--color-danger);
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: var(--border-radius-sm);
        }

        .checkout-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.85rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-sm);
          font-size: 0.95rem;
        }

        .checkout-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .checkout-form .form-control {
          width: 100%;
        }

        .form-control {
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-sm);
          background: var(--bg-secondary);
          color: var(--fg-primary);
          transition: var(--transition-fast);
          width: 100%;
        }

        .form-control:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }

        .input-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon-wrapper :global(svg) {
          position: absolute;
          left: 14px;
          color: var(--fg-tertiary);
          pointer-events: none;
        }
        .input-icon-wrapper input {
          padding-left: 2.75rem;
          width: 100%;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .checkout-btns {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        /* FOOTER */
        .footer-layout {
          margin-top: 4rem;
          background: var(--bg-secondary);
          border-top: 1px solid var(--glass-border);
          padding: 2.5rem 0;
        }
        .footer-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer-logo {
          font-size: 1.25rem;
          font-weight: 850;
          color: var(--fg-primary);
          margin-bottom: 0.25rem;
          display: block;
        }
        .footer-text {
          font-size: 0.8rem;
          color: var(--fg-tertiary);
        }
        .footer-links {
          display: flex;
          gap: 1.5rem;
        }
        .footer-link {
          font-size: 0.85rem;
          color: var(--fg-secondary);
          font-weight: 550;
        }
        .footer-link:hover {
          color: var(--accent-primary);
        }

        .takedown-warning-banner {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.5rem 2rem;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: var(--border-radius-md);
          color: var(--fg-primary);
          margin-bottom: 2rem;
          box-shadow: var(--shadow-md);
        }
        .takedown-warning-icon {
          color: var(--color-danger);
          flex-shrink: 0;
        }
        .takedown-warning-content h3 {
          font-size: 1rem;
          font-weight: 850;
          color: var(--color-danger);
          margin-bottom: 0.25rem;
          letter-spacing: -0.01em;
        }
        .takedown-warning-content p {
          font-size: 0.88rem;
          color: var(--fg-secondary);
          line-height: 1.5;
        }

        .ticket-stack-container {
          position: relative;
          width: 100%;
        }

        .ticket-card-stack-item {
          width: 100%;
          box-shadow: var(--shadow-lg);
        }

        /* RESPONSIVE BREAKPOINTS */
        @media (max-width: 968px) {
          .content-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .booking-sticky-card {
            position: static;
          }
          .event-hero {
            height: 300px;
          }
          .hero-title {
            font-size: 1.8rem;
          }
        }

        @media (max-width: 640px) {
          .meta-card-section {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .footer-container {
            flex-direction: column;
            gap: 1.5rem;
            text-align: center;
          }
          .footer-links {
            justify-content: center;
          }
          .event-hero {
            height: 240px;
          }
          .hero-overlay {
            padding: 1.5rem;
          }
          .hero-title {
            font-size: 1.45rem;
          }
        }
      `}</style>
    </>
  );
}

export default function EventDetailPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", gap: "1rem" }}>
        <div className="spinner"></div>
      </div>
    }>
      <EventDetailPageContent />
    </Suspense>
  );
}
