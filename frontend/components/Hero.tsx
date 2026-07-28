"use client";

import React from "react";
import AnimatedBackground from "./AnimatedBackground";
import { 
  Search, 
  Tv, 
  DollarSign, 
  BookOpen, 
  Layers, 
  Trophy, 
  Cpu, 
  Music, 
  Palette, 
  Paintbrush, 
  Code, 
  Users, 
  Gamepad2, 
  Activity, 
  GraduationCap, 
  Sparkles 
} from "lucide-react";
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
    "All": <Layers size={24} />,
    "Sports": <Trophy size={24} />,
    "Technology": <Cpu size={24} />,
    "Music": <Music size={24} />,
    "Design": <Palette size={24} />,
    "Arts": <Paintbrush size={24} />,
    "Workshop": <BookOpen size={24} />,
    "Hackathon": <Code size={24} />,
    "Conference": <Users size={24} />,
    "Social": <Users size={24} />,
    "Gaming": <Gamepad2 size={24} />,
    "Health": <Activity size={24} />,
    "Education": <GraduationCap size={24} />,
  };

  const categories = allCategoryNames.map(name => ({
    name,
    icon: categoryIcons[name] || <Sparkles size={24} />
  }));

  return (
    <section className="hero-section">
      <AnimatedBackground />
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
          Connect with campus societies, discover upcoming workshops, register for coding hackathons, or host your own group events with ease. Your central hub for campus and community activities.
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

        {/* Category Tabs (Tile Box Cards with Big Icons on Top & Name Below) */}
        <div className="category-container">
          <div className="category-scroll">
            {categories.map((cat, idx) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`category-tab-box animate-stagger-item ${selectedCategory === cat.name ? "active" : ""}`}
                style={{ "--index": idx } as React.CSSProperties}
              >
                <div className="category-icon-box">
                  {cat.icon}
                </div>
                <span className="category-name">{cat.name}</span>
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
          gap: 1rem;
          padding: 0.5rem 0.25rem;
          overflow-x: auto;
          scrollbar-width: none;
        }
        
        .category-scroll::-webkit-scrollbar {
          display: none;
        }
        
        .category-tab-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 98px;
          padding: 0.95rem 0.85rem 0.8rem;
          border-radius: var(--border-radius-md);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(12px);
          color: var(--fg-secondary);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
        }
        
        .category-icon-box {
          width: 48px;
          height: 48px;
          border-radius: var(--border-radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(99, 102, 241, 0.08);
          color: var(--accent-primary);
          margin-bottom: 0.55rem;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .category-name {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: -0.2px;
          transition: color 0.3s ease;
        }
        
        .category-tab-box:hover {
          transform: translateY(-5px);
          border-color: var(--accent-primary);
          color: var(--fg-primary);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .category-tab-box:hover .category-icon-box {
          background: rgba(99, 102, 241, 0.18);
          transform: scale(1.08);
        }
        
        .category-tab-box.active {
          background: rgba(99, 102, 241, 0.12);
          border-color: var(--accent-primary);
          color: var(--fg-primary);
          box-shadow: 0 8px 30px rgba(99, 102, 241, 0.25);
        }
        
        .category-tab-box.active .category-icon-box {
          background: linear-gradient(135deg, #ff3030, #6366f1);
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
          transform: scale(1.05);
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
