"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import Link from "next/link";
import { Sun, Moon, Calendar, User, LogOut, LayoutDashboard, PlusCircle } from "lucide-react";

export default function Navbar({ currentView, setCurrentView }) {
  const { theme, toggleTheme, user, logout, setAuthModal } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleNav = (view) => {
    setCurrentView(view);
    setDropdownOpen(false);
  };

  return (
    <header className="navbar-wrapper">
      <div className="container navbar-container">
        {/* Logo */}
        <div className="logo-group" onClick={() => handleNav("explore")}>
          <div className="logo-icon">
            <Calendar size={22} className="logo-svg" />
          </div>
          <span className="logo-text">Eve<span className="text-gradient">Fest</span></span>
        </div>

        {/* Desktop Nav Actions */}
        <div className="nav-actions">
          <button 
            className={`nav-link ${currentView === "explore" ? "active" : ""}`}
            onClick={() => handleNav("explore")}
          >
            Explore
          </button>
          
          {user && (
            <button 
              className={`nav-link ${currentView === "dashboard" ? "active" : ""}`}
              onClick={() => handleNav("dashboard")}
            >
              Dashboard
            </button>
          )}

          {/* Theme Toggle */}
          <button className="btn-icon theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Section */}
          {user ? (
            <div className="user-dropdown-container">
              <button 
                className="btn btn-secondary user-profile-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="avatar-circle">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{user.name.split(" ")[0]}</span>
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu glass-panel animate-slide-up">
                  <div className="dropdown-header">
                    <p className="user-fullName">{user.name}</p>
                    <p className="user-email">{user.email}</p>
                  </div>
                  
                  <button onClick={() => handleNav("dashboard")} className="dropdown-item">
                    <LayoutDashboard size={16} />
                    My Dashboard
                  </button>
                  
                  <button onClick={() => { handleNav("explore"); setAuthModal({ open: true, tab: "host" }); }} className="dropdown-item">
                    <PlusCircle size={16} />
                    Host an Event
                  </button>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button onClick={() => { logout(); setDropdownOpen(false); }} className="dropdown-item text-danger">
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link 
                href="/login"
                className="btn btn-secondary btn-login" 
              >
                Log In
              </Link>
              <Link 
                href="/signup"
                className="btn btn-primary btn-signup"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .navbar-wrapper {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: var(--glass-bg);
          border-bottom: 1px solid var(--glass-border);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          height: 70px;
          display: flex;
          align-items: center;
          transition: var(--transition-smooth);
        }
        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .logo-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          cursor: pointer;
        }
        .logo-icon {
          width: 38px;
          height: 38px;
          border-radius: var(--border-radius-sm);
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
        }
        .logo-text {
          font-size: 1.35rem;
          font-weight: 850;
          letter-spacing: -0.5px;
          color: var(--fg-primary);
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .nav-link {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--fg-secondary);
          padding: 0.5rem 1rem;
          border-radius: var(--border-radius-sm);
          transition: var(--transition-fast);
        }
        .nav-link:hover, .nav-link.active {
          color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.06);
        }
        .user-dropdown-container {
          position: relative;
        }
        .user-profile-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.8rem;
          border-radius: var(--border-radius-full);
        }
        .avatar-circle {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
        }
        .user-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--fg-primary);
        }
        .dropdown-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          width: 220px;
          border-radius: var(--border-radius-md);
          padding: 0.5rem 0;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-lg);
          z-index: 101;
        }
        .dropdown-header {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--glass-border);
          margin-bottom: 0.35rem;
        }
        .user-fullName {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--fg-primary);
        }
        .user-email {
          font-size: 0.75rem;
          color: var(--fg-tertiary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.6rem 1rem;
          font-size: 0.88rem;
          font-weight: 550;
          color: var(--fg-secondary);
          width: 100%;
          text-align: left;
          transition: var(--transition-fast);
        }
        .dropdown-item:hover {
          background: rgba(99, 102, 241, 0.08);
          color: var(--accent-primary);
        }
        .dropdown-divider {
          height: 1px;
          background: var(--glass-border);
          margin: 0.35rem 0;
        }
        .text-danger {
          color: var(--color-danger);
        }
        .text-danger:hover {
          color: var(--color-danger);
          background: rgba(239, 68, 68, 0.08);
        }
        .auth-btns {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .btn-login {
          padding: 0.5rem 1.1rem;
          font-size: 0.9rem;
        }
        .btn-signup {
          padding: 0.5rem 1.1rem;
          font-size: 0.9rem;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        }
        
        @media (max-width: 640px) {
          .user-name, .nav-link {
            display: none;
          }
          .logo-text {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </header>
  );
}
