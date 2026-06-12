"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { X, Calendar, MapPin, Tv, Users, FileText, DollarSign, Image } from "lucide-react";

export default function EventForm() {
  const { authModal, setAuthModal, hostEvent } = useApp();
  const [formData, setFormData] = useState({
    title: "",
    category: "Technology",
    description: "",
    date: "",
    time: "",
    isOnline: false,
    location: "",
    mapLink: "",
    locationDescription: "",
    price: 0,
    isPaid: false,
    limit: "unlimited",
    limitCount: 50,
    image: "",
    proofDocName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!authModal.open || authModal.tab !== "host") return null;

  const handleClose = () => {
    setAuthModal({ open: false, tab: "login" });
    setError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Mock File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        proofDocName: file.name,
      }));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validations (Heuristic 5: Error Prevention)
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (selectedDate < today) {
        throw new Error("Event date cannot be in the past.");
      }

      if (!formData.title.trim() || formData.title.length < 5) {
        throw new Error("Event title must be at least 5 characters long.");
      }

      const payload = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        isOnline: formData.isOnline,
        location: formData.isOnline ? "Zoom Video Conferencing" : formData.location,
        mapLink: formData.isOnline ? "https://zoom.us/j/meeting" : formData.mapLink,
        locationDescription: formData.locationDescription,
        price: formData.isPaid ? Number(formData.price) : 0,
        limit: formData.limit === "unlimited" ? "unlimited" : Number(formData.limitCount),
        image: formData.image || undefined,
        proofDocName: formData.proofDocName || undefined,
        proofDoc: formData.proofDocName ? "MOCK_PDF_DATA_URI" : undefined,
      };

      const success = await hostEvent(payload);
      if (success) {
        handleClose();
      }
    } catch (err) {
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
        {/* Close Button */}
        <button className="close-btn" onClick={handleClose}>
          <X size={20} />
        </button>

        <h2 className="modal-title">Host an Event</h2>
        <p className="modal-subtitle">Publish your event to the college campus portal.</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="event-form scroll-container">
          
          {/* Section 1: Basic Info */}
          <div className="form-section">
            <h3 className="section-title">1. Basic Information</h3>
            
            <div className="form-group">
              <label className="form-label">Event Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Annual Design Colloquium"
                className="form-control"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="Technology">Technology</option>
                  <option value="Music">Music</option>
                  <option value="Design">Design</option>
                  <option value="Arts">Arts</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Banner Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://unsplash.com/..."
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your event agenda, guest speakers, prerequisites, and what to expect."
                className="form-control text-area"
                rows="3"
                required
              ></textarea>
            </div>
          </div>

          {/* Section 2: Date & Time */}
          <div className="form-section">
            <h3 className="section-title">2. Date & Time</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Event Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Time Duration *</label>
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  placeholder="e.g., 10:00 AM - 01:00 PM"
                  className="form-control"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Format & Location */}
          <div className="form-section">
            <h3 className="section-title">3. Format & Venue</h3>
            
            <div className="checkbox-group">
              <input
                type="checkbox"
                name="isOnline"
                id="isOnline"
                checked={formData.isOnline}
                onChange={handleChange}
                className="custom-checkbox"
              />
              <label htmlFor="isOnline" className="checkbox-label">
                This is a virtual event (hosted online via stream/meeting)
              </label>
            </div>

            {!formData.isOnline && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Venue Location Name *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., Lecture Hall 101"
                      className="form-control"
                      required={!formData.isOnline}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Map Pin Link</label>
                    <input
                      type="url"
                      name="mapLink"
                      value={formData.mapLink}
                      onChange={handleChange}
                      placeholder="e.g., https://maps.google.com/..."
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Location Instructions</label>
                  <textarea
                    name="locationDescription"
                    value={formData.locationDescription}
                    onChange={handleChange}
                    placeholder="Directions, parking advice, building level instructions..."
                    className="form-control text-area"
                    rows="2"
                  ></textarea>
                </div>
              </>
            )}
          </div>

          {/* Section 4: Tickets & Capacity */}
          <div className="form-section">
            <h3 className="section-title">4. Capacity & Pricing</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Seat Limit</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="limit"
                      value="unlimited"
                      checked={formData.limit === "unlimited"}
                      onChange={handleChange}
                    />
                    Unlimited
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="limit"
                      value="limited"
                      checked={formData.limit === "limited"}
                      onChange={handleChange}
                    />
                    Limited Seats
                  </label>
                </div>
              </div>

              {formData.limit === "limited" && (
                <div className="form-group">
                  <label className="form-label">Seat Limit Count</label>
                  <input
                    type="number"
                    name="limitCount"
                    value={formData.limitCount}
                    onChange={handleChange}
                    min="1"
                    className="form-control"
                  />
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ticket Type</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="isPaid"
                      checked={!formData.isPaid}
                      onChange={() => setFormData(p => ({ ...p, isPaid: false, price: 0 }))}
                    />
                    Free Access
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="isPaid"
                      checked={formData.isPaid}
                      onChange={() => setFormData(p => ({ ...p, isPaid: true }))}
                    />
                    Paid Pass
                  </label>
                </div>
              </div>

              {formData.isPaid && (
                <div className="form-group">
                  <label className="form-label">Ticket Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="1"
                    className="form-control"
                    required={formData.isPaid}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Verification Document */}
          <div className="form-section">
            <h3 className="section-title">5. Hosting Verification (Optional)</h3>
            <p className="section-subtitle-small">
              Upload legal approval permits, club letters, or booking confirmations to fast-track verification.
            </p>
            <div className="file-upload-box">
              <FileText size={28} className="file-upload-icon" />
              <div className="file-upload-text">
                {formData.proofDocName ? (
                  <span className="file-uploaded-name text-gradient">{formData.proofDocName}</span>
                ) : (
                  <span>Click to select verification file (PDF/Image)</span>
                )}
                <span className="file-limit">Max size 5MB</span>
              </div>
              <input 
                type="file" 
                onChange={handleFileUpload} 
                className="hidden-file-input"
                accept=".pdf, image/*"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary submit-btn" 
            disabled={loading}
          >
            {loading ? "Publishing Event..." : "Publish Event"}
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
          max-width: 620px;
          max-height: 85vh;
          border-radius: var(--border-radius-md);
          padding: 2.25rem 2rem;
          position: relative;
          box-shadow: var(--shadow-lg), 0 20px 40px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
        }
        
        .modal-title {
          font-size: 1.5rem;
          font-weight: 850;
          margin-bottom: 0.25rem;
        }
        
        .modal-subtitle {
          font-size: 0.9rem;
          color: var(--fg-secondary);
          margin-bottom: 1.5rem;
        }
        
        .close-btn {
          position: absolute;
          top: 22px;
          right: 22px;
          color: var(--fg-tertiary);
          transition: var(--transition-fast);
        }
        .close-btn:hover {
          color: var(--fg-primary);
        }
        
        .event-form {
          overflow-y: auto;
          flex-grow: 1;
          padding-right: 0.5rem;
        }
        
        /* Section Dividers */
        .form-section {
          background: rgba(99, 102, 241, 0.015);
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-sm);
          padding: 1.25rem;
          margin-bottom: 1.5rem;
        }
        
        .section-title {
          font-size: 1rem;
          font-weight: 750;
          color: var(--accent-primary);
          margin-bottom: 1rem;
          border-bottom: 1px dashed var(--glass-border);
          padding-bottom: 0.5rem;
        }
        
        .section-subtitle-small {
          font-size: 0.78rem;
          color: var(--fg-tertiary);
          margin-bottom: 0.75rem;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .text-area {
          resize: vertical;
        }
        
        /* Checkbox */
        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 1rem;
        }
        
        .custom-checkbox {
          width: 17px;
          height: 17px;
          accent-color: var(--accent-primary);
          cursor: pointer;
        }
        
        .checkbox-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--fg-secondary);
          cursor: pointer;
        }
        
        /* Radio */
        .radio-group {
          display: flex;
          gap: 1.25rem;
          padding: 0.5rem 0;
        }
        
        .radio-label {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--fg-secondary);
          cursor: pointer;
        }
        
        .radio-label input {
          accent-color: var(--accent-primary);
        }
        
        /* File Upload */
        .file-upload-box {
          border: 2px dashed var(--glass-border);
          border-radius: var(--border-radius-md);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          position: relative;
          transition: var(--transition-smooth);
          background: var(--bg-secondary);
          text-align: center;
        }
        
        .file-upload-box:hover {
          border-color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.02);
        }
        
        .file-upload-icon {
          color: var(--fg-tertiary);
          transition: var(--transition-fast);
        }
        
        .file-upload-box:hover .file-upload-icon {
          color: var(--accent-primary);
        }
        
        .file-upload-text {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--fg-secondary);
        }
        
        .file-limit {
          font-size: 0.72rem;
          color: var(--fg-tertiary);
        }
        
        .hidden-file-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }
        
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
        
        .submit-btn {
          width: 100%;
          padding: 0.85rem;
          font-size: 1rem;
          margin-top: 0.5rem;
        }
        
        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }
      `}</style>
    </div>
  );
}
