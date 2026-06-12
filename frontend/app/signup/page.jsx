"use client";

import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import Link from "next/link";
import { User, Mail, Phone, Lock, Key, ArrowLeft, Calendar, UserCheck, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const { register } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Input validations (Heuristic 5: Error Prevention)
      if (formData.username.length < 3) {
        throw new Error("Username must be at least 3 characters long.");
      }
      if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        throw new Error("Username can only contain letters, numbers, and underscores.");
      }
      if (!formData.email.includes("@")) {
        throw new Error("Please enter a valid email address.");
      }
      if (formData.phoneNumber.replace(/\D/g, "").length < 7) {
        throw new Error("Please enter a valid phone number (at least 7 digits).");
      }
      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const success = await register(
        formData.name,
        formData.username,
        formData.email,
        formData.phoneNumber,
        formData.password
      );

      if (success) {
        window.location.href = "/";
      }
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-page-wrapper">
      {/* LEFT FRAME: Branding & Brand Logo (Matches Login exactly) */}
      <div className="branding-frame">
        <div className="bg-glow bg-glow-violet"></div>
        <div className="bg-glow bg-glow-cyan"></div>

        <div className="branding-content animate-fade-in">
          {/* Logo Group */}
          <div className="brand-logo-group">
            <div className="logo-icon-box">
              <Calendar size={28} />
            </div>
            <span className="logo-text">Eve<span className="text-gradient">Fest</span></span>
          </div>

          <div className="branding-main">
            <h2 className="branding-title">
              Connect With Your <br />
              <span className="text-gradient-cyan">Campus Community</span>.
            </h2>
            <p className="branding-subtitle">
              Join EveFest today to explore student activities, get instant ticket passes, and host verify your club events dynamically.
            </p>

            {/* Feature List */}
            <div className="feature-list">
              <div className="feature-item">
                <CheckCircle2 className="feature-check" size={18} />
                <div className="feature-text">
                  <h4>Quick Digital Passes</h4>
                  <p>Register and book free or paid tickets with secure verification checkout.</p>
                </div>
              </div>

              <div className="feature-item">
                <CheckCircle2 className="feature-check" size={18} />
                <div className="feature-text">
                  <h4>Attendee Coordination</h4>
                  <p>Engage with other event participants via a live dedicated group chat room.</p>
                </div>
              </div>

              <div className="feature-item">
                <CheckCircle2 className="feature-check" size={18} />
                <div className="feature-text">
                  <h4>Student Verified Space</h4>
                  <p>Fast track event verification by uploading official club letter approvals.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="branding-footer">
            <p>© {new Date().getFullYear()} EveFest. Fulfilling modern Usability Standards.</p>
          </div>
        </div>
      </div>

      {/* RIGHT FRAME: Forms & Fields (Aligned on Right now) */}
      <div className="form-frame">
        {/* Back Navigation at the top of the frame */}
        <Link href="/" className="back-link">
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="form-content animate-slide-up">
          {/* Form Card for boundary containment */}
          <div className="form-card glass-panel">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Register to discover, host, and book campus events.</p>

            {error && <div className="error-banner">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Unique Username</label>
                <div className="input-with-icon">
                  <UserCheck size={18} className="input-icon" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="johndoe_12"
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@university.edu"
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="form-control"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle Password Visibility"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-with-icon">
                    <Key size={18} className="input-icon" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="form-control"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Toggle Confirm Password Visibility"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary submit-btn" 
                disabled={loading}
              >
                {loading ? (
                  "Creating Account..."
                ) : (
                  <>
                    Register
                    <UserCheck size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <span>Already have an account? </span>
              <Link href="/login" className="auth-link text-gradient">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .split-page-wrapper {
          height: 100vh;
          overflow: hidden; /* Hide all browser scrollbars */
          display: grid;
          grid-template-columns: 1.15fr 0.85fr; /* Aligned with Login layout! */
          background-color: var(--bg-primary);
        }

        /* LEFT FRAME (Branding - Aligned left on both routes) */
        .branding-frame {
          position: relative;
          background-color: #050507;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          padding: 3.5rem;
          height: 100%;
          box-sizing: border-box;
          overflow: hidden;
        }

        .dark .branding-frame {
          background-color: #030304;
        }

        /* Ambient Glows */
        .bg-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.18;
          z-index: 0;
          pointer-events: none;
        }
        
        .bg-glow-violet {
          top: -100px;
          left: -100px;
          background: var(--accent-primary);
        }
        
        .bg-glow-cyan {
          bottom: -150px;
          right: -50px;
          background: var(--accent-secondary);
        }

        .branding-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          width: 100%;
          color: #f8fafc;
        }

        .brand-logo-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon-box {
          width: 44px;
          height: 44px;
          border-radius: var(--border-radius-md);
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        .logo-text {
          font-size: 1.4rem;
          font-weight: 850;
          letter-spacing: -0.5px;
        }

        .branding-main {
          margin: auto 0;
          max-width: 540px;
        }

        .branding-title {
          font-size: 2.6rem;
          font-weight: 850;
          line-height: 1.15;
          letter-spacing: -1.5px;
          color: #ffffff;
          margin-bottom: 1.25rem;
        }

        .text-gradient-cyan {
          background: linear-gradient(135deg, #22d3ee, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .branding-subtitle {
          font-size: 1.05rem;
          color: #94a3b8;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        /* Feature Rows */
        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .feature-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .feature-check {
          color: var(--accent-secondary);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .feature-text h4 {
          font-size: 0.98rem;
          font-weight: 750;
          color: #ffffff;
          margin-bottom: 0.15rem;
        }

        .feature-text p {
          font-size: 0.85rem;
          color: #94a3b8;
          line-height: 1.4;
        }

        .branding-footer {
          font-size: 0.8rem;
          color: #64748b;
        }

        /* RIGHT FRAME (Form Panel - Aligned right on both routes) */
        .form-frame {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          padding: 2.5rem;
          box-sizing: border-box;
          background-color: var(--bg-primary);
          overflow: hidden;
        }

        .back-link {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--fg-secondary);
          transition: var(--transition-fast);
        }
        .back-link:hover {
          color: var(--accent-primary);
          transform: translateX(-4px);
        }

        .form-content {
          width: 100%;
          max-width: 440px;
          margin: auto 0;
        }

        /* Card Container boundary: tightly padded to fit 100% height nicely */
        .form-card {
          padding: 1.75rem 2.25rem;
          border-radius: var(--border-radius-lg);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          box-shadow: 0 10px 30px var(--glass-shadow);
        }

        .auth-title {
          font-size: 1.6rem;
          font-weight: 850;
          letter-spacing: -0.5px;
          margin-bottom: 0.25rem;
          color: var(--fg-primary);
        }

        .auth-subtitle {
          font-size: 0.85rem;
          color: var(--fg-secondary);
          margin-bottom: 1.15rem;
          line-height: 1.4;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--border-radius-sm);
          padding: 0.5rem 0.75rem;
          color: var(--color-danger);
          font-size: 0.78rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        /* Form layout - No scrollbars! */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          margin-bottom: 0px;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .input-icon {
          position: absolute;
          left: 14px;
          color: var(--fg-tertiary);
          pointer-events: none;
        }
        
        .input-with-icon .form-control {
          padding-left: 2.75rem;
          padding-right: 2.75rem;
          width: 100%;
        }

        /* Eye Password Toggle */
        .password-toggle {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          color: var(--fg-tertiary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
          transition: var(--transition-fast);
        }
        .password-toggle:hover {
          color: var(--fg-primary);
        }

        .submit-btn {
          width: 100%;
          padding: 0.85rem;
          font-size: 0.98rem;
          margin-top: 0.5rem;
        }

        .auth-footer {
          margin-top: 1.25rem;
          text-align: center;
          font-size: 0.88rem;
          font-weight: 550;
          color: var(--fg-secondary);
        }

        .auth-link {
          font-weight: 700;
        }

        /* RESPONSIVE STYLING */
        @media (max-width: 960px) {
          .split-page-wrapper {
            grid-template-columns: 1fr;
          }
          .branding-frame {
            display: none;
          }
          .form-frame {
            padding: 2.5rem 1.5rem;
            height: auto;
            min-height: 100vh;
            overflow: auto;
          }
        }
        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
