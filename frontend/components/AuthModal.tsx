"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useApp } from "../context/AppContext";
import { X, Mail, Lock, User, Key, Info } from "lucide-react";

export default function AuthModal() {
  const { authModal, setAuthModal, login, register } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!authModal.open || authModal.tab === "host") return null;

  const handleClose = () => {
    setAuthModal({ open: false, tab: "login" });
    setError("");
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
  };

  const handleTab = (tab: string) => {
    setAuthModal((prev) => ({ ...prev, tab }));
    setError("");
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Basic Validations (Heuristic 5: Error Prevention)
      if (!formData.email.includes("@")) {
        throw new Error("Please enter a valid email address.");
      }

      if (authModal.tab === "login") {
        await login(formData.email, formData.password);
      } else {
        if (!formData.name.trim()) {
          throw new Error("Please enter your name.");
        }
        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters long.");
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        // Wait, does register expect 5 params (name, username, email, phoneNumber, password) or does the app just pass name, email, password?
        // Let's check: register(name, username, email, phoneNumber, password) is defined in AppContext.tsx.
        // Wait! In the old register call in AuthModal.jsx:
        // register(formData.name, formData.email, formData.password)
        // Let's look at the old register in AppContext:
        // register = async (name, username, email, phoneNumber, password) => { ... }
        // Ah! How does the old code call register? Let's check how register was defined.
        // Wait, the register function parameters: name, username, email, phoneNumber, password.
        // Let's check if the old code had a username or phone number in register.
        // Let's pass username as email or split name, and phone as empty string.
        const mockUsername = formData.email.split("@")[0] + "_" + Math.floor(Math.random() * 1000);
        await register(formData.name, mockUsername, formData.email, "", formData.password);
      }
      handleClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={handleClose}>
      <div 
        className="modal-content glass-panel animate-slide-up" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button className="close-btn" onClick={handleClose}>
          <X size={20} />
        </button>

        {/* Tab Headers */}
        <div className="tab-headers">
          <button 
            className={`tab-btn ${authModal.tab === "login" ? "active" : ""}`}
            onClick={() => handleTab("login")}
          >
            Log In
          </button>
          <button 
            className={`tab-btn ${authModal.tab === "signup" ? "active" : ""}`}
            onClick={() => handleTab("signup")}
          >
            Create Account
          </button>
        </div>

        {/* Info Banner */}
        {authModal.tab === "signup" && (
          <div className="info-banner">
            <Info size={16} className="info-icon" />
            <span>Register as a host to publish events and manage attendees.</span>
          </div>
        )}

        {/* Error Notification */}
        {error && <div className="error-banner">{error}</div>}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {authModal.tab === "signup" && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  className="form-control"
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">University / Work Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@university.edu"
                className="form-control"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="form-control"
                required
              />
            </div>
          </div>

          {authModal.tab === "signup" && (
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-with-icon">
                <Key size={18} className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="form-control"
                  required
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary submit-btn" 
            disabled={loading}
          >
            {loading ? "Processing..." : authModal.tab === "login" ? "Sign In" : "Sign Up"}
          </button>
        </form>
      </div>

      <style jsx>{`
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
          z-index: 1000;
          padding: 1.5rem;
        }
        
        .modal-content {
          width: 100%;
          max-width: 440px;
          border-radius: var(--border-radius-md);
          padding: 2.25rem 2rem;
          position: relative;
          box-shadow: var(--shadow-lg), 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        
        .close-btn {
          position: absolute;
          top: 18px;
          right: 18px;
          color: var(--fg-tertiary);
          transition: var(--transition-fast);
        }
        .close-btn:hover {
          color: var(--fg-primary);
        }
        
        /* Tab Styles */
        .tab-headers {
          display: flex;
          border-bottom: 2px solid var(--glass-border);
          margin-bottom: 1.25rem;
          gap: 1.5rem;
        }
        
        .tab-btn {
          padding-bottom: 0.65rem;
          font-size: 1.1rem;
          font-weight: 750;
          color: var(--fg-tertiary);
          border-bottom: 2px solid transparent;
          transition: var(--transition-fast);
          margin-bottom: -2px;
        }
        
        .tab-btn:hover, .tab-btn.active {
          color: var(--accent-primary);
        }
        
        .tab-btn.active {
          border-color: var(--accent-primary);
        }
        
        /* Info banner */
        .info-banner {
          display: flex;
          gap: 0.65rem;
          align-items: flex-start;
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.15);
          border-radius: var(--border-radius-sm);
          padding: 0.65rem 0.85rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--accent-primary);
          margin-bottom: 1.25rem;
        }
        .info-icon {
          flex-shrink: 0;
          margin-top: 1px;
        }
        
        /* Error banner */
        .error-banner {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--border-radius-sm);
          padding: 0.65rem 0.85rem;
          color: var(--color-danger);
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
        }
        
        /* Form controls and icons */
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        :global(.input-icon) {
          position: absolute;
          left: 14px;
          color: var(--fg-tertiary);
          pointer-events: none;
        }
        
        .input-with-icon .form-control {
          padding-left: 2.75rem;
          width: 100%;
        }
        
        .submit-btn {
          width: 100%;
          padding: 0.85rem;
          font-size: 1rem;
          margin-top: 0.75rem;
        }
      `}</style>
    </div>
  );
}
