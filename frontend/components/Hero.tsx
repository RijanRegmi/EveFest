"use client";

import React from "react";
import { Search, Compass, Tv, DollarSign, BookOpen, Layers } from "lucide-react";
import type { IEvent } from "@/types";

export interface HeroProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  filterOnline: string;
  setFilterOnline: (val: string) => void;
  filterPrice: string;
  setFilterPrice: (val: string) => void;
  events?: IEvent[];
}

export default function Hero({ 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory, 
  filterOnline, 
  setFilterOnline,
  filterPrice,
  setFilterPrice,
  events = []
}: HeroProps) {
  const [stats, setStats] = React.useState({
    liveEvents: 0,
    ticketsIssued: 0,
    societiesOnboard: 0
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${API_URL}/events/stats`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };
    fetchStats();
  }, []);

  // Single-run typewriter animation for the entire title sentence
  const part1 = "Discover & Host ";
  const part2 = "Unforgettable";
  const part3 = " Experiences";
  const totalLength = part1.length + part2.length + part3.length;
  
  const [charCount, setCharCount] = React.useState(0);

  React.useEffect(() => {
    if (charCount >= totalLength) return;

    const timer = setTimeout(() => {
      setCharCount((prev) => prev + 1);
    }, 45); // Snappy letter-by-keyboard typing speed (45ms per char)

    return () => clearTimeout(timer);
  }, [charCount, totalLength]);

  // Segment text dynamically depending on the current character index count
  const getTypedText = () => {
    let p1 = "";
    let p2 = "";
    let p3 = "";
    let showCursorInPart = 1; // 1, 2, or 3

    if (charCount <= part1.length) {
      p1 = part1.slice(0, charCount);
      showCursorInPart = 1;
    } else if (charCount <= part1.length + part2.length) {
      p1 = part1;
      p2 = part2.slice(0, charCount - part1.length);
      showCursorInPart = 2;
    } else {
      p1 = part1;
      p2 = part2;
      p3 = part3.slice(0, charCount - part1.length - part2.length);
      showCursorInPart = 3;
    }

    return { p1, p2, p3, showCursorInPart };
  };

  const { p1, p2, p3, showCursorInPart } = getTypedText();

  // Only show categories that actually have events — avoids tab overflow from empty static categories
  const eventCategories = Array.from(new Set(events.map(e => e.category).filter(Boolean)));
  const allCategoryNames = ["All", ...eventCategories];

  const categoryIcons: Record<string, React.ReactNode> = {
    "All": <Layers size={15} />,
    "Sports": <Compass size={15} />,
    "Technology": <Compass size={15} />,
    "Music": <Compass size={15} />,
    "Design": <Compass size={15} />,
    "Arts": <Compass size={15} />,
    "Workshop": <BookOpen size={15} />,
    "Hackathon": <Compass size={15} />,
    "Conference": <Compass size={15} />,
    "Social": <Compass size={15} />,
    "Gaming": <Compass size={15} />,
    "Health": <Compass size={15} />,
    "Education": <BookOpen size={15} />,
  };

  const categories = allCategoryNames.map(name => ({
    name,
    icon: categoryIcons[name] || <Compass size={15} />
  }));

  return (
    <section className="hero-section">
      {/* Background Decorative Accents (Aesthetic-Usability Effect) */}
      <div className="bg-glow bg-glow-violet animate-float"></div>
      <div className="bg-glow bg-glow-cyan animate-float" style={{ animationDelay: "-4s" }}></div>

      <div className="container hero-container animate-fade-in">
        <h1 className="hero-title animate-slide-up" style={{ minHeight: "calc(2 * 3.5rem * 1.15)" }}>
          {p1}
          {showCursorInPart === 1 && charCount < totalLength && <span className="typing-cursor">|</span>}
          {p2 && <span className="text-gradient">{p2}</span>}
          {showCursorInPart === 2 && charCount < totalLength && <span className="typing-cursor">|</span>}
          {p3}
          {showCursorInPart === 3 && charCount < totalLength && <span className="typing-cursor">|</span>}
        </h1>
        
        <p className="hero-subtitle">
          Connect with campus societies, join workshops, register for hackathons, or coordinate your own group events with ease. 100% human-designed, premium UX built for campus and community hubs.
        </p>

        {/* Filter Toolbar Panel */}
        <div className="search-filter-panel glass-panel pulse-glow">
          <div className="search-box">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search events, festivals, workshops..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-select-group">
            {/* Format Filter */}
            <div className="select-wrapper">
              <Tv size={16} className="select-icon" />
              <select 
                value={filterOnline} 
                onChange={(e) => setFilterOnline(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Formats</option>
                <option value="offline">In-Person (IRL)</option>
                <option value="online">Online Stream</option>
              </select>
            </div>

            {/* Price Filter */}
            <div className="select-wrapper">
              <DollarSign size={16} className="select-icon" />
              <select 
                value={filterPrice} 
                onChange={(e) => setFilterPrice(e.target.value)}
                className="filter-select"
              >
                <option value="all">Any Price</option>
                <option value="free">Free Access</option>
                <option value="paid">Paid Ticket</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Tabs (Hick's Law / Staggering) */}
        <div className="category-container">
          <div className="category-scroll">
            {categories.map((cat, idx) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`category-tab animate-stagger-item ${selectedCategory === cat.name ? "active" : ""}`}
                style={{ "--index": idx } as React.CSSProperties}
              >
                {cat.icon}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.liveEvents}</span>
            <span className="stat-label">Live Events</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              {stats.ticketsIssued >= 1000 
                ? `${(stats.ticketsIssued / 1000).toFixed(1)}k` 
                : stats.ticketsIssued}
            </span>
            <span className="stat-label">Tickets Issued</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.societiesOnboard}</span>
            <span className="stat-label">Societies Onboard</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-section {
          position: relative;
          padding: 5rem 0 3.5rem;
          text-align: center;
          overflow: hidden;
          background: radial-gradient(circle at top, var(--bg-secondary) 0%, var(--bg-primary) 100%);
        }
        
        /* Neon Ambient Glows */
        .bg-glow {
          position: absolute;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.12;
          z-index: 0;
          pointer-events: none;
        }
        
        .bg-glow-violet {
          top: -100px;
          left: 10%;
          background: var(--accent-primary);
        }
        
        .bg-glow-cyan {
          bottom: -50px;
          right: 10%;
          background: var(--accent-secondary);
        }
        
        .hero-container {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .hero-title {
          font-size: 3.5rem;
          font-weight: 850;
          line-height: 1.15;
          letter-spacing: -2px;
          margin-bottom: 1.25rem;
          max-width: 800px;
        }
        
        .hero-subtitle {
          font-size: 1.15rem;
          color: var(--fg-secondary);
          max-width: 650px;
          line-height: 1.6;
          margin-bottom: 2.5rem;
        }
        
        /* Search Filter Glass Panel */
        .search-filter-panel {
          width: 100%;
          max-width: 850px;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 1rem;
          padding: 0.8rem;
          border-radius: var(--border-radius-lg);
          margin-bottom: 2.5rem;
          align-items: center;
        }
        
        .search-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg-primary);
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-md);
          padding: 0.65rem 1rem;
          transition: var(--transition-fast);
        }
        
        .search-box:focus-within {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        .search-icon {
          color: var(--fg-tertiary);
        }
        
        .search-input {
          background: none;
          border: none;
          color: var(--fg-primary);
          font-size: 0.95rem;
          width: 100%;
        }
        
        .search-input::placeholder {
          color: var(--fg-tertiary);
        }
        
        .filter-select-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        
        .select-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-primary);
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-md);
          padding: 0.65rem 0.85rem;
          color: var(--fg-secondary);
          position: relative;
        }
        
        .select-icon {
          color: var(--accent-primary);
        }
        
        .filter-select {
          background: none;
          border: none;
          color: var(--fg-primary);
          font-size: 0.9rem;
          width: 100%;
          font-weight: 550;
          cursor: pointer;
        }
        
        /* Category scrollbar */
        .category-container {
          width: 100%;
          display: flex;
          justify-content: center;
          margin-bottom: 3.5rem;
        }
        
        .category-scroll {
          display: flex;
          gap: 0.75rem;
          padding: 0.25rem;
          overflow-x: auto;
          scrollbar-width: none; /* Firefox */
        }
        
        .category-scroll::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
        
        .category-tab {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.55rem 1.25rem;
          border-radius: var(--border-radius-full);
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--fg-secondary);
          background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
          transition: var(--transition-smooth);
          white-space: nowrap;
        }
        
        .category-tab:hover {
          background: var(--bg-tertiary);
          color: var(--accent-primary);
          border-color: var(--accent-primary);
        }
        
        .category-tab.active {
          background: var(--accent-primary);
          color: #ffffff;
          border-color: var(--accent-primary);
          box-shadow: var(--shadow-glow);
        }
        
        /* Stats Styling */
        .stats-grid {
          display: flex;
          justify-content: center;
          gap: 4rem;
          border-top: 1px solid var(--glass-border);
          padding-top: 2rem;
          width: 100%;
          max-width: 700px;
        }
        
        .stat-card {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .stat-value {
          font-size: 2rem;
          font-weight: 850;
          color: var(--fg-primary);
          line-height: 1;
          margin-bottom: 0.25rem;
        }
        
        .stat-label {
          font-size: 0.85rem;
          color: var(--fg-tertiary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .typing-cursor {
          color: var(--accent-secondary);
          font-weight: 200;
          animation: blink 0.75s infinite;
          margin-left: 2px;
          display: inline-block;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
            letter-spacing: -1px;
          }
          .search-filter-panel {
            grid-template-columns: 1fr;
            padding: 1rem;
          }
          .stats-grid {
            gap: 2rem;
          }
          .stat-value {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </section>
  );
}
