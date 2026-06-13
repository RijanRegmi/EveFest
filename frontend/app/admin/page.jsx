"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import { useApp } from "../../context/AppContext";
import { useRouter } from "next/navigation";
import { 
  Users, 
  ShieldAlert, 
  MessageSquare, 
  Search, 
  UserPlus, 
  Edit, 
  Trash2, 
  ShieldOff, 
  Send,
  AlertTriangle,
  X,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Calendar,
  Lock,
  UserCheck
} from "lucide-react";

export default function AdminDashboardPage() {
  const { 
    user, 
    events,
    adminUsers, 
    getAdminUsers, 
    createAdminUser, 
    updateAdminUser, 
    deleteAdminUser, 
    takedownEvent,
    adminThreads,
    getAdminThreads,
    getAdminThreadMessages,
    postAdminReply,
    showToast 
  } = useApp();

  const router = useRouter();
  const [activeTab, setActiveTab] = useState("users"); // 'users' | 'events' | 'support'
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals state
  const [userModal, setUserModal] = useState({ open: false, type: "create", user: null });
  const [takedownModal, setTakedownModal] = useState({ open: false, eventId: null, eventTitle: "" });
  const [userForm, setUserForm] = useState({ name: "", username: "", email: "", phoneNumber: "", password: "", role: "user" });
  const [takedownReason, setTakedownReason] = useState("");
  
  // Support state
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [activeThreadName, setActiveThreadName] = useState("");
  const [threadMessages, setThreadMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  
  const threadScrollRef = useRef(null);

  // Security Gate: Redirect if not administrator
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    // If user loaded and is not admin, redirect
    if (user && user.role !== "admin") {
      router.push("/");
      showToast("Access Denied: Admins Only.", "error");
    }
  }, [user]);

  // Load appropriate data when tab changes (with polling for support tab)
  useEffect(() => {
    if (!user || user.role !== "admin") return;

    if (activeTab === "users") {
      getAdminUsers();
      return;
    }

    if (activeTab === "support") {
      getAdminThreads();
      // Poll thread list every 5 seconds to show new conversations
      const threadPoll = setInterval(() => {
        getAdminThreads();
      }, 5000);
      return () => clearInterval(threadPoll);
    }
  }, [activeTab, user]);

  // Handle active support thread — load + poll every 3 seconds for real-time messages
  useEffect(() => {
    if (!activeThreadId) return;

    // Initial load with spinner
    setLoadingMessages(true);
    getAdminThreadMessages(activeThreadId)
      .then((msgs) => setThreadMessages(msgs))
      .finally(() => setLoadingMessages(false));

    // Silent background poll for new messages
    const msgPoll = setInterval(() => {
      getAdminThreadMessages(activeThreadId)
        .then((msgs) => setThreadMessages(msgs));
    }, 3000);

    return () => clearInterval(msgPoll);
  }, [activeThreadId]);

  // Scroll to bottom on thread update
  useEffect(() => {
    if (threadScrollRef.current) {
      threadScrollRef.current.scrollTop = threadScrollRef.current.scrollHeight;
    }
  }, [threadMessages]);

  if (!user || user.role !== "admin") {
    return (
      <>
        <Navbar />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: "1rem" }}>
          <Lock size={48} className="text-warning" />
          <p>Verifying admin permissions...</p>
        </div>
      </>
    );
  }

  // Handle User Modal Submit
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (userModal.type === "create") {
      const success = await createAdminUser(userForm);
      if (success) {
        setUserModal({ open: false, type: "create", user: null });
        setUserForm({ name: "", username: "", email: "", phoneNumber: "", password: "", role: "user" });
      }
    } else {
      const success = await updateAdminUser(userModal.user._id, userForm);
      if (success) {
        setUserModal({ open: false, type: "create", user: null });
      }
    }
  };

  // Open Edit User Modal
  const openEditUser = (usr) => {
    setUserForm({
      name: usr.name,
      username: usr.username,
      email: usr.email,
      phoneNumber: usr.phoneNumber,
      password: "", // Leave blank unless changing
      role: usr.role
    });
    setUserModal({ open: true, type: "edit", user: usr });
  };

  // Open Create User Modal
  const openCreateUser = () => {
    setUserForm({ name: "", username: "", email: "", phoneNumber: "", password: "", role: "user" });
    setUserModal({ open: true, type: "create", user: null });
  };

  // Handle Delete User
  const handleDeleteUser = async (userId, name) => {
    if (window.confirm(`Are you sure you want to permanently delete user "${name}"? This will automatically clear all their bookings and hosted events.`)) {
      await deleteAdminUser(userId);
    }
  };

  // Handle Takedown Submit
  const handleTakedownSubmit = async (e) => {
    e.preventDefault();
    if (takedownReason.trim().length < 8) {
      showToast("Takedown reason must be at least 8 characters.", "error");
      return;
    }
    const success = await takedownEvent(takedownModal.eventId, takedownReason.trim());
    if (success) {
      setTakedownModal({ open: false, eventId: null, eventTitle: "" });
      setTakedownReason("");
    }
  };

  // Handle Support Reply Submit
  const handleSupportReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSendingReply(true);
    const newMsg = await postAdminReply(activeThreadId, replyText);
    setSendingReply(false);

    if (newMsg) {
      setThreadMessages((prev) => [...prev, newMsg]);
      setReplyText("");
    }
  };

  // Filters
  const filteredUsers = adminUsers.filter((u) => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.hostName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Navbar />

      <main className="admin-page container animate-fade-in">
        <div className="admin-header">
          <h1 className="page-title text-gradient">Admin Moderation Console</h1>
          <p className="page-subtitle">Perform user administration, moderate coordinator uploads, and resolve support queries.</p>
        </div>

        {/* Console Tab System */}
        <div className="admin-tab-bar">
          <button className={`tab-btn ${activeTab === "users" ? "active" : ""}`} onClick={() => { setActiveTab("users"); setSearchQuery(""); }}>
            <Users size={16} />
            User Administration ({adminUsers.length})
          </button>
          <button className={`tab-btn ${activeTab === "events" ? "active" : ""}`} onClick={() => { setActiveTab("events"); setSearchQuery(""); }}>
            <ShieldAlert size={16} />
            Event Moderation ({events.length})
          </button>
          <button className={`tab-btn ${activeTab === "support" ? "active" : ""}`} onClick={() => { setActiveTab("support"); setSearchQuery(""); }}>
            <MessageSquare size={16} />
            Support Center ({adminThreads.length})
          </button>
        </div>

        {/* Tab Controls (Search & Actions) */}
        {activeTab !== "support" && (
          <div className="tab-controls-row">
            <div className="search-box glass-panel">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder={activeTab === "users" ? "Search users by name, username..." : "Search events by title, host..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {activeTab === "users" && (
              <button className="btn btn-primary" onClick={openCreateUser}>
                <UserPlus size={16} /> Add New User
              </button>
            )}
          </div>
        )}

        {/* Content Screens */}
        <div className="admin-content-screen">
          
          {/* 1. USERS TAB */}
          {activeTab === "users" && (
            <div className="glass-panel table-wrapper animate-slide-up">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User Profile</th>
                    <th>Username</th>
                    <th>Email Address</th>
                    <th>Phone Number</th>
                    <th>System Role</th>
                    <th className="text-right">Management Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-table-row">No users found.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((usr) => (
                      <tr key={usr._id} className="table-row">
                        <td>
                          <div className="user-profile-cell">
                            <div className="avatar">{usr.name.charAt(0).toUpperCase()}</div>
                            <span className="name">{usr.name}</span>
                          </div>
                        </td>
                        <td><span className="username">@{usr.username}</span></td>
                        <td>{usr.email}</td>
                        <td>{usr.phoneNumber}</td>
                        <td>
                          <span className={`role-badge ${usr.role}`}>
                            {usr.role === "admin" ? <ShieldCheck size={12} /> : <UserCheck size={12} />}
                            {usr.role}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="action-buttons">
                            <button className="btn-action edit" onClick={() => openEditUser(usr)} title="Edit User">
                              <Edit size={14} />
                            </button>
                            <button 
                              className="btn-action delete" 
                              onClick={() => handleDeleteUser(usr._id, usr.name)}
                              disabled={usr._id === user._id}
                              title={usr._id === user._id ? "Cannot delete yourself" : "Delete User"}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. EVENTS TAB */}
          {activeTab === "events" && (
            <div className="glass-panel table-wrapper animate-slide-up">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Event Details</th>
                    <th>Category</th>
                    <th>Organizer Host</th>
                    <th>Scheduling Date</th>
                    <th>Moderation Status</th>
                    <th className="text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-table-row">No events found.</td>
                    </tr>
                  ) : (
                    filteredEvents.map((evt) => (
                      <tr key={evt._id} className={`table-row ${evt.isTakedown ? "row-taken-down" : ""}`}>
                        <td>
                          <span className="event-title font-bold">{evt.title}</span>
                        </td>
                        <td><span className="category-tag">{evt.category}</span></td>
                        <td>{evt.hostName}</td>
                        <td><div className="date-cell"><Calendar size={12} /> {evt.date}</div></td>
                        <td>
                          {evt.isTakedown ? (
                            <span className="status-badge danger" title={`Reason: ${evt.takedownReason}`}>
                              <ShieldOff size={12} /> Taken Down
                            </span>
                          ) : (
                            <span className="status-badge success">
                              <CheckCircle size={12} /> Active
                            </span>
                          )}
                        </td>
                        <td className="text-right">
                          {!evt.isTakedown ? (
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => setTakedownModal({ open: true, eventId: evt._id, eventTitle: evt.title })}
                            >
                              Take Down
                            </button>
                          ) : (
                            <span className="takedown-reason-text" title={evt.takedownReason}>
                              Reason: {evt.takedownReason.slice(0, 18)}...
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. SUPPORT CENTER */}
          {activeTab === "support" && (
            <div className="support-center-grid animate-slide-up">
              {/* Thread list panel */}
              <div className="glass-panel threads-panel">
                <div className="panel-header">
                  <h3>Active User Conversations</h3>
                </div>
                <div className="threads-list scroll-container">
                  {adminThreads.length === 0 ? (
                    <div className="empty-threads">
                      <MessageSquare size={32} style={{ opacity: 0.4, marginBottom: "0.5rem" }} />
                      <p>No active support chats.</p>
                    </div>
                  ) : (
                    adminThreads.map((thread) => (
                      <div 
                        key={thread.userId} 
                        className={`thread-item ${activeThreadId === thread.userId ? "active" : ""}`}
                        onClick={() => {
                          setActiveThreadId(thread.userId);
                          setActiveThreadName(thread.user.name);
                        }}
                      >
                        <div className="thread-meta">
                          <span className="user-name">{thread.user.name}</span>
                          <span className="user-email">{thread.user.email}</span>
                        </div>
                        <p className="latest-text text-truncate">{thread.latestMessage?.text || "Started conversation"}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Thread messages panel */}
              <div className="glass-panel conversation-panel">
                {activeThreadId ? (
                  <div className="conversation-container">
                    <div className="conversation-header">
                      <h3>Chat with {activeThreadName}</h3>
                    </div>

                    <div className="conversation-messages scroll-container" ref={threadScrollRef}>
                      {loadingMessages ? (
                        <div className="chat-center-spinner">
                          <div className="spinner"></div>
                        </div>
                      ) : threadMessages.length === 0 ? (
                        <p className="empty-msgs">No messages in this chat.</p>
                      ) : (
                        threadMessages.map((msg, idx) => {
                          const isOwn = msg.senderId === user._id || msg.senderName.includes("Support Admin");
                          const hasStudentReplied = isOwn && threadMessages
                            .slice(idx + 1)
                            .some(m => !(m.senderId === user._id || m.senderName.includes("Support Admin")));
                          // seen = student has sent a message after this admin message (they've read it)
                          const hasSeen = isOwn && threadMessages
                            .slice(idx + 1)
                            .some(m => !(m.senderId === user._id || m.senderName.includes("Support Admin")));
                          return (
                            <div key={msg._id} className={`admin-bubble-row ${isOwn ? "own" : "student"}`}>
                              <div className={`chat-bubble-wrapper ${isOwn ? "own" : "student"}`}>
                                {!isOwn && (
                                  <span className="sender">{msg.senderName}</span>
                                )}
                                <p className="bubble-text">{msg.text}</p>
                                <span className="time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                              {isOwn && hasSeen && (
                                <span className="admin-seen-label">✓✓ Seen</span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <form onSubmit={handleSupportReply} className="conversation-input-bar">
                      <input 
                        type="text" 
                        placeholder={`Type reply to ${activeThreadName}...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="form-control"
                        disabled={sendingReply}
                        required
                      />
                      <button type="submit" className="btn btn-primary send-btn" disabled={sendingReply || !replyText.trim()}>
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="no-chat-selected">
                    <MessageSquare size={40} className="chat-icon text-indigo" />
                    <h3>No Chat Selected</h3>
                    <p>Select an active user conversation from the sidebar to view messages and send replies.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* MODAL 1: Create or Edit User */}
        {userModal.open && (
          <div className="modal-backdrop" onClick={() => setUserModal({ open: false, type: "create", user: null })}>
            <div className="modal-content glass-panel animate-slide-up" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setUserModal({ open: false, type: "create", user: null })}>
                <X size={18} />
              </button>

              <h2 className="modal-title">{userModal.type === "create" ? "Add New User" : `Edit User ${userModal.user?.name}`}</h2>
              
              <form onSubmit={handleUserSubmit} className="modal-form">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input type="text" value={userForm.name} onChange={(e) => setUserForm(p => ({ ...p, name: e.target.value }))} className="form-control" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Username *</label>
                    <input type="text" value={userForm.username} onChange={(e) => setUserForm(p => ({ ...p, username: e.target.value }))} className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">System Role</label>
                    <select value={userForm.role} onChange={(e) => setUserForm(p => ({ ...p, role: e.target.value }))} className="form-control select-input">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input type="email" value={userForm.email} onChange={(e) => setUserForm(p => ({ ...p, email: e.target.value }))} className="form-control" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input type="text" value={userForm.phoneNumber} onChange={(e) => setUserForm(p => ({ ...p, phoneNumber: e.target.value }))} className="form-control" required />
                </div>
                <div className="form-group">
                  <label className="form-label">{userModal.type === "create" ? "Password *" : "New Password (leave blank to keep current)"}</label>
                  <input type="password" value={userForm.password} onChange={(e) => setUserForm(p => ({ ...p, password: e.target.value }))} className="form-control" required={userModal.type === "create"} placeholder={userModal.type === "edit" ? "••••••••" : ""} />
                </div>

                <div className="modal-buttons" style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <button type="button" className="btn btn-secondary flex-1" onClick={() => setUserModal({ open: false, type: "create", user: null })}>Cancel</button>
                  <button type="submit" className="btn btn-primary flex-1">Save User</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: Event Takedown Reason */}
        {takedownModal.open && (
          <div className="modal-backdrop" onClick={() => setTakedownModal({ open: false, eventId: null, eventTitle: "" })}>
            <div className="modal-content glass-panel animate-slide-up" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setTakedownModal({ open: false, eventId: null, eventTitle: "" })}>
                <X size={18} />
              </button>

              <h2 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-danger)" }}>
                <AlertTriangle size={20} />
                Moderation Event Takedown
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--fg-secondary)", marginTop: "0.5rem" }}>
                You are taking down: <strong>{takedownModal.eventTitle}</strong>. 
                This will soft-delete the event and display a red warning banner detailing your reason to all registered attendees.
              </p>
              
              <form onSubmit={handleTakedownSubmit} className="modal-form" style={{ marginTop: "1.25rem" }}>
                <div className="form-group">
                  <label className="form-label">Reason for Takedown *</label>
                  <textarea 
                    value={takedownReason} 
                    onChange={(e) => setTakedownReason(e.target.value)} 
                    placeholder="e.g. Copyright infringement, inappropriate / graphic banner image, coordinate policy violations..." 
                    className="form-control text-area" 
                    rows="4" 
                    required 
                  />
                  <span className="char-hint" style={{ fontSize: "0.72rem", color: "var(--fg-tertiary)", alignSelf: "flex-end", marginTop: "0.25rem" }}>
                    Min 8 characters. ({takedownReason.length} entered)
                  </span>
                </div>

                <div className="modal-buttons" style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <button type="button" className="btn btn-secondary flex-1" onClick={() => setTakedownModal({ open: false, eventId: null, eventTitle: "" })}>Cancel</button>
                  <button type="submit" className="btn btn-danger flex-1" disabled={takedownReason.trim().length < 8}>Submit Takedown</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .admin-page { padding-top: 2rem; padding-bottom: 4rem; }
        .admin-header { margin-bottom: 2rem; }
        .page-title { font-size: 2.2rem; font-weight: 850; letter-spacing: -0.03em; margin-bottom: 0.25rem; }
        .page-subtitle { font-size: 0.95rem; color: var(--fg-secondary); }

        /* Tab bar */
        .admin-tab-bar { display: flex; gap: 1rem; border-bottom: 1px solid var(--glass-border); margin-bottom: 2rem; overflow-x: auto; }
        .tab-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.85rem 1.25rem; font-size: 0.92rem; font-weight: 700; color: var(--fg-secondary); border-bottom: 2px solid transparent; transition: var(--transition-fast); margin-bottom: -1px; white-space: nowrap; }
        .tab-btn:hover, .tab-btn.active { color: var(--accent-primary); }
        .tab-btn.active { border-color: var(--accent-primary); }

        .tab-controls-row { display: flex; justify-content: space-between; gap: 1.5rem; margin-bottom: 1.5rem; align-items: center; }
        .search-box { display: flex; align-items: center; gap: 0.75rem; padding: 0.55rem 1rem; border-radius: var(--border-radius-md); max-width: 380px; width: 100%; }
        .search-icon { color: var(--fg-tertiary); }
        .search-box input { border: none; background: transparent; width: 100%; color: var(--fg-primary); outline: none; font-size: 0.88rem; }

        /* Tables */
        .table-wrapper { border-radius: var(--border-radius-lg); overflow: hidden; }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem; }
        .admin-table th { background: rgba(99, 102, 241, 0.02); padding: 1rem 1.25rem; font-weight: 750; color: var(--fg-secondary); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid var(--glass-border); }
        .admin-table td { padding: 1rem 1.25rem; border-bottom: 1px solid var(--glass-border); vertical-align: middle; color: var(--fg-secondary); }
        .table-row:last-child td { border-bottom: none; }
        .table-row:hover { background: rgba(255, 255, 255, 0.015); }
        
        .row-taken-down td { opacity: 0.65; background: rgba(239, 68, 68, 0.01); }

        /* Table cells */
        .user-profile-cell { display: flex; align-items: center; gap: 0.75rem; }
        .avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--bg-tertiary); color: var(--accent-primary); font-weight: 750; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; border: 1px solid var(--glass-border); }
        .name { font-weight: 700; color: var(--fg-primary); }
        .username { color: var(--accent-primary); font-weight: 600; font-size: 0.84rem; }
        
        .role-badge { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.72rem; font-weight: 750; padding: 0.2rem 0.6rem; border-radius: var(--border-radius-full); text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid transparent; }
        .role-badge.admin { background: rgba(99, 102, 241, 0.12); color: var(--accent-primary); border-color: rgba(99, 102, 241, 0.25); }
        .role-badge.user { background: rgba(255, 255, 255, 0.05); color: var(--fg-secondary); border-color: var(--glass-border); }

        .status-badge { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; font-weight: 750; padding: 0.2rem 0.55rem; border-radius: var(--border-radius-sm); }
        .status-badge.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .status-badge.danger { background: rgba(239, 68, 68, 0.1); color: var(--color-danger); }

        .date-cell { display: flex; align-items: center; gap: 0.35rem; color: var(--fg-tertiary); }
        .category-tag { background: var(--bg-secondary); border: 1px solid var(--glass-border); padding: 0.2rem 0.5rem; border-radius: var(--border-radius-sm); font-size: 0.76rem; font-weight: 650; }

        .empty-table-row { text-align: center; padding: 3rem 0; color: var(--fg-tertiary); font-weight: 550; }

        /* Actions */
        .action-buttons { display: flex; justify-content: flex-end; gap: 0.5rem; }
        .btn-action { width: 30px; height: 30px; border-radius: var(--border-radius-sm); display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid var(--glass-border); background: var(--bg-secondary); color: var(--fg-tertiary); transition: var(--transition-fast); }
        .btn-action:hover { color: var(--fg-primary); }
        .btn-action.edit:hover { border-color: var(--accent-primary); color: var(--accent-primary); }
        .btn-action.delete:hover:not(:disabled) { border-color: var(--color-danger); color: var(--color-danger); }
        .btn-action:disabled { opacity: 0.35; cursor: not-allowed; }

        /* Support Panel grid */
        .support-center-grid { display: grid; grid-template-columns: 1fr 1.6fr; gap: 1.75rem; min-height: 520px; height: 520px; }
        
        .threads-panel { display: flex; flex-direction: column; overflow: hidden; padding: 0 !important; }
        .panel-header { padding: 1.25rem; border-bottom: 1px solid var(--glass-border); background: rgba(255,255,255,0.01); }
        .panel-header h3 { font-size: 1rem; font-weight: 800; }
        
        .threads-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
        .empty-threads { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 1.5rem; color: var(--fg-tertiary); text-align: center; font-size: 0.84rem; }

        .thread-item { padding: 1rem 1.25rem; border-bottom: 1px solid var(--glass-border); cursor: pointer; transition: var(--transition-fast); }
        .thread-item:last-child { border-bottom: none; }
        .thread-item:hover { background: rgba(99, 102, 241, 0.02); }
        .thread-item.active { background: rgba(99, 102, 241, 0.05); border-left: 3px solid var(--accent-primary); }
        
        .thread-meta { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.25rem; }
        .thread-meta .user-name { font-weight: 700; font-size: 0.88rem; color: var(--fg-primary); }
        .thread-meta .user-email { font-size: 0.72rem; color: var(--fg-tertiary); }
        .latest-text { font-size: 0.78rem; color: var(--fg-secondary); opacity: 0.8; }

        .conversation-panel { padding: 0 !important; overflow: hidden; }
        .no-chat-selected { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 4rem 2rem; height: 100%; gap: 1rem; }
        .chat-icon { opacity: 0.4; }
        .no-chat-selected h3 { font-size: 1.15rem; font-weight: 800; }
        .no-chat-selected p { font-size: 0.84rem; color: var(--fg-secondary); max-width: 280px; line-height: 1.5; }

        .conversation-container { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
        .conversation-header { padding: 1.25rem; border-bottom: 1px solid var(--glass-border); background: rgba(99,102,241,0.01); }
        .conversation-header h3 { font-size: 1rem; font-weight: 800; color: var(--fg-primary); }
        
        .conversation-messages { flex: 1; padding: 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.15rem; max-height: 380px; }
        .chat-center-spinner { display: flex; align-items: center; justify-content: center; height: 100%; padding: 4rem 0; }
        .empty-msgs { text-align: center; color: var(--fg-tertiary); padding: 3rem 0; font-size: 0.84rem; }

        .chat-bubble-wrapper { display: flex; flex-direction: column; max-width: 75%; padding: 0.65rem 0.85rem; border-radius: var(--border-radius-md); font-size: 0.84rem; line-height: 1.45; }
        .chat-bubble-wrapper.own { background: var(--accent-primary); color: white; border-bottom-right-radius: 2px; }
        .chat-bubble-wrapper.student { align-self: flex-start; background: var(--bg-tertiary); border: 1px solid var(--glass-border); color: var(--fg-primary); border-bottom-left-radius: 2px; }
        
        .admin-bubble-row { display: flex; flex-direction: column; }
        .admin-bubble-row.own { align-items: flex-end; }
        .admin-bubble-row.student { align-items: flex-start; }
        
        .admin-seen-label { font-size: 0.62rem; color: var(--accent-secondary); font-weight: 700; margin-top: 0.2rem; letter-spacing: 0.02em; }
        
        .chat-bubble-wrapper .sender { font-size: 0.65rem; font-weight: 800; opacity: 0.8; margin-bottom: 0.15rem; color: var(--accent-secondary); }
        .chat-bubble-wrapper .time { font-size: 0.6rem; opacity: 0.6; text-align: right; margin-top: 0.2rem; align-self: flex-end; }
        
        .conversation-input-bar { padding: 1rem 1.25rem; border-top: 1px solid var(--glass-border); background: rgba(0,0,0,0.1); display: flex; gap: 0.75rem; align-items: center; }
        .conversation-input-bar input { flex: 1; }

        /* Modals */
        .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1.5rem; }
        .modal-content { width: 100%; max-width: 460px; padding: 2.25rem 2rem; border-radius: var(--border-radius-md); position: relative; box-shadow: var(--shadow-lg); }
        .close-btn { position: absolute; top: 16px; right: 16px; color: var(--fg-tertiary); }
        .close-btn:hover { color: var(--fg-primary); }
        .modal-title { font-size: 1.35rem; font-weight: 850; letter-spacing: -0.02em; }
        .modal-form { display: flex; flex-direction: column; gap: 1.15rem; margin-top: 1.5rem; }
        .form-row { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 1rem; }
        .flex-1 { flex: 1; }
        .takedown-reason-text { font-size: 0.78rem; color: var(--color-danger); font-style: italic; }

        @media (max-width: 768px) {
          .support-center-grid { grid-template-columns: 1fr; min-height: 600px; height: auto; }
          .threads-panel { max-height: 250px; }
          .tab-controls-row { flex-direction: column; align-items: stretch; }
          .search-box { max-width: 100%; }
        }
      `}</style>
    </>
  );
}
