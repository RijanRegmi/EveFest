"use client";

import React from "react";
import Navbar from "../../components/Navbar";
import { 
  Calendar, 
  Users, 
  ShieldCheck, 
  Tv, 
  Award, 
  BookOpen, 
  Heart, 
  Clock, 
  ArrowRight,
  MessageSquare
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      
      <main className="about-page container animate-fade-in">
        {/* Hero Banner Section */}
        <section className="about-hero glass-panel">
          <div className="bg-glow"></div>
          <div className="hero-content">
            <span className="hero-badge">ABOUT THE PLATFORM</span>
            <h1 className="hero-title">
              Empowering Student Synergy Through <span className="text-gradient">EveFest</span>
            </h1>
            <p className="hero-subtitle">
              EveFest is the university's premier activities portal, bridging the gap between student club organizers, department coordinators, and attendees. We make coordinating, discovering, and booking campus events seamless.
            </p>
            <div className="hero-buttons">
              <Link href="/?view=explore" className="btn btn-primary">
                Explore Events
                <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Contact Support Desk
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="stats-grid">
          <div className="stat-card glass-panel">
            <div className="stat-icon-wrapper purple-glow">
              <Calendar size={24} className="icon-purple" />
            </div>
            <div className="stat-info">
              <span className="stat-number">500+</span>
              <span className="stat-label">Events Hosted</span>
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-icon-wrapper cyan-glow">
              <Users size={24} className="icon-cyan" />
            </div>
            <div className="stat-info">
              <span className="stat-number">12,000+</span>
              <span className="stat-label">Active Attendees</span>
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-icon-wrapper purple-glow">
              <ShieldCheck size={24} className="icon-purple" />
            </div>
            <div className="stat-info">
              <span className="stat-number">98%</span>
              <span className="stat-label">Verification Rate</span>
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-icon-wrapper cyan-glow">
              <Award size={24} className="icon-cyan" />
            </div>
            <div className="stat-info">
              <span className="stat-number">30+</span>
              <span className="stat-label">Campus Societies</span>
            </div>
          </div>
        </section>

        {/* Core Pillars */}
        <section className="pillars-section">
          <h2 className="section-title text-center">Built on 3 Core Pillars</h2>
          <p className="section-subtitle text-center">
            Designed to address coordination bottlenecks and deliver maximum accessibility.
          </p>

          <div className="pillars-grid">
            <div className="pillar-card glass-panel">
              <div className="pillar-header">
                <ShieldCheck size={36} className="pillar-icon text-indigo" />
                <h3>Host Credibility</h3>
              </div>
              <p>
                We require event organizers to upload credentials and society permits, ensuring all listed workshops, seminars, and activities carry official coordination validity.
              </p>
            </div>

            <div className="pillar-card glass-panel">
              <div className="pillar-header">
                <Clock size={36} className="pillar-icon text-cyan" />
                <h3>Live Dynamics</h3>
              </div>
              <p>
                Real-time seat counters, instant bookings, and digital ticket passes generated instantly with unique codes for frictionless scan-ins at the gate.
              </p>
            </div>

            <div className="pillar-card glass-panel">
              <div className="pillar-header">
                <MessageSquare size={36} className="pillar-icon text-indigo" />
                <h3>Social Sync</h3>
              </div>
              <p>
                Integrated attendee chat rooms and dedicated host support help clarify questions, share slides, and foster student networking prior to event start.
              </p>
            </div>
          </div>
        </section>

        {/* Platform Values */}
        <section className="values-layout glass-panel">
          <div className="values-header">
            <h2>Our College Coordination Team</h2>
            <p>
              EveFest is managed and moderated by the Student Welfare Board. We actively verify credentials, prevent coordinate conflicts, and maintain support desks for active hosts.
            </p>
          </div>

          <div className="values-details-list">
            <div className="value-detail-item">
              <BookOpen size={20} className="text-indigo" />
              <div>
                <h4>Academic & Leisure Harmony</h4>
                <p>Ensuring tech seminars do not conflict with cultural concerts to give students maximum discoverability and choices.</p>
              </div>
            </div>

            <div className="value-detail-item">
              <Tv size={20} className="text-cyan" />
              <div>
                <h4>Hybrid Coordination</h4>
                <p>Supports both in-person venue allocation maps and virtual video conferencing links under a unified booking interface.</p>
              </div>
            </div>

            <div className="value-detail-item">
              <Heart size={20} className="text-indigo" />
              <div>
                <h4>100% Student Driven</h4>
                <p>Engineered, designed, and maintained by student representatives to enrich the vibrant campus ecosystem.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer-layout">
        <div className="container footer-container">
          <div className="footer-left">
            <span className="footer-logo">EveFest</span>
            <p className="footer-text">© {new Date().getFullYear()} EveFest. Built for university welfare boards.</p>
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Privacy Policy</a>
            <Link href="/contact" className="footer-link">Support Desk</Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .about-page {
          padding-top: 2rem;
          padding-bottom: 4rem;
        }

        .about-hero {
          padding: 4rem 3rem;
          border-radius: var(--border-radius-lg);
          margin-bottom: 3rem;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
        }

        .bg-glow {
          position: absolute;
          width: 400px;
          height: 400px;
          background: var(--accent-primary);
          border-radius: 50%;
          filter: blur(130px);
          opacity: 0.12;
          top: -100px;
          right: -50px;
          pointer-events: none;
        }

        .hero-content {
          max-width: 700px;
          position: relative;
          z-index: 1;
        }

        .hero-badge {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 850;
          color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.1);
          padding: 0.35rem 0.85rem;
          border-radius: var(--border-radius-full);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
          border: 1px solid rgba(99, 102, 241, 0.15);
        }

        .hero-title {
          font-size: 2.8rem;
          font-weight: 850;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin-bottom: 1.25rem;
        }

        .hero-subtitle {
          font-size: 1.05rem;
          line-height: 1.6;
          color: var(--fg-secondary);
          margin-bottom: 2rem;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 4rem;
        }

        .stat-card {
          padding: 1.5rem;
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .stat-icon-wrapper {
          width: 50px;
          height: 50px;
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          flex-shrink: 0;
        }

        .purple-glow { box-shadow: 0 0 12px rgba(99,102,241,0.06); }
        .cyan-glow { box-shadow: 0 0 12px rgba(6,182,212,0.06); }
        .icon-purple { color: var(--accent-primary); }
        .icon-cyan { color: var(--accent-secondary); }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-number {
          font-size: 1.75rem;
          font-weight: 850;
          color: var(--fg-primary);
          line-height: 1.2;
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--fg-tertiary);
          font-weight: 600;
        }

        /* Pillars Section */
        .pillars-section {
          margin-bottom: 4rem;
        }

        .section-title {
          font-size: 1.85rem;
          font-weight: 850;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }

        .section-subtitle {
          font-size: 0.95rem;
          color: var(--fg-secondary);
          max-width: 600px;
          margin: 0 auto 2.5rem;
          line-height: 1.5;
        }

        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .pillar-card {
          padding: 2.25rem 2rem;
          border-radius: var(--border-radius-md);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .pillar-header {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .pillar-header h3 {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--fg-primary);
        }

        .pillar-icon {
          flex-shrink: 0;
        }

        .pillar-card p {
          font-size: 0.88rem;
          line-height: 1.6;
          color: var(--fg-secondary);
        }

        /* Values Layout */
        .values-layout {
          padding: 3rem;
          border-radius: var(--border-radius-lg);
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 3.5rem;
          align-items: center;
        }

        .values-header h2 {
          font-size: 1.8rem;
          font-weight: 850;
          margin-bottom: 1rem;
        }

        .values-header p {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--fg-secondary);
        }

        .values-details-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .value-detail-item {
          display: flex;
          gap: 1rem;
        }

        .value-detail-item h4 {
          font-size: 0.95rem;
          font-weight: 750;
          color: var(--fg-primary);
          margin-bottom: 0.25rem;
        }

        .value-detail-item p {
          font-size: 0.84rem;
          line-height: 1.5;
          color: var(--fg-tertiary);
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
          .values-layout { grid-template-columns: 1fr; gap: 2rem; }
          .hero-title { font-size: 2.2rem; }
        }

        @media (max-width: 640px) {
          .about-hero { padding: 2.5rem 1.5rem; }
          .hero-buttons { flex-direction: column; }
          .footer-container { flex-direction: column; gap: 1.5rem; text-align: center; }
          .footer-links { justify-content: center; }
        }
      `}</style>
    </>
  );
}
