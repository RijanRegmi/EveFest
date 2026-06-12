"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Ticket, ShieldAlert, Users, Calendar, MapPin, QrCode, Download, Trash2, ShieldCheck, UserCheck } from "lucide-react";

export default function Dashboard() {
  const { user, events, setEvents, bookings, cancelBooking, showToast } = useApp();
  const [activeTab, setActiveTab] = useState("tickets"); // 'tickets' | 'hosted'
  const [attendeeModal, setAttendeeModal] = useState({ open: false, eventId: null });

  // Filter events hosted by this user
  const hostedEvents = events.filter((e) => e.hostId === user?._id);

  const handleCancelTicket = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this ticket booking?")) {
      await cancelBooking(bookingId);
    }
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm("Are you sure you want to cancel/delete this event? This action is permanent.")) {
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
      showToast("Event cancelled and removed.");
    }
  };

  // Generate simulated attendee roster
  const getMockAttendees = () => {
    return [
      { name: "Emily Johnson", email: "emily.j@university.edu", date: "2026-06-10" },
      { name: "David Kim", email: "d.kim@university.edu", date: "2026-06-11" },
      { name: "Sarah Al-Fayed", email: "sarah.af@university.edu", date: "2026-06-11" },
      { name: "Michael Chen", email: "m.chen@university.edu", date: "2026-06-12" },
    ];
  };

  return (
    <div className="dashboard-section container animate-fade-in">
      <div className="dashboard-header">
        <h2 className="dashboard-title">
          Welcome back, <span className="text-gradient">{user?.name}</span>
        </h2>
        <p className="dashboard-subtitle">Manage your event registrations, hosted events, and digital ticket passes.</p>
      </div>

      {/* Tab Selectors */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === "tickets" ? "active" : ""}`}
          onClick={() => setActiveTab("tickets")}
        >
          <Ticket size={18} />
          My Tickets ({bookings.length})
        </button>

        <button 
          className={`tab-btn ${activeTab === "hosted" ? "active" : ""}`}
          onClick={() => setActiveTab("hosted")}
        >
          <Users size={18} />
          My Hosted Events ({hostedEvents.length})
        </button>
      </div>

      <div className="dashboard-content">
        
        {/* TICKETS TAB */}
        {activeTab === "tickets" && (
          <div className="tickets-grid">
            {bookings.length === 0 ? (
              <div className="empty-state glass-panel">
                <Ticket size={48} className="empty-icon" />
                <h3>No Registered Tickets</h3>
                <p>You haven't booked any event passes yet. Browse live events on the main page to get started.</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking._id} className="ticket-pass glass-panel animate-slide-up">
                  
                  {/* Left Side: Ticket Meta */}
                  <div className="ticket-details-side">
                    <span className="ticket-status-badge">{booking.paymentStatus}</span>
                    <h3 className="ticket-event-title">{booking.event.title}</h3>
                    
                    <div className="ticket-meta-info">
                      <div className="ticket-meta-item">
                        <Calendar size={14} />
                        <span>{booking.event.date} | {booking.event.time}</span>
                      </div>
                      <div className="ticket-meta-item">
                        <MapPin size={14} />
                        <span>{booking.event.location}</span>
                      </div>
                    </div>

                    <div className="ticket-footer-row">
                      <div className="ticket-code-group">
                        <span className="code-label">Ticket Reference:</span>
                        <span className="code-val">{booking.ticketCode}</span>
                      </div>
                      <button 
                        className="btn btn-secondary cancel-ticket-btn"
                        onClick={() => handleCancelTicket(booking._id)}
                      >
                        Cancel Booking
                      </button>
                    </div>
                  </div>

                  {/* Right Side: QR Code Area */}
                  <div className="ticket-qr-side">
                    <div className="qr-box">
                      <QrCode size={75} className="qr-svg" />
                    </div>
                    <span className="qr-tip font-mono">SCAN ACCESS</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* HOSTED EVENTS TAB */}
        {activeTab === "hosted" && (
          <div className="hosted-list">
            {hostedEvents.length === 0 ? (
              <div className="empty-state glass-panel">
                <Users size={48} className="empty-icon" />
                <h3>No Hosted Events</h3>
                <p>You haven't hosted any events yet. Click "Host an Event" in the navigation bar to create one.</p>
              </div>
            ) : (
              <div className="hosted-table-wrapper glass-panel">
                <table className="hosted-table">
                  <thead>
                    <tr>
                      <th>Event Details</th>
                      <th>Format</th>
                      <th>Price</th>
                      <th>Registered</th>
                      <th>Verification</th>
                      <th className="actions-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hostedEvents.map((evt) => (
                      <tr key={evt._id} className="table-row">
                        <td>
                          <div className="table-event-info">
                            <span className="table-event-title">{evt.title}</span>
                            <span className="table-event-date">{evt.date}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`format-badge ${evt.isOnline ? "online" : "offline"}`}>
                            {evt.isOnline ? "Virtual" : "In-Person"}
                          </span>
                        </td>
                        <td>
                          <span className="table-price">{evt.price === 0 ? "Free" : `$${evt.price}`}</span>
                        </td>
                        <td>
                          <button 
                            className="table-attendee-count-btn"
                            onClick={() => setAttendeeModal({ open: true, eventId: evt._id })}
                          >
                            <UserCheck size={14} />
                            {evt.registeredCount || 0} Registered
                          </button>
                        </td>
                        <td>
                          {evt.proofDoc ? (
                            <div className="legal-proof-link">
                              <ShieldCheck size={14} className="text-success" />
                              <span className="proof-name" title={evt.proofDoc}>{evt.proofDoc.slice(0, 15)}...</span>
                              <button 
                                className="btn-icon-small" 
                                onClick={() => showToast(`Downloaded ${evt.proofDoc} (mock file)`)}
                                title="Download uploaded file proof"
                              >
                                <Download size={12} />
                              </button>
                            </div>
                          ) : (
                            <span className="not-verified">None Uploaded</span>
                          )}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button 
                              className="btn btn-secondary btn-icon-small delete-btn"
                              onClick={() => handleDeleteEvent(evt._id)}
                              title="Cancel Event"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Attendee Roster Modal (Heuristic 1: System Status & Visibility) */}
      {attendeeModal.open && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setAttendeeModal({ open: false, eventId: null })}>
          <div className="modal-content glass-panel animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setAttendeeModal({ open: false, eventId: null })}>
              <X size={18} />
            </button>

            <h3 className="roster-title">Registered Attendees</h3>
            <p className="roster-subtitle">Attendee roster for event reference</p>

            <div className="roster-list-box">
              <div className="roster-header-row">
                <span>Attendee Info</span>
                <span>Registration Date</span>
              </div>
              <div className="roster-items scroll-container">
                {getMockAttendees().map((attendee, index) => (
                  <div key={index} className="roster-item">
                    <div className="roster-info">
                      <span className="roster-name">{attendee.name}</span>
                      <span className="roster-email">{attendee.email}</span>
                    </div>
                    <span className="roster-date">{attendee.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard-section {
          padding: 3rem 0;
          flex-grow: 1;
        }
        
        .dashboard-header {
          margin-bottom: 2rem;
        }
        
        .dashboard-title {
          font-size: 2.2rem;
          font-weight: 850;
        }
        
        .dashboard-subtitle {
          color: var(--fg-secondary);
          font-size: 0.95rem;
          margin-top: 0.25rem;
        }
        
        /* Dashboard Tabs selector */
        .dashboard-tabs {
          display: flex;
          gap: 1rem;
          border-bottom: 1px solid var(--glass-border);
          margin-bottom: 2rem;
        }
        
        .tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.85rem 1.25rem;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--fg-secondary);
          border-bottom: 2px solid transparent;
          transition: var(--transition-fast);
          margin-bottom: -1px;
        }
        
        .tab-btn:hover, .tab-btn.active {
          color: var(--accent-primary);
        }
        
        .tab-btn.active {
          border-color: var(--accent-primary);
        }
        
        /* Tickets View styling */
        .tickets-grid {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          max-width: 750px;
        }
        
        .ticket-pass {
          display: flex;
          border-radius: var(--border-radius-md);
          overflow: hidden;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          transition: var(--transition-smooth);
        }
        
        .ticket-pass:hover {
          border-color: var(--accent-primary);
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.08);
        }
        
        .ticket-details-side {
          flex-grow: 1;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          border-right: 2px dashed var(--glass-border);
          position: relative;
        }
        
        .ticket-status-badge {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.15);
          color: var(--color-success);
          font-size: 0.7rem;
          font-weight: 750;
          padding: 0.2rem 0.55rem;
          border-radius: var(--border-radius-full);
          width: fit-content;
          text-transform: uppercase;
        }
        
        .ticket-event-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--fg-primary);
        }
        
        .ticket-meta-info {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
        }
        
        .ticket-meta-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.82rem;
          color: var(--fg-secondary);
          font-weight: 550;
        }
        
        .ticket-footer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.5rem;
          border-top: 1px solid var(--glass-border);
          padding-top: 0.85rem;
        }
        
        .ticket-code-group {
          display: flex;
          flex-direction: column;
        }
        .code-label {
          font-size: 0.68rem;
          color: var(--fg-tertiary);
          font-weight: 600;
        }
        .code-val {
          font-size: 0.85rem;
          font-weight: 750;
          color: var(--fg-primary);
        }
        
        .cancel-ticket-btn {
          font-size: 0.78rem;
          padding: 0.45rem 0.85rem;
        }
        
        .ticket-qr-side {
          width: 140px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: rgba(99, 102, 241, 0.015);
          padding: 1rem;
          flex-shrink: 0;
        }
        
        .qr-box {
          padding: 0.4rem;
          background: white;
          border-radius: var(--border-radius-sm);
          box-shadow: var(--shadow-sm);
        }
        
        .qr-svg {
          color: black;
          display: block;
        }
        
        .qr-tip {
          font-size: 0.6rem;
          font-weight: 750;
          color: var(--fg-tertiary);
          letter-spacing: 1px;
        }
        
        /* Empty states */
        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        
        .empty-icon {
          color: var(--fg-tertiary);
        }
        
        .empty-state h3 {
          font-size: 1.2rem;
          font-weight: 800;
        }
        
        .empty-state p {
          font-size: 0.88rem;
          color: var(--fg-secondary);
          max-width: 380px;
        }
        
        /* Hosted Table */
        .hosted-table-wrapper {
          overflow-x: auto;
          border-radius: var(--border-radius-md);
        }
        
        .hosted-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        
        .hosted-table th {
          background: var(--bg-secondary);
          padding: 1rem 1.25rem;
          font-size: 0.78rem;
          font-weight: 750;
          text-transform: uppercase;
          color: var(--fg-tertiary);
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--glass-border);
        }
        
        .hosted-table td {
          padding: 1.1rem 1.25rem;
          border-bottom: 1px solid var(--glass-border);
          font-size: 0.88rem;
        }
        
        .table-event-info {
          display: flex;
          flex-direction: column;
        }
        .table-event-title {
          font-weight: 750;
          color: var(--fg-primary);
        }
        .table-event-date {
          font-size: 0.75rem;
          color: var(--fg-tertiary);
          margin-top: 1px;
        }
        
        .format-badge {
          font-size: 0.75rem;
          font-weight: 750;
          padding: 0.2rem 0.55rem;
          border-radius: var(--border-radius-full);
          text-transform: uppercase;
        }
        .format-badge.online {
          background: rgba(6, 182, 212, 0.08);
          border: 1px solid rgba(6, 182, 212, 0.15);
          color: var(--accent-secondary);
        }
        .format-badge.offline {
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.15);
          color: var(--accent-primary);
        }
        
        .table-price {
          font-weight: 700;
        }
        
        .table-attendee-count-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.04);
          border: 1px dashed var(--accent-primary);
          padding: 0.3rem 0.6rem;
          border-radius: var(--border-radius-sm);
          transition: var(--transition-fast);
        }
        .table-attendee-count-btn:hover {
          background: rgba(99, 102, 241, 0.08);
        }
        
        .legal-proof-link {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: var(--fg-secondary);
        }
        .proof-name {
          max-width: 90px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 550;
        }
        
        .btn-icon-small {
          width: 28px;
          height: 28px;
          border-radius: var(--border-radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          color: var(--fg-secondary);
          transition: var(--transition-fast);
        }
        .btn-icon-small:hover {
          background: var(--glass-border);
          color: var(--accent-primary);
        }
        
        .delete-btn:hover {
          color: var(--color-danger) !important;
          border-color: rgba(239, 68, 68, 0.2);
          background: rgba(239, 68, 68, 0.08);
        }
        
        .not-verified {
          font-size: 0.78rem;
          color: var(--fg-tertiary);
          font-weight: 550;
        }
        
        /* Attendee Roster Modal Specifics */
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
          z-index: 1100;
          padding: 1.5rem;
        }
        .modal-content {
          width: 100%;
          max-width: 480px;
          max-height: 80vh;
          border-radius: var(--border-radius-md);
          padding: 2.25rem 2rem;
          position: relative;
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
        }
        .close-btn {
          position: absolute;
          top: 18px;
          right: 18px;
          color: var(--fg-tertiary);
        }
        .close-btn:hover {
          color: var(--fg-primary);
        }
        
        .roster-title {
          font-size: 1.25rem;
          font-weight: 850;
        }
        .roster-subtitle {
          font-size: 0.78rem;
          color: var(--fg-tertiary);
          margin-bottom: 1.25rem;
        }
        
        .roster-list-box {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          overflow: hidden;
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-sm);
        }
        
        .roster-header-row {
          display: flex;
          justify-content: space-between;
          padding: 0.65rem 1rem;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--glass-border);
          font-size: 0.72rem;
          font-weight: 750;
          color: var(--fg-tertiary);
          text-transform: uppercase;
        }
        
        .roster-items {
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        
        .roster-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem 1rem;
          border-bottom: 1px solid var(--glass-border);
        }
        .roster-item:last-child {
          border-bottom: none;
        }
        
        .roster-info {
          display: flex;
          flex-direction: column;
        }
        .roster-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--fg-primary);
        }
        .roster-email {
          font-size: 0.75rem;
          color: var(--fg-tertiary);
        }
        .roster-date {
          font-size: 0.78rem;
          color: var(--fg-secondary);
          font-weight: 550;
        }
        
        @media (max-width: 640px) {
          .ticket-pass {
            flex-direction: column;
          }
          .ticket-details-side {
            border-right: none;
            border-bottom: 2px dashed var(--glass-border);
          }
          .ticket-qr-side {
            width: 100%;
            flex-direction: row;
            justify-content: space-around;
            padding: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
