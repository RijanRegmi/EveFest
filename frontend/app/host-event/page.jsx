"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../../context/AppContext";
import Navbar from "../../components/Navbar";
import {
  Calendar,
  MapPin,
  Tv,
  Users,
  FileText,
  DollarSign,
  Image,
  ArrowLeft,
  Upload,
  Info,
  X,
  ShieldCheck,
  ImagePlus,
  AlertCircle,
  BookOpen,
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

export default function HostEventPage() {
  const { user, hostEvent, showToast } = useApp();
  const router = useRouter();

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
    maxSeatsPerUser: 5,
    rules: "",
    proofDocName: "",
  });

  // File states
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bannerInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const proofInputRef = useRef(null);

  // Authenticated route protection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && !user) {
      router.push("/login");
      showToast("Please sign in to host an event.", "warning");
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Banner image selection
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Banner image must be under 10MB.");
      return;
    }
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setError("");
  };

  // Logo selection
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Logo must be under 5MB.");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setError("");
  };

  // Proof doc upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        return;
      }
      setFormData((prev) => ({ ...prev, proofDocName: file.name }));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) throw new Error("Event date cannot be in the past.");
      if (!formData.title.trim() || formData.title.length < 5) {
        throw new Error("Event title must be at least 5 characters long.");
      }

      // Build FormData for multipart upload
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("category", formData.category);
      fd.append("description", formData.description);
      fd.append("date", formData.date);
      fd.append("time", formData.time);
      fd.append("isOnline", formData.isOnline);
      fd.append("location", formData.isOnline ? "Zoom Video Conferencing" : formData.location);
      fd.append("mapLink", formData.isOnline ? "https://zoom.us/j/meeting" : formData.mapLink);
      fd.append("locationDescription", formData.locationDescription);
      fd.append("price", formData.isPaid ? Number(formData.price) : 0);
      fd.append("limit", formData.limit === "unlimited" ? "unlimited" : Number(formData.limitCount));
      fd.append("maxSeatsPerUser", Number(formData.maxSeatsPerUser || 5));
      fd.append("rules", formData.rules);
      if (formData.proofDocName) fd.append("proofDocName", formData.proofDocName);

      // Attach file uploads
      if (bannerFile) {
        fd.append("banner", bannerFile);
      } else {
        // Fallback default banner URL if no file selected
        fd.append("image", "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop");
      }
      if (logoFile) fd.append("logo", logoFile);

      // Store blob URL for offline fallback
      if (bannerPreview) fd.append("bannerPreview", bannerPreview);
      if (logoPreview) fd.append("logoPreview", logoPreview);

      const success = await hostEvent(fd);
      if (success) {
        router.push("/?view=explore");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="host-event-page container animate-fade-in">

        {/* Navigation Breadcrumb */}
        <div className="breadcrumb-row">
          <button onClick={() => router.push("/")} className="back-link">
            <ArrowLeft size={16} />
            Back to Explore
          </button>
        </div>

        <div className="hosting-grid">

          {/* Form Side */}
          <div className="form-card-wrapper glass-panel">
            <h1 className="page-title">Host an Event</h1>
            <p className="page-subtitle">Publish a new student activity or coordinator workshop onto the college portal.</p>

            {error && <div className="error-banner"><AlertCircle size={15} />{error}</div>}

            <form onSubmit={handleSubmit} className="event-creation-form">

              {/* SECTION 1: Basic Info */}
              <div className="form-section">
                <h3 className="section-title"><FileText size={16} />1. Basic Information</h3>

                <div className="form-group">
                  <label className="form-label">Event Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Hackathon, Concert, UI/UX Seminar"
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
                      className="form-control select-input"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Music">Music</option>
                      <option value="Design">Design</option>
                      <option value="Arts">Arts</option>
                      <option value="Sports">Sports</option>
                      <option value="Business">Business</option>
                      <option value="Science">Science</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div className="form-group">
                    {/* empty col for alignment */}
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
                    rows="4"
                    required
                  ></textarea>
                </div>
              </div>

              {/* SECTION 2: Banner Image Upload */}
              <div className="form-section">
                <h3 className="section-title"><ImagePlus size={16} />2. Event Banner Image</h3>
                <p className="section-instruction-text">Upload a high-quality banner for your event (JPG, PNG, WebP — max 10MB).</p>

                <div>
                  <div
                    className="image-upload-zone banner-upload"
                    onClick={() => bannerInputRef.current?.click()}
                    style={bannerPreview ? { padding: 0, border: "none", cursor: "pointer" } : { cursor: "pointer" }}
                  >
                    {bannerPreview ? (
                      <div className="preview-wrapper">
                        <img src={bannerPreview} alt="Banner preview" className="banner-preview-img" />
                        <div className="preview-overlay">
                          <Upload size={20} />
                          <span>Click to change banner image</span>
                        </div>
                        <button
                          type="button"
                          className="remove-preview-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBannerFile(null);
                            setBannerPreview("");
                            if (bannerInputRef.current) bannerInputRef.current.value = "";
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={32} className="upload-icon" />
                        <div className="upload-meta">
                          <span className="upload-cta">Click to upload banner image</span>
                          <span className="upload-limit">JPG, PNG, WebP, GIF — max 10MB</span>
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleBannerChange}
                  />
                </div>
              </div>

              {/* SECTION 3: Logo Upload */}
              <div className="form-section">
                <h3 className="section-title"><Image size={16} />3. Organizer / Event Logo <span className="optional-tag">Optional</span></h3>
                <p className="section-instruction-text">Add your society, club, or company logo to brand the event page.</p>

                <div className="logo-upload-row">
                  <div>
                    <div
                      className="logo-upload-zone"
                      onClick={() => logoInputRef.current?.click()}
                      style={{ cursor: "pointer" }}
                    >
                      {logoPreview ? (
                        <div className="logo-preview-inner">
                          <img src={logoPreview} alt="Logo preview" className="logo-preview-img" />
                          <div className="logo-preview-overlay" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s", borderRadius: "var(--border-radius-md)" }}>
                            <Upload size={14} style={{ color: "white" }} />
                          </div>
                          <button
                            type="button"
                            className="remove-preview-btn small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLogoFile(null);
                              setLogoPreview("");
                              if (logoInputRef.current) logoInputRef.current.value = "";
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <ImagePlus size={24} className="upload-icon" />
                          <span className="logo-upload-text">Upload Logo</span>
                          <span className="upload-limit">Max 5MB</span>
                        </>
                      )}
                    </div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                  </div>
                  <div className="logo-upload-hint">
                    <p>The logo will appear as a badge on your event page, alongside your event title. Recommended size: 256×256px or square format.</p>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Date & Duration */}
              <div className="form-section">
                <h3 className="section-title"><Calendar size={16} />4. Date & Duration</h3>
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
                    <label className="form-label">Time / Duration *</label>
                    <input
                      type="text"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      placeholder="e.g., 02:00 PM - 05:00 PM"
                      className="form-control"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: Format & Venue */}
              <div className="form-section">
                <h3 className="section-title"><MapPin size={16} />5. Format & Venue Location</h3>

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
                    This is an online virtual event (hosted via Zoom, Teams, etc.)
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
                          placeholder="e.g., Campus Auditorium, Hall B"
                          className="form-control"
                          required={!formData.isOnline}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Google Maps Pin URL</label>
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
                        placeholder="Details about building level, parking instructions, check-in desk, etc..."
                        className="form-control text-area"
                        rows="2"
                      ></textarea>
                    </div>
                  </>
                )}
              </div>

              {/* SECTION 6: Capacity & Pricing */}
              <div className="form-section">
                <h3 className="section-title"><Users size={16} />6. Capacity & Pricing</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Seat Limit Type</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="limit"
                          value="unlimited"
                          checked={formData.limit === "unlimited"}
                          onChange={handleChange}
                        />
                        Unlimited Seats
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="limit"
                          value="limited"
                          checked={formData.limit === "limited"}
                          onChange={handleChange}
                        />
                        Limit Attendance
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
                    <label className="form-label">Max Seats Per User *</label>
                    <input
                      type="number"
                      name="maxSeatsPerUser"
                      value={formData.maxSeatsPerUser}
                      onChange={handleChange}
                      min="1"
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    {/* empty col for layout alignment */}
                  </div>
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

              {/* SECTION 7: Rules & Code of Conduct */}
              <div className="form-section rules-section">
                <h3 className="section-title"><BookOpen size={16} />7. Event Rules & Code of Conduct <span className="optional-tag">Optional</span></h3>
                <p className="section-instruction-text">
                  Specify any rules, dress code, ID requirements, photography policy, or code of conduct for attendees. These will be displayed prominently on the event page.
                </p>
                <textarea
                  name="rules"
                  value={formData.rules}
                  onChange={handleChange}
                  placeholder={`Example rules:\n• All attendees must carry a valid student ID.\n• No photography without permission from the organizer.\n• Dress code: Smart casual / formals only.\n• Alcohol and smoking are strictly prohibited at the venue.\n• Late arrivals may not be admitted after 15 minutes of the start time.\n• Respect all speakers, volunteers, and fellow attendees.`}
                  className="form-control rules-textarea"
                  rows="8"
                ></textarea>
                <div className="char-count">{formData.rules.length} characters</div>
              </div>

              {/* SECTION 8: Host Verification */}
              <div className="form-section">
                <h3 className="section-title"><ShieldCheck size={16} />8. Host Verification <span className="optional-tag">Optional</span></h3>
                <p className="section-instruction-text">
                  Upload official college approval letter, reservation invoice, or society permit to speed up validation.
                </p>

                <div>
                  <div className="file-upload-zone" onClick={() => proofInputRef.current?.click()} style={{ cursor: "pointer" }}>
                    <Upload size={28} className="upload-icon" />
                    <div className="upload-meta">
                      {formData.proofDocName ? (
                        <span className="uploaded-file-name text-gradient">{formData.proofDocName}</span>
                      ) : (
                        <span>Click to select society permit / approval PDF</span>
                      )}
                      <span className="upload-limit">Max file size 5MB</span>
                    </div>
                  </div>
                  <input
                    ref={proofInputRef}
                    type="file"
                    style={{ display: "none" }}
                    accept=".pdf, image/*"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              <div className="submit-btn-row">
                <button
                  type="submit"
                  className="btn btn-primary submit-btn"
                  disabled={loading}
                >
                  {loading ? "Publishing Event..." : "Publish Event"}
                </button>
              </div>

            </form>
          </div>

          {/* Info/Guide Side */}
          <div className="info-sidebar-panel">
            <div className="guide-card glass-panel">
              <Info size={24} className="guide-icon" />
              <h3>Hosting Guidelines</h3>
              <ul className="guide-list">
                <li>
                  <strong>Accurate Venues:</strong> Check room availability and calendar booking sheets before publishing campus halls.
                </li>
                <li>
                  <strong>Date Restrictions:</strong> You cannot host retroactive events. Event date must be either today or in the future.
                </li>
                <li>
                  <strong>Ticket Pricing:</strong> Student-led society events are capped at $50 maximum price. Use Sandbox billing.
                </li>
                <li>
                  <strong>Banner Images:</strong> Use high-quality horizontal images (16:9 ratio recommended) for the best visual impact.
                </li>
                <li>
                  <strong>Logos:</strong> Square logos (256×256px) display best. PNG with transparent background recommended.
                </li>
                <li>
                  <strong>Rules:</strong> Clear rules help avoid disputes at the event. Include dress code, ID policy, and behavior expectations.
                </li>
                <li>
                  <strong>Approval Documents:</strong> Non-accredited student organizers must upload approval PDFs to display the verified Shield badge.
                </li>
              </ul>
            </div>

            {/* Live preview card */}
            {(bannerPreview || logoPreview || formData.title) && (
              <div className="preview-card glass-panel">
                <p className="preview-label">Live Preview</p>
                {bannerPreview && (
                  <div className="preview-banner-thumb">
                    <img src={bannerPreview} alt="Banner" />
                  </div>
                )}
                <div className="preview-info">
                  {logoPreview && (
                    <img src={logoPreview} alt="Logo" className="preview-logo" />
                  )}
                  <div>
                    <p className="preview-title">{formData.title || "Event Title"}</p>
                    <p className="preview-meta">{formData.category}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </main>

      <footer className="footer-layout">
        <div className="container footer-container">
          <div className="footer-left">
            <span className="footer-logo">EveFest</span>
            <p className="footer-text">© {new Date().getFullYear()} EveFest. Modern campus activities scheduler.</p>
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Support Desk</a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .host-event-page {
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
        .back-link:hover { color: var(--accent-primary); }

        .hosting-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2.5rem;
          align-items: start;
        }

        .form-card-wrapper {
          padding: 2.5rem;
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-lg);
        }

        .page-title {
          font-size: 2rem;
          font-weight: 850;
          letter-spacing: -0.03em;
          margin-bottom: 0.25rem;
        }

        .page-subtitle {
          font-size: 0.95rem;
          color: var(--fg-secondary);
          margin-bottom: 2.5rem;
        }

        .event-creation-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-section {
          padding: 1.5rem;
          background: rgba(99, 102, 241, 0.015);
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-md);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 800;
          color: var(--accent-primary);
          border-bottom: 1px dashed var(--glass-border);
          padding-bottom: 0.65rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .optional-tag {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--fg-tertiary);
          background: var(--bg-secondary);
          padding: 0.15rem 0.5rem;
          border-radius: var(--border-radius-full);
          margin-left: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .section-instruction-text {
          font-size: 0.82rem;
          color: var(--fg-tertiary);
          margin-top: -0.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .text-area { resize: vertical; }
        .form-control { width: 100%; }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 0.65rem;
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

        .radio-group {
          display: flex;
          gap: 1.5rem;
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
        .radio-label input { accent-color: var(--accent-primary); }

        /* === BANNER UPLOAD === */
        .image-upload-zone {
          border: 2px dashed var(--glass-border);
          background: var(--bg-secondary);
          border-radius: var(--border-radius-md);
          padding: 2.5rem 1.75rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          position: relative;
          text-align: center;
          transition: var(--transition-smooth);
          overflow: hidden;
          min-height: 160px;
          justify-content: center;
        }
        .image-upload-zone:hover {
          border-color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.03);
        }

        .preview-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .banner-preview-img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          border-radius: var(--border-radius-md);
          display: block;
        }

        .preview-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          opacity: 0;
          transition: opacity 0.2s;
          border-radius: var(--border-radius-md);
        }
        .image-upload-zone:hover .preview-overlay { opacity: 1; }

        .remove-preview-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(239, 68, 68, 0.85);
          color: white;
          border: none;
          border-radius: 50%;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: background 0.15s;
        }
        .remove-preview-btn:hover { background: rgba(239, 68, 68, 1); }
        .remove-preview-btn.small { width: 20px; height: 20px; top: 4px; right: 4px; }

        .upload-cta {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--fg-primary);
        }

        /* === LOGO UPLOAD === */
        .logo-upload-row {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
        }

        .logo-upload-zone {
          width: 120px;
          height: 120px;
          border: 2px dashed var(--glass-border);
          border-radius: var(--border-radius-md);
          background: var(--bg-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          cursor: pointer;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
          transition: var(--transition-smooth);
          text-align: center;
          padding: 0.5rem;
        }
        .logo-upload-zone:hover { border-color: var(--accent-primary); }

        .logo-preview-inner {
          width: 100%;
          height: 100%;
          position: relative;
        }
        .logo-preview-inner:hover .logo-preview-overlay {
          opacity: 1 !important;
        }

        .logo-preview-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: var(--border-radius-sm);
        }

        .logo-upload-text {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--fg-secondary);
        }

        .logo-upload-hint {
          flex: 1;
          font-size: 0.82rem;
          color: var(--fg-tertiary);
          line-height: 1.6;
          padding-top: 0.25rem;
        }

        /* === RULES SECTION === */
        .rules-section {
          border-color: rgba(99, 102, 241, 0.2);
          background: rgba(99, 102, 241, 0.02);
        }

        .rules-textarea {
          resize: vertical;
          min-height: 200px;
          font-size: 0.88rem;
          line-height: 1.7;
          font-family: inherit;
        }

        .char-count {
          text-align: right;
          font-size: 0.75rem;
          color: var(--fg-tertiary);
          margin-top: -0.5rem;
        }

        /* Proof doc upload zone */
        .file-upload-zone {
          border: 2px dashed var(--glass-border);
          background: var(--bg-secondary);
          border-radius: var(--border-radius-md);
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          position: relative;
          text-align: center;
          transition: var(--transition-smooth);
        }
        .file-upload-zone:hover { border-color: var(--accent-primary); }

        .upload-icon { color: var(--fg-tertiary); transition: var(--transition-fast); }
        .file-upload-zone:hover .upload-icon { color: var(--accent-primary); }
        .image-upload-zone:hover .upload-icon { color: var(--accent-primary); }
        .logo-upload-zone:hover .upload-icon { color: var(--accent-primary); }

        .upload-meta {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--fg-secondary);
        }

        .upload-limit { font-size: 0.72rem; color: var(--fg-tertiary); }
        .uploaded-file-name { font-size: 0.88rem; }

        .hidden-file-input {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--border-radius-sm);
          padding: 0.75rem 1rem;
          color: var(--color-danger);
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .submit-btn-row { margin-top: 1rem; }
        .submit-btn { width: 100%; padding: 0.85rem; font-size: 1rem; }

        /* Sidebar guide card */
        .info-sidebar-panel {
          position: sticky;
          top: 90px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .guide-card {
          padding: 2rem;
          border-radius: var(--border-radius-md);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          box-shadow: var(--shadow-md);
        }

        .guide-icon { color: var(--accent-primary); }
        .guide-card h3 { font-size: 1.15rem; font-weight: 800; }

        .guide-list {
          padding-left: 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
        }

        .guide-list li {
          font-size: 0.83rem;
          line-height: 1.6;
          color: var(--fg-secondary);
        }

        /* Live Preview Card */
        .preview-card {
          border-radius: var(--border-radius-md);
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }

        .preview-label {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--accent-primary);
          padding: 0.75rem 1rem 0;
        }

        .preview-banner-thumb {
          width: 100%;
          height: 130px;
          overflow: hidden;
        }

        .preview-banner-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
        }

        .preview-logo {
          width: 42px;
          height: 42px;
          object-fit: contain;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--glass-border);
          background: var(--bg-secondary);
          flex-shrink: 0;
        }

        .preview-title {
          font-size: 0.9rem;
          font-weight: 750;
          color: var(--fg-primary);
          line-height: 1.3;
        }
        .preview-meta {
          font-size: 0.75rem;
          color: var(--fg-tertiary);
        }

        /* FOOTER */
        .footer-layout {
          margin-top: 4rem;
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
          .hosting-grid { grid-template-columns: 1fr; gap: 2rem; }
          .info-sidebar-panel { position: static; }
        }

        @media (max-width: 640px) {
          .form-row { grid-template-columns: 1fr; gap: 0; }
          .form-card-wrapper { padding: 1.5rem; }
          .logo-upload-row { flex-direction: column; }
          .footer-container { flex-direction: column; gap: 1.5rem; text-align: center; }
          .footer-links { justify-content: center; }
        }
      `}</style>
    </>
  );
}
