"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onCancel}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "440px",
          borderRadius: "18px",
          padding: "1.75rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
          border: "1px solid var(--glass-border)",
          backgroundColor: "var(--bg-secondary)",
          color: "var(--fg-primary)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            background: "none",
            border: "none",
            color: "var(--fg-tertiary)",
            cursor: "pointer",
            padding: "0.25rem",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
          <div
            style={{
              padding: "0.75rem",
              borderRadius: "12px",
              backgroundColor:
                variant === "danger"
                  ? "rgba(239, 68, 68, 0.15)"
                  : "rgba(245, 158, 11, 0.15)",
              color: variant === "danger" ? "#ef4444" : "#f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 0.35rem 0" }}>{title}</h3>
            <p style={{ fontSize: "0.95rem", color: "var(--fg-secondary)", margin: 0, lineHeight: 1.5 }}>
              {message}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.75rem" }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "10px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "10px",
              fontWeight: 600,
              backgroundColor: variant === "danger" ? "#ef4444" : "var(--accent-primary)",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              boxShadow: variant === "danger" ? "0 4px 12px rgba(239, 68, 68, 0.3)" : "var(--shadow-glow)",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
