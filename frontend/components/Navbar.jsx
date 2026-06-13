"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Sun, Moon, Calendar, User, LogOut, LayoutDashboard, PlusCircle, ShieldCheck, Info, HelpCircle, Menu, X } from "lucide-react";

export default function Navbar({ currentView, setCurrentView }) {
  const { theme, toggleTheme, user, logout, setAuthModal } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isExploreActive = (pathname === "/" || pathname === "" || !pathname) && (!currentView || currentView === "explore");
  const isDashboardActive = (pathname === "/" && currentView === "dashboard");
  const isAboutActive = pathname?.includes("/about") || pathname?.endsWith("about");
  const isContactActive = pathname?.includes("/contact") || pathname?.endsWith("contact");
  const isAdminActive = pathname?.includes("/admin") || pathname?.endsWith("admin");

  const handleNav = (view) => {
    if (setCurrentView) {
      setCurrentView(view);
    } else {
      router.push(`/?view=${view}`);
    }
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

        {/* Center: Navigation Links */}
        <nav className="nav-links">
          <button 
            className={`nav-link ${isExploreActive ? "active" : ""}`}
            onClick={() => handleNav("explore")}
          >
            Explore
          </button>
          
          <Link href="/about" className={`nav-link ${isAboutActive ? "active" : ""}`}>
            About
          </Link>
          
          <Link href="/contact" className={`nav-link ${isContactActive ? "active" : ""}`}>
            Contact Us
          </Link>
          
          {user && (
            <button 
              className={`nav-link ${isDashboardActive ? "active" : ""}`}
              onClick={() => handleNav("dashboard")}
            >
              Dashboard
            </button>
          )}

          {user && user.role === "admin" && (
            <Link href="/admin" className={`nav-link text-indigo ${isAdminActive ? "active" : ""}`} style={{ fontWeight: 700 }}>
              Admin Console
            </Link>
          )}
        </nav>

        {/* Right: Utilities */}
        <div className="nav-utilities">
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
                  
                  <button onClick={() => { router.push("/profile"); setDropdownOpen(false); }} className="dropdown-item">
                    <User size={16} />
                    My Profile
                  </button>

                  <button onClick={() => handleNav("dashboard")} className="dropdown-item">
                    <LayoutDashboard size={16} />
                    My Dashboard
                  </button>
                  
                  <button onClick={() => { router.push("/host-event"); setDropdownOpen(false); }} className="dropdown-item">
                    <PlusCircle size={16} />
                    Host an Event
                  </button>
                  
                  {user && user.role === "admin" && (
                    <button onClick={() => { router.push("/admin"); setDropdownOpen(false); }} className="dropdown-item">
                      <ShieldCheck size={16} className="text-indigo" />
                      Admin Console
                    </button>
                  )}

                  <button onClick={() => { router.push("/about"); setDropdownOpen(false); }} className="dropdown-item">
                    <HelpCircle size={16} />
                    About EveFest
                  </button>

                  <button onClick={() => { router.push("/contact"); setDropdownOpen(false); }} className="dropdown-item">
                    <Info size={16} />
                    Contact Support
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

          {/* Mobile menu toggle button */}
          <button 
            className="mobile-menu-toggle btn-icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer glass-panel animate-slide-up">
          <button 
            className={`mobile-nav-link ${isExploreActive ? "active" : ""}`}
            onClick={() => { handleNav("explore"); setMobileMenuOpen(false); }}
          >
            Explore
          </button>
          
          <Link 
            href="/about" 
            className={`mobile-nav-link ${isAboutActive ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          
          <Link 
            href="/contact" 
            className={`mobile-nav-link ${isContactActive ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact Us
          </Link>
          
          {user && (
            <button 
              className={`mobile-nav-link ${isDashboardActive ? "active" : ""}`}
              onClick={() => { handleNav("dashboard"); setMobileMenuOpen(false); }}
            >
              Dashboard
            </button>
          )}

          {user && user.role === "admin" && (
            <Link 
              href="/admin" 
              className={`mobile-nav-link text-indigo ${isAdminActive ? "active" : ""}`}
              style={{ fontWeight: 700 }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin Console
            </Link>
          )}
        </div>
      )}

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
        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .nav-utilities {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        :global(.nav-link) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--fg-secondary);
          padding: 0.5rem 1rem;
          border-radius: var(--border-radius-sm);
          transition: var(--transition-fast);
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }
        :global(.nav-link:hover), :global(.nav-link.active) {
          color: var(--accent-primary) !important;
          background: rgba(99, 102, 241, 0.08) !important;
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
        
        :global(.nav-link.active) {
          background: rgba(99, 102, 241, 0.15) !important;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.15) !important;
        }

        .mobile-menu-toggle {
          display: none;
        }

        /* Mobile drawer styles */
        .mobile-menu-drawer {
          position: absolute;
          top: 75px;
          left: 1rem;
          right: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          border-radius: var(--border-radius-md);
          z-index: 999; /* Enforce top layer visibility */
          box-shadow: var(--shadow-lg), 0 20px 40px rgba(0, 0, 0, 0.15);
          background: rgba(255, 255, 255, 0.75) !important; /* Semi-transparent in light mode for blur effect */
          border: 1px solid rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(24px) !important;
          -webkit-backdrop-filter: blur(24px) !important;
        }

        :global(.dark) .mobile-menu-drawer {
          background: rgba(18, 18, 20, 0.75) !important; /* Semi-transparent in dark mode for blur effect */
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: var(--shadow-lg), 0 20px 40px rgba(0, 0, 0, 0.5) !important;
        }

        :global(.mobile-nav-link) {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--fg-secondary);
          padding: 0.65rem 1rem;
          border-radius: var(--border-radius-sm);
          text-align: left;
          width: 100%;
          transition: var(--transition-fast);
          box-sizing: border-box;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: inherit;
          margin: 0;
        }

        :global(.mobile-nav-link:hover), :global(.mobile-nav-link.active) {
          color: var(--accent-primary) !important;
          background: rgba(99, 102, 241, 0.08) !important;
        }

        :global(.mobile-nav-link.active) {
          background: rgba(99, 102, 241, 0.15) !important;
        }
        
        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
          .mobile-menu-toggle {
            display: flex;
          }
          .user-name {
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
