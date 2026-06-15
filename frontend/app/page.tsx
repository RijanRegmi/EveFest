"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import EventCard from "../components/EventCard";
import AuthModal from "../components/AuthModal";
import Dashboard from "../components/Dashboard";
import ScrollReveal from "../components/ScrollReveal";
import { Info, Shield, Award, CalendarDays, Sparkles } from "lucide-react";
import type { IEvent } from "@/types";

function HomeContent() {
  const { events, loading } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");

  const currentView = (viewParam === "dashboard" || viewParam === "explore") ? viewParam : "explore";

  const setCurrentView = (view: string) => {
    router.push(`/?view=${view}`);
  };
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filterOnline, setFilterOnline] = useState("all"); // 'all' | 'online' | 'offline'
  const [filterPrice, setFilterPrice] = useState("all"); // 'all' | 'free' | 'paid'

  // Filter events dynamically
  const filteredEvents = events.filter((evt) => {
    // 1. Text Search (title, description, hostName)
    const matchesSearch = 
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.hostName.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Category Filter
    const matchesCategory = selectedCategory === "All" || evt.category === selectedCategory;

    // 3. Format Filter
    const matchesFormat = 
      filterOnline === "all" ||
      (filterOnline === "online" && evt.isOnline) ||
      (filterOnline === "offline" && !evt.isOnline);

    // 4. Price Filter
    const matchesPrice = 
      filterPrice === "all" ||
      (filterPrice === "free" && evt.price === 0) ||
      (filterPrice === "paid" && evt.price > 0);

    return matchesSearch && matchesCategory && matchesFormat && matchesPrice;
  });

  return (
    <>
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {currentView === "explore" ? (
        <main className="explore-view">
          {/* Landing Hero Area */}
          <Hero 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            filterOnline={filterOnline}
            setFilterOnline={setFilterOnline}
            filterPrice={filterPrice}
            setFilterPrice={setFilterPrice}
            events={events}
          />

          {/* Events Grid Section */}
          <section className="events-grid-section container">
            <ScrollReveal direction="up" delay={50}>
              <div className="section-header">
                <h2 className="section-title">
                  {searchQuery || selectedCategory !== "All" || filterOnline !== "all" || filterPrice !== "all" 
                    ? "Filtered Search Results" 
                    : "Featured Campus Events"
                  }
                </h2>
                <span className="results-count">{filteredEvents.length} events found</span>
              </div>
            </ScrollReveal>

            {loading ? (
              <div className="events-grid">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="skeleton-card skeleton" style={{ "--index": idx } as React.CSSProperties}>
                    <div className="skeleton-image skeleton" />
                    <div className="skeleton-card-body">
                      <div className="skeleton-text title skeleton" />
                      <div className="skeleton-text subtitle skeleton" />
                      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                        <div className="skeleton-text skeleton" style={{ width: "35%", height: "1.25rem", margin: 0 }} />
                        <div className="skeleton" style={{ width: "40%", height: "2.2rem", borderRadius: "var(--border-radius-sm)" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="empty-results glass-panel animate-slide-up">
                <Info size={40} className="empty-info-icon" />
                <h3>No Matching Events</h3>
                <p>We couldn&apos;t find any events matching your search filters. Try resetting the filters or modifying your text query.</p>
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setFilterOnline("all");
                    setFilterPrice("all");
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <ScrollReveal direction="up" delay={100} duration={700}>
                <div className="events-grid">
                  {filteredEvents.map((evt, idx) => (
                    <div 
                      key={evt._id} 
                      className="animate-stagger-item" 
                      style={{ "--index": idx } as React.CSSProperties}
                    >
                      <EventCard 
                        event={evt} 
                        onClick={() => router.push(`/event/${evt._id}`)} 
                      />
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            )}
          </section>

          {/* Portal User Guide & FAQ Section (Heuristic 10: Help & Documentation) */}
          <section className="guide-faq-section container">
            <ScrollReveal direction="up" delay={100}>
              <div className="guide-card glass-panel">
                <div className="guide-badge">
                  <Sparkles size={16} />
                  <span>USER COMPLIANCE GUIDE</span>
                </div>
                <h2 className="guide-title">How EveFest Works</h2>
                <p className="guide-desc">
                  Welcome to the official Event Hub! A trusted university space to connect with student societies, explore workshops, register for coding hackathons, or coordinate your own group events with ease.
                </p>

                <div className="guide-steps-grid">
                  <div className="step-card">
                    <div className="step-icon-box indigo-box">
                      <CalendarDays size={20} />
                    </div>
                    <h4>Explore & Search</h4>
                    <p>Browse events using filters. Instantly search by tags, formats (Online stream or physical IRL), or price range.</p>
                  </div>

                  <div className="step-card">
                    <div className="step-icon-box cyan-box">
                      <Shield size={20} />
                    </div>
                    <h4>Trust & Safety</h4>
                    <p>Hosts can upload official approval permits or society letters to verify the event. Check for the Shield badge on event pages.</p>
                  </div>

                  <div className="step-card">
                    <div className="step-icon-box green-box">
                      <Award size={20} />
                    </div>
                    <h4>Instant Checkout</h4>
                    <p>Confirm seat registration instantly. Digital tickets with scan-ready QR codes are generated directly in your student dashboard.</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </section>
        </main>
      ) : (
        <Dashboard />
      )}

      {/* Shared Overlays & Modals */}
      <AuthModal />

      <footer className="footer-layout">
        <div className="container footer-container">
          <div className="footer-left">
            <span className="footer-logo">EveFest</span>
            <p className="footer-text">© {new Date().getFullYear()} EveFest. Handcrafted modern university campus event organizer platform.</p>
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Support Desk</a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .explore-view {
          min-height: calc(100vh - 70px);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .events-grid-section {
          padding: 2.5rem 0 3.5rem;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 1.75rem;
        }
        
        .section-title {
          font-size: 1.75rem;
          font-weight: 850;
          letter-spacing: -0.5px;
        }
        
        .results-count {
          font-size: 0.88rem;
          color: var(--fg-tertiary);
          font-weight: 600;
        }
        
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        
        /* Loader styles */
        .loader-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem 1rem;
          gap: 1rem;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--glass-border);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .loader-box p {
          font-size: 0.95rem;
          color: var(--fg-secondary);
          font-weight: 600;
        }
        
        /* Empty results box */
        .empty-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 4.5rem 2rem;
          gap: 0.75rem;
        }
        
        .empty-info-icon {
          color: var(--fg-tertiary);
        }
        
        .empty-results h3 {
          font-size: 1.25rem;
          font-weight: 800;
        }
        
        .empty-results p {
          font-size: 0.9rem;
          color: var(--fg-secondary);
          max-width: 420px;
          margin-bottom: 0.5rem;
        }
        
        /* Guide FAQ section */
        .guide-faq-section {
          padding-bottom: 4rem;
        }
        
        .guide-card {
          padding: 3rem 2.5rem;
          border-radius: var(--border-radius-lg);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        .guide-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.35rem 0.85rem;
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.15);
          border-radius: var(--border-radius-full);
          font-size: 0.75rem;
          font-weight: 750;
          color: var(--accent-primary);
          margin-bottom: 1rem;
        }
        
        .guide-title {
          font-size: 1.85rem;
          font-weight: 850;
          margin-bottom: 0.75rem;
        }
        
        .guide-desc {
          font-size: 1rem;
          color: var(--fg-secondary);
          max-width: 620px;
          line-height: 1.6;
          margin-bottom: 3rem;
        }
        
        .guide-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          width: 100%;
          text-align: left;
        }
        
        .step-card {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        
        .step-icon-box {
          width: 44px;
          height: 44px;
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }
        
        .indigo-box {
          background: rgba(99, 102, 241, 0.08);
          color: var(--accent-primary);
        }
        .cyan-box {
          background: rgba(6, 182, 212, 0.08);
          color: var(--accent-secondary);
        }
        .green-box {
          background: rgba(16, 185, 129, 0.08);
          color: var(--color-success);
        }
        
        .step-card h4 {
          font-size: 1rem;
          font-weight: 750;
        }
        
        .step-card p {
          font-size: 0.85rem;
          line-height: 1.5;
          color: var(--fg-secondary);
        }
        
        /* Footer styling */
        .footer-layout {
          margin-top: auto;
          background: var(--bg-secondary);
          border-top: 1px solid var(--glass-border);
          padding: 2rem 0;
        }
        
        .footer-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .footer-logo {
          font-size: 1.15rem;
          font-weight: 800;
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
          font-size: 0.82rem;
          color: var(--fg-secondary);
          font-weight: 550;
        }
        
        .footer-link:hover {
          color: var(--accent-primary);
        }
        
        @media (max-width: 768px) {
          .guide-steps-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .footer-container {
            flex-direction: column;
            gap: 1.5rem;
            text-align: center;
          }
          .footer-links {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="loader-box" style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}>
        <div className="spinner"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
