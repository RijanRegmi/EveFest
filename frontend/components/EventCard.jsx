"use client";

import React from "react";
import { Calendar, MapPin, Tv, Users, ArrowRight } from "lucide-react";

export default function EventCard({ event, onClick }) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

  // Resolve image URL - handles both absolute URLs and relative backend paths
  const resolveImageUrl = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop";
    if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("/")) return url;
    return `${BACKEND_URL}${url}`;
  };

  // Format Date helpers
  const eventDate = new Date(event.date);
  const monthStr = eventDate.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const dayStr = eventDate.getDate();

  // Price formatting
  const priceDisplay = event.price === 0 ? "FREE" : `$${event.price}`;

  // Seating capacity text
  const isUnlimited = event.limit === "unlimited" || !event.limit;
  const seatsLeft = isUnlimited ? null : Math.max(0, event.limit - (event.registeredCount || 0));
  const isSoldOut = !isUnlimited && seatsLeft <= 0;

  return (
    <div className={`event-card glass-panel ${isSoldOut ? "sold-out" : ""}`} onClick={onClick}>
      {/* Image Banner */}
      <div className="card-banner">
        <img src={resolveImageUrl(event.image)} alt={event.title} className="banner-img" loading="lazy" />
        
        {/* Date Box overlay */}
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
        {/* Title */}
        <h3 className="event-title">{event.title}</h3>
        <p className="event-host">Hosted by {event.hostName}</p>

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
          transition: var(--transition-smooth);
          height: 100%;
        }
        
        .event-card:hover {
          transform: translateY(-6px);
          border-color: var(--accent-primary);
          box-shadow: var(--shadow-lg), 0 4px 20px rgba(99, 102, 241, 0.1);
        }
        
        .card-banner {
          position: relative;
          height: 180px;
          overflow: hidden;
          width: 100%;
        }
        
        .banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition-smooth);
        }
        
        .event-card:hover .banner-img {
          transform: scale(1.06);
        }
        
        /* Badges Overlay */
        .date-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: var(--border-radius-sm);
          padding: 0.4rem 0.65rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 1;
          box-shadow: var(--shadow-sm);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .dark .date-badge {
          background: rgba(18, 18, 20, 0.9);
          border-color: rgba(255, 255, 255, 0.05);
        }
        
        .date-month {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--accent-primary);
        }
        
        .date-day {
          font-size: 1.15rem;
          font-weight: 850;
          color: var(--fg-primary);
          margin-top: 2px;
        }
        
        .category-badge {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: var(--accent-primary);
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.3rem 0.75rem;
          border-radius: var(--border-radius-full);
          box-shadow: var(--shadow-sm);
        }
        
        /* Card Body */
        .card-body {
          padding: 1.25rem;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
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
          font-size: 0.8rem;
          color: var(--fg-tertiary);
          font-weight: 600;
          margin-bottom: 1rem;
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
