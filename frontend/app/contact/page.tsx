"use client";

import React, { useState, useEffect, useRef, FormEvent } from "react";
import Navbar from "../../components/Navbar";
import { useApp } from "../../context/AppContext";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Send, 
  Lock, 
  MessageSquare, 
  Clock, 
  ExternalLink,
  Loader
} from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const { user, supportMessages, getSupportMessages, postSupportMessage } = useApp();
  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load support messages on mount, then poll every 3 seconds for real-time updates
  useEffect(() => {
    if (!user) return;

    // Initial load with spinner
    setLoadingChat(true);
    getSupportMessages().finally(() => setLoadingChat(false));

    // Silent background poll — no loading state shown
    const pollInterval = setInterval(() => {
      getSupportMessages();
    }, 3000);

    // Cleanup on unmount or user change
    return () => clearInterval(pollInterval);
  }, [user]);


  // Scroll to bottom of chat when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [supportMessages]);

  const handleSend = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!msgText.trim()) return;

    setSending(true);
    const success = await postSupportMessage(msgText);
    setSending(false);

    if (success) {
      setMsgText("");
    }
  };

  return (
    <>
      <Navbar />
      
      <main className="contact-page container animate-fade-in">
        <div className="contact-grid">
          
          {/* Left Side: Contact Information Cards */}
          <div className="contact-info-panel">
            <h1 className="page-title">Contact Us</h1>
            <p className="page-subtitle">Get in touch with the student coordination council or start a live support ticket.</p>

            <div className="info-cards-container">
              
              <div className="info-card glass-panel">
                <div className="info-icon-box purple-glow">
                  <MapPin size={20} className="icon-purple" />
                </div>
                <div className="info-text">
                  <h3>Office Coordinates</h3>
                  <p>Student Welfare Center, Block D, Room 102</p>
                  <p className="subtext">Campus Central Drive</p>
                </div>
              </div>

              <div className="info-card glass-panel">
                <div className="info-icon-box cyan-glow">
                  <Phone size={20} className="icon-cyan" />
                </div>
                <div className="info-text">
                  <h3>Support Hotline</h3>
                  <p>+1 (555) 890-3456</p>
                  <p className="subtext">Mon - Fri: 09:00 AM - 05:00 PM</p>
                </div>
              </div>

              <div className="info-card glass-panel">
                <div className="info-icon-box purple-glow">
                  <Mail size={20} className="icon-purple" />
                </div>
                <div className="info-text">
                  <h3>Support Email</h3>
                  <p>support.welfare@university.edu</p>
                  <p className="subtext">Average response time: &lt;2 hours</p>
                </div>
              </div>

              <div className="info-card glass-panel">
                <div className="info-icon-box cyan-glow">
                  <Clock size={20} className="icon-cyan" />
                </div>
                <div className="info-text">
                  <h3>Resolution Time</h3>
                  <p>Urgent tickets resolved same day</p>
                  <p className="subtext">Soft takedowns verified immediately</p>
                </div>
              </div>

            </div>

            {/* Micro-interactive map preview */}
            <div className="map-preview glass-panel">
              <div className="map-header">
                <h3>Campus Location Map</h3>
                <a 
                  href="https://maps.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-link-small"
                >
                  Open Google Maps <ExternalLink size={12} />
                </a>
              </div>
              <iframe 
                title="Welfare Center Map"
                src="https://maps.google.com/maps?q=Student+Welfare+Center+University&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="180" 
                style={{ border: 0, borderRadius: "var(--border-radius-sm)" }}
                loading="lazy"
              ></iframe>
            </div>
          </div>

          {/* Right Side: Live Support Chat Box */}
          <div className="chat-support-panel">
            <div className="chat-card-container glass-panel">
              <div className="chat-card-header">
                <div className="pulse-dot"></div>
                <div>
                  <h3>Live Admin Support</h3>
                  <p className="subtext">Instant messaging directly with platform moderators</p>
                </div>
              </div>

              {/* Chat Viewport */}
              {!user ? (
                /* 1. LOCK STATE: Needs Authentication */
                <div className="chat-locked-state">
                  <Lock size={40} className="lock-icon" />
                  <h3>Support Chat Locked</h3>
                  <p>Please log in to start a live support ticket. This enables admins to link responses to your account and tickets.</p>
                  <Link href="/login?redirect=/contact" className="btn btn-primary btn-signup">
                    Log In to Chat
                  </Link>
                </div>
              ) : (
                /* 2. ACTIVE CHAT STATE */
                <div className="active-chat-container">
                  <div className="chat-messages-viewport scroll-container" ref={scrollRef}>
                    {loadingChat ? (
                      <div className="chat-loader">
                        <div className="spinner"></div>
                        <p>Loading support logs...</p>
                      </div>
                    ) : supportMessages.length === 0 ? (
                      <div className="empty-chat-state">
                        <MessageSquare size={36} className="text-indigo" style={{ opacity: 0.5, marginBottom: "0.5rem" }} />
                        <h4>Start a Conversation</h4>
                        <p>Ask questions regarding event hosting rules, ticket billing issues, or submit coordinate disputes. A coordinator will reply here shortly.</p>
                      </div>
                    ) : (
                      supportMessages.map((msg, idx) => {
                        const isAdminMsg = msg.senderName.includes("Support Admin") || msg.senderId !== user._id;
                        // Check if any admin replied after this user message
                        const hasAdminReplied = !isAdminMsg && supportMessages
                          .slice(idx + 1)
                          .some(m => m.senderName.includes("Support Admin") || m.senderId !== user._id);
                        return (
                          <div key={msg._id} className={`bubble-row ${isAdminMsg ? "admin" : "user"}`}>
                            <div className={`message-bubble ${isAdminMsg ? "admin" : "user"}`}>
                              {isAdminMsg && (
                                <span className="msg-sender">Support Admin</span>
                              )}
                              <p className="msg-text">{msg.text}</p>
                              <span className="msg-time">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            {!isAdminMsg && hasAdminReplied && (
                              <span className="seen-label">✓✓ Seen</span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form onSubmit={handleSend} className="chat-input-bar">
                    <input 
                      type="text" 
                      placeholder="Type your query to admin..."
                      value={msgText}
                      onChange={(e) => setMsgText(e.target.value)}
                      className="form-control"
                      disabled={sending}
                      required
                    />
                    <button type="submit" className="btn btn-primary send-btn" disabled={sending || !msgText.trim()}>
                      {sending ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      <footer className="footer-layout">
        <div className="container footer-container">
          <div className="footer-left">
            <span className="footer-logo">EveFest</span>
            <p className="footer-text">© {new Date().getFullYear()} EveFest. Student-led campus hub.</p>
          </div>
          <div className="footer-links">
            <Link href="/about" className="footer-link">About Portal</Link>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms</a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .contact-page {
          padding-top: 2rem;
          padding-bottom: 4rem;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 3rem;
          align-items: start;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 850;
          letter-spacing: -0.03em;
          margin-bottom: 0.25rem;
        }

        .page-subtitle {
          font-size: 0.95rem;
          color: var(--fg-secondary);
          margin-bottom: 2rem;
          line-height: 1.5;
        }

        /* Info Cards */
        .info-cards-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .info-card {
          padding: 1.25rem;
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .info-icon-box {
          width: 44px;
          height: 44px;
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          flex-shrink: 0;
        }

        .purple-glow { box-shadow: 0 0 10px rgba(99,102,241,0.05); }
        .cyan-glow { box-shadow: 0 0 10px rgba(6,182,212,0.05); }
        .icon-purple { color: var(--accent-primary); }
        .icon-cyan { color: var(--accent-secondary); }

        .info-text h3 {
          font-size: 0.95rem;
          font-weight: 800;
          margin-bottom: 0.15rem;
        }
        .info-text p {
          font-size: 0.82rem;
          color: var(--fg-primary);
        }
        .info-text .subtext {
          font-size: 0.72rem;
          color: var(--fg-tertiary);
          margin-top: 0.1rem;
        }

        .map-preview {
          padding: 1.5rem;
          border-radius: var(--border-radius-md);
        }

        .map-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .map-header h3 {
          font-size: 0.95rem;
          font-weight: 800;
        }

        /* Support Chat Box */
        .chat-card-container {
          border-radius: var(--border-radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          min-height: 520px;
          background: var(--glass-bg);
        }

        .chat-card-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(99, 102, 241, 0.03);
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse-green 2s infinite;
        }
        @keyframes pulse-green {
          0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          50% { transform: scale(1.15); opacity: 0.6; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0); }
        }

        .chat-card-header h3 {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--fg-primary);
        }
        .chat-card-header .subtext {
          font-size: 0.75rem;
          color: var(--fg-tertiary);
        }

        /* Locked Chat */
        .chat-locked-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
          gap: 1.15rem;
        }
        .lock-icon {
          color: var(--fg-tertiary);
        }
        .chat-locked-state h3 {
          font-size: 1.2rem;
          font-weight: 800;
        }
        .chat-locked-state p {
          font-size: 0.85rem;
          color: var(--fg-secondary);
          line-height: 1.5;
          max-width: 280px;
          margin-bottom: 0.5rem;
        }

        /* Active Chat */
        .active-chat-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .chat-messages-viewport {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          max-height: 380px;
        }

        .chat-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 3rem 0;
          color: var(--fg-secondary);
        }
        .spinner {
          width: 24px;
          height: 24px;
          border: 2px solid var(--glass-border);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .empty-chat-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2.5rem 1.5rem;
          margin: auto;
          gap: 0.5rem;
        }
        .empty-chat-state h4 {
          font-size: 0.95rem;
          font-weight: 750;
        }
        .empty-chat-state p {
          font-size: 0.8rem;
          color: var(--fg-secondary);
          line-height: 1.5;
          max-width: 270px;
        }

        /* Message Bubbles */
        .bubble-row {
          display: flex;
          flex-direction: column;
        }
        .bubble-row.user {
          align-items: flex-end;
        }
        .bubble-row.admin {
          align-items: flex-start;
        }

        .seen-label {
          font-size: 0.62rem;
          color: var(--accent-secondary);
          font-weight: 700;
          margin-top: 0.2rem;
          letter-spacing: 0.02em;
        }

        .message-bubble {
          display: flex;
          flex-direction: column;
          max-width: 75%;
          padding: 0.65rem 0.9rem;
          border-radius: var(--border-radius-md);
          font-size: 0.86rem;
          line-height: 1.5;
          position: relative;
        }

        .message-bubble.user {
          background: var(--accent-primary);
          color: white;
          border-bottom-right-radius: 2px;
        }

        .message-bubble.admin {
          align-self: flex-start;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          color: var(--fg-primary);
          border-bottom-left-radius: 2px;
        }

        .msg-sender {
          font-size: 0.65rem;
          font-weight: 800;
          opacity: 0.75;
          margin-bottom: 0.15rem;
          color: var(--accent-secondary);
        }
        .msg-text {
          word-break: break-word;
        }
        .msg-time {
          font-size: 0.6rem;
          opacity: 0.55;
          text-align: right;
          margin-top: 0.3rem;
          align-self: flex-end;
        }

        /* Input Bar */
        .chat-input-bar {
          padding: 1rem 1.25rem;
          border-top: 1px solid var(--glass-border);
          background: rgba(0,0,0,0.1);
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .chat-input-bar input {
          flex: 1;
        }
        .send-btn {
          padding: 0.75rem;
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Footer */
        .footer-layout {
          margin-top: 5rem;
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
        .footer-text { font-size: 0.8rem; color: var(--fg-tertiary); }
        .footer-links { display: flex; gap: 1.5rem; }
        .footer-link {
          font-size: 0.85rem;
          color: var(--fg-secondary);
          font-weight: 550;
        }
        .footer-link:hover { color: var(--accent-primary); }

        @media (max-width: 968px) {
          .contact-grid { grid-template-columns: 1fr; gap: 3rem; }
          .chat-card-container { min-height: 480px; }
        }

        @media (max-width: 640px) {
          .info-cards-container { grid-template-columns: 1fr; }
          .footer-container { flex-direction: column; gap: 1.5rem; text-align: center; }
          .footer-links { justify-content: center; }
        }
      `}</style>
    </>
  );
}
