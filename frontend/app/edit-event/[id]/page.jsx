"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "../../../context/AppContext";
import { fetchEventById } from "../../../services/eventService";
import Navbar from "../../../components/Navbar";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Upload,
  X,
  ImagePlus,
  Image,
  BookOpen,
  ShieldCheck,
  AlertCircle,
  Tv,
  Info,
  Save,
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  const cleanBackend = BACKEND_URL.endsWith("/") ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
  return `${cleanBackend}${cleanUrl}`;
}

export default function EditEventPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, updateEvent, showToast } = useApp();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [event, setEvent] = useState(null);

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
    rules: "",
  });

  // File states
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const bannerInputRef = useRef(null);
  const logoInputRef = useRef(null);

  // Load event data
  useEffect(() => {
    if (!id) return;
    const loadEvent = async () => {
      setLoading(true);
      try {
        const data = await fetchEventById(id);
        setEvent(data);

        // Check ownership
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        setFormData({
          title: data.title || "",
          category: data.category || "Technology",
          description: data.description || "",
          date: data.date || "",
          time: data.time || "",
          isOnline: data.isOnline || false,
          location: data.location || "",
          mapLink: data.mapLink || "",
          locationDescription: data.locationDescription || "",
          price: data.price || 0,
          isPaid: (data.price || 0) > 0,
          limit: data.limit === "unlimited" || !data.limit ? "unlimited" : "limited",
          limitCount: data.limit !== "unlimited" && data.limit ? Number(data.limit) : 50,
          rules: data.rules || "",
        });

        // Set existing images as previews
        if (data.image) setBannerPreview(resolveImageUrl(data.image));
        if (data.logo) setLogoPreview(resolveImageUrl(data.logo));
      } catch (err) {
        setError("Failed to load event: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Banner image must be under 10MB."); return; }
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Logo must be under 5MB."); return; }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (!formData.title.trim() || formData.title.length < 5) {
        throw new Error("Event title must be at least 5 characters long.");
      }

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
      fd.append("rules", formData.rules);

      // Attach new file uploads if selected
      if (bannerFile) {
        fd.append("banner", bannerFile);
      } else if (event?.image) {
        // Keep existing image URL for offline fallback
        fd.append("bannerPreview", resolveImageUrl(event.image));
      }

      if (logoFile) {
        fd.append("logo", logoFile);
      } else if (event?.logo) {
        fd.append("logoPreview", resolveImageUrl(event.logo));
      }

      const success = await updateEvent(id, fd);
      if (success) {
        showToast("Event updated successfully!", "success");
        router.push(`/event/${id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-center container">
          <div className="spinner"></div>
          <p>Loading event data...</p>
        </div>
        <style jsx>{`
          .page-center { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: calc(100vh - 120px); gap: 1rem; color: var(--fg-secondary); }
          .spinner { width: 36px; height: 36px; border: 3px solid var(--glass-border); border-top-color: var(--accent-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </>
    );
  }

  if (error && !event) {
    return (
      <>
        <Navbar />
        <div className="page-center container">
          <AlertCircle size={48} style={{ color: "var(--color-danger)" }} />
          <p style={{ color: "var(--color-danger)" }}>{error}</p>
          <button className="btn btn-outline" onClick={() => router.push("/")}>Back to Home</button>
        </div>
        <style jsx>{`
          .page-center { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: calc(100vh - 120px); gap: 1rem; }
        `}</style>
      </>
    );
  }

  // Check if user is the host
  if (user && event && user._id !== event.hostId && user._id !== event.hostId?.toString()) {
    return (
      <>
        <Navbar />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 120px)", gap: "1rem" }}>
          <AlertCircle size={48} style={{ color: "var(--color-danger)" }} />
          <p>You are not authorized to edit this event.</p>
          <button className="btn btn-outline" onClick={() => router.back()}>Go Back</button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="edit-event-page container animate-fade-in">

        <div className="breadcrumb-row">
          <button onClick={() => router.push(`/event/${id}`)} className="back-link">
            <ArrowLeft size={16} />
            Back to Event
          </button>
        </div>

        <div className="hosting-grid">
          <div className="form-card-wrapper glass-panel">
            <div className="form-header">
              <h1 className="page-title">Edit Event</h1>
              <p className="page-subtitle">Update the details for <strong>{event?.title}</strong></p>
            </div>

            {error && <div className="error-banner"><AlertCircle size={15} />{error}</div>}

            <form onSubmit={handleSubmit} className="event-creation-form">

              {/* Section 1: Basic Info */}
              <div className="form-section">
                <h3 className="section-title">1. Basic Information</h3>
                <div className="form-group">
                  <label className="form-label">Event Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-control" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="form-control select-input">
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
                </div>
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} className="form-control text-area" rows="4" required></textarea>
                </div>
              </div>

              {/* Section 2: Banner */}
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
                            setBannerPreview(event?.image ? resolveImageUrl(event.image) : "");
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
                          <span className="upload-limit">JPG, PNG, WebP — max 10MB</span>
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

              {/* Section 3: Logo */}
              <div className="form-section">
                <h3 className="section-title"><Image size={16} />3. Organizer / Event Logo <span className="optional-tag">Optional</span></h3>
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
                              setLogoPreview(event?.logo ? resolveImageUrl(event.logo) : "");
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
                    <p>Replace your logo image or leave unchanged. Square format recommended (256×256px).</p>
                  </div>
                </div>
              </div>

              {/* Section 4: Date */}
              <div className="form-section">
                <h3 className="section-title"><Calendar size={16} />4. Date & Duration</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Event Date *</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time / Duration *</label>
                    <input type="text" name="time" value={formData.time} onChange={handleChange} placeholder="02:00 PM - 05:00 PM" className="form-control" required />
                  </div>
                </div>
              </div>

              {/* Section 5: Format */}
              <div className="form-section">
                <h3 className="section-title"><MapPin size={16} />5. Format & Venue</h3>
                <div className="checkbox-group">
                  <input type="checkbox" name="isOnline" id="isOnline" checked={formData.isOnline} onChange={handleChange} className="custom-checkbox" />
                  <label htmlFor="isOnline" className="checkbox-label">Online virtual event (Zoom, Teams, etc.)</label>
                </div>
                {!formData.isOnline && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Venue Location Name *</label>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} className="form-control" required={!formData.isOnline} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Google Maps Pin URL</label>
                        <input type="url" name="mapLink" value={formData.mapLink} onChange={handleChange} className="form-control" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location Instructions</label>
                      <textarea name="locationDescription" value={formData.locationDescription} onChange={handleChange} className="form-control text-area" rows="2"></textarea>
                    </div>
                  </>
                )}
              </div>

              {/* Section 6: Capacity & Pricing */}
              <div className="form-section">
                <h3 className="section-title"><Users size={16} />6. Capacity & Pricing</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Seat Limit</label>
                    <div className="radio-group">
                      <label className="radio-label"><input type="radio" name="limit" value="unlimited" checked={formData.limit === "unlimited"} onChange={handleChange} />Unlimited</label>
                      <label className="radio-label"><input type="radio" name="limit" value="limited" checked={formData.limit === "limited"} onChange={handleChange} />Limited</label>
                    </div>
                  </div>
                  {formData.limit === "limited" && (
                    <div className="form-group">
                      <label className="form-label">Seat Count</label>
                      <input type="number" name="limitCount" value={formData.limitCount} onChange={handleChange} min="1" className="form-control" />
                    </div>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ticket Type</label>
                    <div className="radio-group">
                      <label className="radio-label"><input type="radio" checked={!formData.isPaid} onChange={() => setFormData(p => ({ ...p, isPaid: false, price: 0 }))} />Free Access</label>
                      <label className="radio-label"><input type="radio" checked={formData.isPaid} onChange={() => setFormData(p => ({ ...p, isPaid: true }))} />Paid Pass</label>
                    </div>
                  </div>
                  {formData.isPaid && (
                    <div className="form-group">
                      <label className="form-label">Ticket Price ($)</label>
                      <input type="number" name="price" value={formData.price} onChange={handleChange} min="1" className="form-control" />
                    </div>
                  )}
                </div>
              </div>

              {/* Section 7: Rules */}
              <div className="form-section rules-section">
                <h3 className="section-title"><BookOpen size={16} />7. Event Rules & Code of Conduct <span className="optional-tag">Optional</span></h3>
                <p className="section-instruction-text">Update rules, dress code, ID requirements, or any policies for attendees.</p>
                <textarea
                  name="rules"
                  value={formData.rules}
                  onChange={handleChange}
                  placeholder="• All attendees must carry a valid student ID.&#10;• Dress code: Smart casual.&#10;• No photography without permission."
                  className="form-control rules-textarea"
                  rows="7"
                ></textarea>
                <div className="char-count">{formData.rules.length} characters</div>
              </div>

              <div className="submit-btn-row">
                <button type="button" className="btn btn-secondary" onClick={() => router.push(`/event/${id}`)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary submit-btn" disabled={saving}>
                  <Save size={16} />
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>

            </form>
          </div>

          {/* Info sidebar */}
          <div className="info-sidebar-panel">
            <div className="guide-card glass-panel">
              <Info size={24} className="guide-icon" />
              <h3>Edit Guidelines</h3>
              <ul className="guide-list">
                <li>Only the event host can edit this event.</li>
                <li>Changes will be visible to all registered attendees immediately.</li>
                <li>If you change the date or venue, notify your attendees via the support chat.</li>
                <li>Uploading a new banner will replace the existing one.</li>
                <li>You cannot reduce the seat limit below the current registration count.</li>
              </ul>
            </div>

            {/* Live preview */}
            {(bannerPreview || logoPreview || formData.title) && (
              <div className="preview-card glass-panel">
                <p className="preview-label">Live Preview</p>
                {bannerPreview && (
                  <div className="preview-banner-thumb">
                    <img src={bannerPreview} alt="Banner" />
                  </div>
                )}
                <div className="preview-info">
                  {logoPreview && <img src={logoPreview} alt="Logo" className="preview-logo" />}
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

      <style jsx>{`
        .edit-event-page { padding-top: 2rem; padding-bottom: 4rem; }
        .breadcrumb-row { margin-bottom: 1.5rem; }
        .back-link { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 600; color: var(--fg-secondary); transition: var(--transition-fast); }
        .back-link:hover { color: var(--accent-primary); }

        .hosting-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2.5rem; align-items: start; }

        .form-card-wrapper { padding: 2.5rem; border-radius: var(--border-radius-lg); box-shadow: var(--shadow-lg); }
        .form-header { margin-bottom: 2rem; }
        .page-title { font-size: 2rem; font-weight: 850; letter-spacing: -0.03em; margin-bottom: 0.25rem; }
        .page-subtitle { font-size: 0.95rem; color: var(--fg-secondary); }

        .event-creation-form { display: flex; flex-direction: column; gap: 1.5rem; }

        .form-section { padding: 1.5rem; background: rgba(99, 102, 241, 0.015); border: 1px solid var(--glass-border); border-radius: var(--border-radius-md); display: flex; flex-direction: column; gap: 1.25rem; }
        .section-title { font-size: 1rem; font-weight: 800; color: var(--accent-primary); border-bottom: 1px dashed var(--glass-border); padding-bottom: 0.65rem; display: flex; align-items: center; gap: 0.5rem; }
        .optional-tag { font-size: 0.7rem; font-weight: 600; color: var(--fg-tertiary); background: var(--bg-secondary); padding: 0.15rem 0.5rem; border-radius: var(--border-radius-full); margin-left: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .section-instruction-text { font-size: 0.82rem; color: var(--fg-tertiary); margin-top: -0.5rem; }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .text-area { resize: vertical; }
        .form-control { width: 100%; }

        .checkbox-group { display: flex; align-items: center; gap: 0.65rem; }
        .custom-checkbox { width: 17px; height: 17px; accent-color: var(--accent-primary); cursor: pointer; }
        .checkbox-label { font-size: 0.85rem; font-weight: 600; color: var(--fg-secondary); cursor: pointer; }

        .radio-group { display: flex; gap: 1.5rem; padding: 0.5rem 0; }
        .radio-label { display: flex; align-items: center; gap: 0.45rem; font-size: 0.88rem; font-weight: 600; color: var(--fg-secondary); cursor: pointer; }
        .radio-label input { accent-color: var(--accent-primary); }

        /* Banner upload */
        .image-upload-zone { border: 2px dashed var(--glass-border); background: var(--bg-secondary); border-radius: var(--border-radius-md); padding: 2.5rem 1.75rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; cursor: pointer; position: relative; text-align: center; transition: var(--transition-smooth); overflow: hidden; min-height: 160px; justify-content: center; }
        .image-upload-zone:hover { border-color: var(--accent-primary); }

        .preview-wrapper { width: 100%; height: 100%; position: relative; }
        .banner-preview-img { width: 100%; height: 220px; object-fit: cover; border-radius: var(--border-radius-md); display: block; }
        .preview-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.45); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; color: white; font-size: 0.85rem; font-weight: 600; opacity: 0; transition: opacity 0.2s; border-radius: var(--border-radius-md); }
        .image-upload-zone:hover .preview-overlay { opacity: 1; }
        .remove-preview-btn { position: absolute; top: 8px; right: 8px; background: rgba(239,68,68,0.85); color: white; border: none; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; }
        .remove-preview-btn.small { width: 20px; height: 20px; top: 4px; right: 4px; }
        .upload-cta { font-size: 0.9rem; font-weight: 700; color: var(--fg-primary); }

        /* Logo upload */
        .logo-upload-row { display: flex; gap: 1.5rem; align-items: flex-start; }
        .logo-upload-zone { width: 120px; height: 120px; border: 2px dashed var(--glass-border); border-radius: var(--border-radius-md); background: var(--bg-secondary); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.4rem; cursor: pointer; flex-shrink: 0; position: relative; overflow: hidden; transition: var(--transition-smooth); text-align: center; padding: 0.5rem; }
        .logo-upload-zone:hover { border-color: var(--accent-primary); }
        .logo-preview-inner { width: 100%; height: 100%; position: relative; }
        .logo-preview-inner:hover .logo-preview-overlay { opacity: 1 !important; }
        .logo-preview-img { width: 100%; height: 100%; object-fit: contain; border-radius: var(--border-radius-sm); }
        .logo-upload-text { font-size: 0.75rem; font-weight: 700; color: var(--fg-secondary); }
        .logo-upload-hint { flex: 1; font-size: 0.82rem; color: var(--fg-tertiary); line-height: 1.6; padding-top: 0.25rem; }

        /* Rules */
        .rules-section { border-color: rgba(99,102,241,0.2); background: rgba(99,102,241,0.02); }
        .rules-textarea { resize: vertical; min-height: 180px; font-size: 0.88rem; line-height: 1.7; font-family: inherit; }
        .char-count { text-align: right; font-size: 0.75rem; color: var(--fg-tertiary); margin-top: -0.5rem; }

        .upload-icon { color: var(--fg-tertiary); transition: var(--transition-fast); }
        .image-upload-zone:hover .upload-icon, .logo-upload-zone:hover .upload-icon { color: var(--accent-primary); }
        .upload-meta { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.85rem; font-weight: 600; color: var(--fg-secondary); }
        .upload-limit { font-size: 0.72rem; color: var(--fg-tertiary); }
        .hidden-file-input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }

        .error-banner { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: var(--border-radius-sm); padding: 0.75rem 1rem; color: var(--color-danger); font-size: 0.85rem; font-weight: 600; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }

        .submit-btn-row { margin-top: 1rem; display: flex; gap: 1rem; }
        .submit-btn { flex: 1; padding: 0.85rem; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }

        /* Sidebar */
        .info-sidebar-panel { position: sticky; top: 90px; display: flex; flex-direction: column; gap: 1.5rem; }
        .guide-card { padding: 2rem; border-radius: var(--border-radius-md); display: flex; flex-direction: column; gap: 1.25rem; box-shadow: var(--shadow-md); }
        .guide-icon { color: var(--accent-primary); }
        .guide-card h3 { font-size: 1.15rem; font-weight: 800; }
        .guide-list { padding-left: 1.15rem; display: flex; flex-direction: column; gap: 1.15rem; }
        .guide-list li { font-size: 0.83rem; line-height: 1.6; color: var(--fg-secondary); }

        .preview-card { border-radius: var(--border-radius-md); overflow: hidden; box-shadow: var(--shadow-md); }
        .preview-label { font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-primary); padding: 0.75rem 1rem 0; }
        .preview-banner-thumb { width: 100%; height: 130px; overflow: hidden; }
        .preview-banner-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .preview-info { display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem; }
        .preview-logo { width: 42px; height: 42px; object-fit: contain; border-radius: var(--border-radius-sm); border: 1px solid var(--glass-border); background: var(--bg-secondary); flex-shrink: 0; }
        .preview-title { font-size: 0.9rem; font-weight: 750; color: var(--fg-primary); line-height: 1.3; }
        .preview-meta { font-size: 0.75rem; color: var(--fg-tertiary); }

        @media (max-width: 968px) {
          .hosting-grid { grid-template-columns: 1fr; gap: 2rem; }
          .info-sidebar-panel { position: static; }
        }
        @media (max-width: 640px) {
          .form-row { grid-template-columns: 1fr; }
          .form-card-wrapper { padding: 1.5rem; }
          .logo-upload-row { flex-direction: column; }
          .submit-btn-row { flex-direction: column; }
        }
      `}</style>
    </>
  );
}
