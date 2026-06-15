"use client";

import React from "react";
import { Calendar, MapPin, Tv, Users, ArrowRight, ShieldCheck } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { IEvent } from "@/types";

export interface EventCardProps {
  event: IEvent;
  onClick?: () => void;
}

export default function EventCard({ event, onClick }: EventCardProps) {
  const { bookings } = useApp();
  const isBooked = bookings && bookings.some((b) => {
    const bookingEventId = typeof b.event === "object" ? b.event._id : b.event;
    return bookingEventId === event._id;
  });
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

  // Resolve image URL - handles both absolute URLs and relative backend paths
  const resolveImageUrl = (url: string | null | undefined) => {
    if (!url) return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop";
    if (url.startsWith("http") || url.startsWith("blob:")) return url;
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    const cleanBackend = BACKEND_URL.endsWith("/") ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
    return `${cleanBackend}${cleanUrl}`;
  };

  // Format Date helpers
  const eventDate = new Date(event.date);
  const monthStr = eventDate.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const dayStr = eventDate.getDate();

  // Price formatting
  const priceDisplay = event.price === 0 ? "FREE" : `$${event.price}`;

  // Seating capacity text
  const isUnlimited = event.limit === "unlimited" || !event.limit;
  const registeredCount = Number(event.registeredCount || 0);
  const limitValue = typeof event.limit === "number" ? event.limit : 0;
  const seatsLeft = isUnlimited ? null : Math.max(0, limitValue - registeredCount);
  const isSoldOut = !isUnlimited && seatsLeft !== null && seatsLeft <= 0;

  return (
    <div className={`event-card glass-panel ${isSoldOut ? "sold-out" : ""}`} onClick={onClick}>
      {/* Image Banner */}
      <div className="card-banner">
        <img src={resolveImageUrl(event.image)} alt={event.title} className="banner-img" loading="lazy" />
        
        {/* Gradient overlay for better badge readability */}
        <div className="banner-gradient" />

        {isBooked && (
          <div className="booked-badge" style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(16, 185, 129, 0.85)", color: "white", fontSize: "0.72rem", fontWeight: "800", padding: "0.25rem 0.65rem", borderRadius: "var(--border-radius-sm)", border: "1px solid rgba(16, 185, 129, 0.35)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: "0.25rem", zIndex: 5 }}>
            <ShieldCheck size={12} />
            BOOKED
          </div>
        )}

        {/* Date Box overlay - top-left, prominent */}
        <div className="date-badge">
          <span className="date-month">{monthStr}</span>
          <span className="date-day">{dayStr}</span>
        </div>

        {/* Category Overlay */}
        <div className="category-badge">
          {event.category}
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body">
        {/* Host info row: logo + name */}
        <div className="host-info-row">
          {event.logo ? (
            <img
              src={resolveImageUrl(event.logo)}
              alt={`${event.hostName} logo`}
              className="host-logo-thumb"
            />
          ) : (
            <div className="host-avatar-thumb">
              {event.hostName?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
          <p className="event-host">Hosted by {event.hostName}</p>
        </div>

        {/* Title */}
        <h3 className="event-title">{event.title}</h3>

        {/* Event Meta Details */}
        <div className="meta-list">
          {/* Format */}
          <div className="meta-item">
            {event.isOnline ? (
              <>
                <Tv size={16} className="meta-icon text-cyan" />
                <span className="meta-text font-bold text-cyan">Online Event & Group Chat</span>
              </>
            ) : (
              <>
                <MapPin size={16} className="meta-icon text-indigo" />
                <span className="meta-text">{event.location}</span>
              </>
            )}
          </div>

          {/* Seats left */}
          <div className="meta-item">
            <Users size={16} className="meta-icon" />
            <span className="meta-text">
              {isUnlimited 
                ? "Unlimited Seats Available" 
                : isSoldOut 
                  ? "Registration Closed (Full)" 
                  : `${seatsLeft} seats remaining`
              }
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="card-footer">
        <span className={`price-tag ${event.price === 0 ? "free" : ""}`}>
          {priceDisplay}
        </span>
        
        <button className="btn btn-outline footer-btn" disabled={isSoldOut}>
          {isSoldOut ? "Sold Out" : "Book Pass"}
          <ArrowRight size={15} />
        </button>
      </div>

      <style jsx>{`
        .event-card {
          display: flex;
          flex-direction: column;
          border-radius: var(--border-radius-md);
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          height: 100%;
        }
        
        .event-card:hover {
          transform: translateY(-6px) scale(1.01);
          border-color: var(--accent-primary);
          box-shadow: var(--shadow-lg), 0 8px 30px rgba(99, 102, 241, 0.15);
        }
        
        .event-card :global(.footer-btn svg) {
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .event-card:hover :global(.footer-btn svg) {
          transform: translateX(4px);
        }
        
        .card-banner {
          position: relative;
          height: 190px;
          overflow: hidden;
          width: 100%;
        }
        
        .banner-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.35) 0%,
            transparent 45%,
            transparent 60%,
            rgba(0,0,0,0.4) 100%
          );
          z-index: 1;
          pointer-events: none;
        }
        
        .banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: center center;
        }
        
        .event-card:hover .banner-img {
          transform: scale(1.07);
        }
        
        /* Badges Overlay */
        .date-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
          border-radius: var(--border-radius-sm);
          padding: 0.45rem 0.75rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 1;
          box-shadow: 0 3px 12px rgba(99, 102, 241, 0.5);
          border: none;
          z-index: 2;
          min-width: 46px;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .event-card:hover .date-badge {
          transform: scale(1.06) translateY(-2px);
        }
        
        .date-month {
          font-size: 0.65rem;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.9);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          line-height: 1;
        }
        
        .date-day {
          font-size: 1.45rem;
          font-weight: 900;
          color: #ffffff;
          margin-top: 1px;
          line-height: 1;
          text-shadow: 0 1px 4px rgba(0,0,0,0.25);
        }
        
        .category-badge {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: var(--accent-primary);
          color: white;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.28rem 0.7rem;
          border-radius: var(--border-radius-full);
          box-shadow: 0 2px 8px rgba(99,102,241,0.4);
          z-index: 2;
          letter-spacing: 0.02em;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .event-card:hover .category-badge {
          transform: scale(1.05) translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.6);
        }
        
        /* Card Body */
        .card-body {
          padding: 1rem 1.25rem 0.75rem;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        
        /* Host info row */
        .host-info-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.5rem;
        }
        
        .host-logo-thumb {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--glass-border);
          flex-shrink: 0;
          background: var(--bg-tertiary);
        }
        
        .host-avatar-thumb {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 800;
          flex-shrink: 0;
        }
        
        .event-title {
          font-size: 1.15rem;
          font-weight: 750;
          line-height: 1.3;
          margin-bottom: 0.35rem;
          color: var(--fg-primary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .event-host {
          font-size: 0.78rem;
          color: var(--fg-tertiary);
          font-weight: 600;
          margin-bottom: 0;
          line-height: 1.2;
        }
        
        .meta-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: auto;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--fg-secondary);
          font-size: 0.85rem;
          font-weight: 550;
        }
        
        .meta-icon {
          color: var(--fg-tertiary);
          flex-shrink: 0;
        }
        
        .text-cyan {
          color: var(--accent-secondary) !important;
        }
        
        .text-indigo {
          color: var(--accent-primary) !important;
        }
        
        .font-bold {
          font-weight: 700;
        }
        
        /* Card Footer */
        .card-footer {
          padding: 1rem 1.25rem;
          border-top: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(99, 102, 241, 0.02);
        }
        
        .price-tag {
          font-size: 1.15rem;
          font-weight: 850;
          color: var(--fg-primary);
        }
        
        .price-tag.free {
          color: var(--color-success);
        }
        
        .footer-btn {
          padding: 0.45rem 1rem;
          font-size: 0.85rem;
          font-weight: 700;
          border-radius: var(--border-radius-sm);
        }
        
        /* Sold out styling */
        .sold-out {
          opacity: 0.75;
        }
        .sold-out .banner-img {
          filter: grayscale(80%);
        }
        .sold-out:hover {
          transform: none;
          border-color: var(--glass-border);
          box-shadow: var(--shadow-sm);
        }
      `}</style>
    </div>
  );
}
