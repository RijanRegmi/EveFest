"use client";

import React, { useState, useEffect, Suspense } from "react";
import Navbar from "../../components/Navbar";
import { useApp } from "../../context/AppContext";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  Save, 
  ArrowLeft, 
  Calendar,
  MessageSquare,
  Ticket
} from "lucide-react";

function ProfilePageContent() {
  const { user, bookings, supportMessages, updateProfile, getSupportMessages } = useApp();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phoneNumber: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?redirect=/profile");
    }
  }, [user]);

  // Load user data into form
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        password: ""
      });
      getSupportMessages();
    }
  }, [user]);

  if (!user) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: "1rem" }}>
        <div className="spinner"></div>
        <p>Loading your profile details...</p>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Only send password if entered
    const payload = { ...formData };
    if (!payload.password.trim()) {
      delete payload.password;
    }

    const success = await updateProfile(payload);
    setLoading(false);

    if (success) {
      setFormData((prev) => ({ ...prev, password: "" }));
    }
  };

  return (
    <>
      <Navbar />

      <main className="profile-page container animate-fade-in">
        {/* Navigation Breadcrumb */}
        <div className="breadcrumb-row">
          <button onClick={() => router.push("/")} className="back-link">
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>

        <div className="profile-grid">
          {/* Left Side: User Card & Stats */}
          <div className="profile-sidebar-col">
            <div className="user-profile-hero glass-panel">
              <div className="avatar-large">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="user-display-name">{user.name}</h2>
              <p className="user-display-username">@{user.username}</p>
              
              <span className={`role-badge ${user.role}`}>
                <ShieldCheck size={14} />
                {user.role}
              </span>
            </div>

            {/* Profile Stats */}
            <div className="stats-box-grid">
              <div className="stat-box glass-panel">
                <Ticket size={24} className="stat-icon text-indigo" />
                <div className="stat-info">
                  <span className="stat-num">{bookings.length}</span>
                  <span className="stat-lbl">Tickets Booked</span>
                </div>
              </div>

              <div className="stat-box glass-panel">
                <MessageSquare size={24} className="stat-icon text-cyan" />
                <div className="stat-info">
                  <span className="stat-num">{supportMessages.length}</span>
                  <span className="stat-lbl">Support Tickets</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Edit Details Form */}
          <div className="profile-main-col">
            <div className="form-card glass-panel">
              <h3 className="section-title">Account Details</h3>
              <p className="section-subtitle">Update your personal credentials and campus contact information below.</p>

              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-with-icon">
                    <User size={18} className="input-icon" />
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-control" 
                      required 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <div className="input-with-icon">
                      <User size={18} className="input-icon" />
                      <input 
                        type="text" 
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
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
                        type="text" 
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="form-control" 
                        required 
                      />
                    </div>
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
                      className="form-control" 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">New Password (leave blank to keep current)</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input 
                      type="password" 
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="form-control" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary submit-btn"
                  disabled={loading}
                >
                  <Save size={16} />
                  {loading ? "Saving Changes..." : "Save Profile Changes"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer-layout">
        <div className="container footer-container">
          <div className="footer-left">
            <span className="footer-logo">EveFest</span>
            <p className="footer-text">© {new Date().getFullYear()} EveFest. Secure campus organizer.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .profile-page {
          padding-top: 2rem;
          padding-bottom: 4rem;
        }

        .breadcrumb-row {
          margin-bottom: 1.5rem;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--fg-secondary);
          transition: var(--transition-fast);
        }
        .back-link:hover {
          color: var(--accent-primary);
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          gap: 2.5rem;
          align-items: start;
        }

        /* Sidebar profile styling */
        .profile-sidebar-col {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .user-profile-hero {
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.75rem;
        }

        .avatar-large {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
          font-size: 2.25rem;
          font-weight: 850;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid var(--glass-border);
          box-shadow: var(--shadow-md);
          margin-bottom: 0.5rem;
        }

        .user-display-name {
          font-size: 1.35rem;
          font-weight: 850;
          color: var(--fg-primary);
        }

        .user-display-username {
          font-size: 0.9rem;
          color: var(--accent-primary);
          font-weight: 700;
          margin-top: -0.25rem;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.25rem 0.75rem;
          border-radius: var(--border-radius-full);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid transparent;
        }
        .role-badge.admin {
          background: rgba(99, 102, 241, 0.15);
          color: var(--accent-primary);
          border-color: rgba(99, 102, 241, 0.3);
        }
        .role-badge.user {
          background: rgba(255, 255, 255, 0.05);
          color: var(--fg-secondary);
          border-color: var(--glass-border);
        }

        /* Stats grids */
        .stats-box-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .stat-box {
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          border-radius: var(--border-radius-md);
        }

        .stat-icon {
          flex-shrink: 0;
        }
        .text-indigo { color: var(--accent-primary); }
        .text-cyan { color: var(--accent-secondary); }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-num {
          font-size: 1.25rem;
          font-weight: 850;
          color: var(--fg-primary);
          line-height: 1.1;
        }

        .stat-lbl {
          font-size: 0.7rem;
          color: var(--fg-tertiary);
          font-weight: 600;
          text-transform: uppercase;
        }

        /* Main profile form card */
        .profile-main-col {
          display: flex;
          flex-direction: column;
        }

        .form-card {
          padding: 2.5rem 2rem;
          border-radius: var(--border-radius-md);
        }

        .section-title {
          font-size: 1.35rem;
          font-weight: 850;
          margin-bottom: 0.25rem;
        }

        .section-subtitle {
          font-size: 0.88rem;
          color: var(--fg-secondary);
          margin-bottom: 2rem;
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
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
          width: 100%;
        }

        .submit-btn {
          width: 100%;
          padding: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        /* Footer */
        .footer-layout {
          margin-top: 5rem;
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
        }
        .footer-text {
          font-size: 0.8rem;
          color: var(--fg-tertiary);
        }

        /* Spinner */
        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--glass-border);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .profile-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .form-row {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
        }
      `}</style>
    </>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <div className="spinner"></div>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}
