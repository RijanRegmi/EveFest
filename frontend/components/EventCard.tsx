"use client";

import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Tv, Users, ArrowRight, ShieldCheck } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { IEvent } from "@/types";

export interface EventCardProps {
  event: IEvent;
  onClick?: () => void;
}

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop";

export default function EventCard({ event, onClick }: EventCardProps) {
  const { bookings } = useApp();
  const isBooked = bookings && bookings.some((b) => {
    const bookingEventId = typeof b.event === "object" ? b.event._id : b.event;
    return bookingEventId === event._id;
  });
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

  // Resolve image URL - handles both absolute URLs and relative backend paths
  const resolveImageUrl = (url: string | null | undefined) => {
    if (!url) return DEFAULT_BANNER;
    if (url.startsWith("http") || url.startsWith("blob:")) return url;
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    const cleanBackend = BACKEND_URL.endsWith("/") ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
    return `${cleanBackend}${cleanUrl}`;
  };

  const [imgSrc, setImgSrc] = useState<string>(resolveImageUrl(event.image));

  useEffect(() => {
    setImgSrc(resolveImageUrl(event.image));
  }, [event.image]);

  // Format Date helpers
  const eventDate = new Date(event.date);
  const monthStr = isNaN(eventDate.getTime()) ? "SEP" : eventDate.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const dayStr = isNaN(eventDate.getTime()) ? "15" : eventDate.getDate();

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
        <img
          src={imgSrc}
          alt={event.title}
          className="banner-img"
          loading="lazy"
          onError={() => setImgSrc(DEFAULT_BANNER)}
        />
        
        {/* Gradient overlay for contrast and depth */}
        <div className="banner-gradient" />

        {isBooked && (
          <div className="booked-badge">
            <ShieldCheck size={13} />
            BOOKED
          </div>
        )}

        {/* Date Box overlay - top-left */}
        <div className="date-badge">
          <span className="date-month">{monthStr}</span>
          <span className="date-day">{dayStr}</span>
        </div>

        {/* Category Overlay - top-right */}
        <div className="category-badge">
          {event.category || "Event"}
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body">
        {/* Host info row */}
        <div className="host-info-row">
          {event.logo ? (
            <img
              src={resolveImageUrl(event.logo)}
              alt={`${event.hostName} logo`}
              className="host-logo-thumb"
              onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
            />
          ) : (
            <div className="host-avatar-thumb">
              {event.hostName?.charAt(0)?.toUpperCase() || "E"}
            </div>
          )}
          <span className="event-host">Hosted by {event.hostName || "EveFest Hub"}</span>
        </div>

        {/* Title */}
        <h3 className="event-title">{event.title}</h3>

        {/* Event Meta Details */}
        <div className="meta-list">
          {/* Format / Location */}
          <div className="meta-item">
            {event.isOnline ? (
              <>
                <Tv size={16} className="meta-icon text-cyan" />
                <span className="meta-text font-bold text-cyan">Online Event & Group Chat</span>
              </>
            ) : (
              <>
                <MapPin size={16} className="meta-icon text-red" />
                <span className="meta-text">{event.location || "Campus Venue"}</span>
              </>
            )}
          </div>

          {/* Seats Availability */}
          <div className="meta-item">
            <Users size={16} className="meta-icon" />
            <span className={`meta-text ${seatsLeft !== null && seatsLeft < 15 && seatsLeft > 0 ? "text-warning font-bold" : ""}`}>
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
        <div className="price-box">
          <span className="price-label">Price</span>
          <span className={`price-tag ${event.price === 0 ? "free" : ""}`}>
            {priceDisplay}
          </span>
        </div>
        
        <button className="btn btn-primary footer-btn" disabled={isSoldOut}>
          <span>{isSoldOut ? "Sold Out" : "Book Pass"}</span>
          <ArrowRight size={16} className="btn-arrow" />
        </button>
      </div>

      <style jsx>{`
        .event-card {
          display: flex;
          flex-direction: column;
          border-radius: var(--border-radius-lg);
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          height: 100%;
          border: 1px solid var(--glass-border);
          background: var(--bg-secondary);
        }
        
        .event-card:hover {
          transform: translateY(-8px);
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 14px 35px -5px rgba(0, 0, 0, 0.25), 
                      0 0 20px rgba(99, 102, 241, 0.2);
        }
        
        .card-banner {
          position: relative;
          height: 220px;
          overflow: hidden;
          width: 100%;
          background: var(--bg-tertiary);
        }
        
        .banner-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.45) 0%,
            rgba(0, 0, 0, 0.05) 45%,
            rgba(0, 0, 0, 0.65) 100%
          );
          z-index: 1;
          pointer-events: none;
        }
        
        .banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: center center;
        }
        
        .event-card:hover .banner-img {
          transform: scale(1.07);
        }
        
        /* Badges Overlay */
        .booked-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(16, 185, 129, 0.9);
          color: white;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.3rem 0.7rem;
          border-radius: var(--border-radius-full);
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          gap: 0.3rem;
          z-index: 5;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .date-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(10px);
          border-radius: var(--border-radius-md);
          padding: 0.5rem 0.8rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 1;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          z-index: 2;
          min-width: 52px;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .event-card:hover .date-badge {
          transform: scale(1.05) translateY(-2px);
          background: rgba(99, 102, 241, 0.85);
          border-color: rgba(255, 255, 255, 0.3);
        }
        
        .date-month {
          font-size: 0.68rem;
          font-weight: 900;
          color: #ff4d4d;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          line-height: 1;
          transition: color 0.3s ease;
        }

        .event-card:hover .date-month {
          color: #ffffff;
        }
        
        .date-day {
          font-size: 1.4rem;
          font-weight: 900;
          color: #ffffff;
          margin-top: 2px;
          line-height: 1;
          text-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
        
        .category-badge {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(99, 102, 241, 0.85);
          backdrop-filter: blur(10px);
          color: white;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.32rem 0.85rem;
          border-radius: var(--border-radius-full);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          z-index: 2;
          letter-spacing: 0.03em;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .event-card:hover .category-badge {
          background: var(--accent-primary);
          transform: scale(1.05) translateY(-1px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
        }
        
        /* Card Body */
        .card-body {
          padding: 1.25rem 1.4rem 1rem;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        
        /* Host info row */
        .host-info-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 0.65rem;
        }
        
        .host-logo-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--glass-border);
          flex-shrink: 0;
          background: var(--bg-tertiary);
        }
        
        .host-avatar-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff3030, #6366f1);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 800;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }
        
        .event-host {
          font-size: 0.82rem;
          color: var(--fg-tertiary);
          font-weight: 600;
          margin-bottom: 0;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .event-title {
          font-size: 1.2rem;
          font-weight: 750;
          line-height: 1.35;
          margin-bottom: 0.75rem;
          color: var(--fg-primary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.2s ease;
        }

        .event-card:hover .event-title {
          color: var(--accent-primary);
        }
        
        .meta-list {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          margin-top: auto;
          padding-top: 0.5rem;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          color: var(--fg-secondary);
          font-size: 0.88rem;
          font-weight: 550;
        }
        
        .meta-icon {
          color: var(--fg-tertiary);
          flex-shrink: 0;
        }
        
        .text-cyan {
          color: var(--accent-secondary) !important;
        }
        
        .text-red {
          color: #ff3030 !important;
        }

        .text-warning {
          color: var(--color-warning) !important;
        }
        
        .font-bold {
          font-weight: 700;
        }

        .meta-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        /* Card Footer */
        .card-footer {
          padding: 1.1rem 1.4rem;
          border-top: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.015);
        }
        
        .price-box {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .price-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--fg-tertiary);
          font-weight: 700;
        }

        .price-tag {
          font-size: 1.25rem;
          font-weight: 850;
          color: var(--fg-primary);
        }
        
        .price-tag.free {
          color: var(--color-success);
        }
        
        .footer-btn {
          padding: 0.55rem 1.25rem;
          font-size: 0.88rem;
          font-weight: 700;
          border-radius: var(--border-radius-full);
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .event-card:hover :global(.btn-arrow) {
          transform: translateX(4px);
        }

        .footer-btn :global(.btn-arrow) {
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        /* Sold out styling */
        .sold-out {
          opacity: 0.8;
        }
        .sold-out .banner-img {
          filter: grayscale(85%);
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
