import React, { useState } from "react";
import { Star, X, Send } from "lucide-react";
import t from "../../styles/CustomerTickets.module.css";
import apiClient from "../../utils/apiClient";

export default function ReviewVendorModal({ isOpen, onClose, vendorId, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ratingLabels = {
    1: "Terrible",
    2: "Poor",
    3: "Average",
    4: "Good",
    5: "Excellent"
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post(`/vendors/${vendorId}/ratings`, {
        rating,
        comment,
      });
      onSuccess();
      onClose();
      // Reset state for next open
      setRating(5);
      setComment("");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit rating.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={t.backdrop} onClick={onClose}>
      <div className={t.modal} onClick={(e) => e.stopPropagation()}>
        <div className={t.modalHead}>
          <h2 className={t.modalTitle}>Rate Vendor</h2>
          <button className={t.modalClose} onClick={onClose}>
            <X size={17} />
          </button>
        </div>
        <div className={t.modalBody}>
          <div className={t.formGroup} style={{ textAlign: "center", marginBottom: 28 }}>
            <label style={{ 
              display: "inline-block",
              marginBottom: 16, 
              fontSize: 18, 
              fontWeight: 800, 
              color: "var(--text)",
              borderBottom: "2px solid var(--gold)",
              paddingBottom: 4,
              letterSpacing: "-0.02em"
            }}>
              Your Rating
            </label>
            <div 
              style={{ 
                display: "inline-flex", 
                flexDirection: "column",
                alignItems: "center",
                padding: "24px 32px",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                background: "#f9fafb",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
                width: "100%",
                boxSizing: "border-box"
              }}
              onMouseLeave={() => setHoverRating(0)}
            >
              <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 16 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      transform: (hoverRating || rating) === n ? "scale(1.15)" : "scale(1)",
                      transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
                    }}
                    aria-label={`Rate ${n} stars`}
                  >
                    <Star
                      size={40}
                      fill={(hoverRating || rating) >= n ? "var(--gold)" : "none"}
                      stroke={(hoverRating || rating) >= n ? "var(--gold)" : "#d1d5db"}
                      strokeWidth={1.5}
                      style={{ transition: "all 0.2s ease" }}
                    />
                  </button>
                ))}
              </div>
              <span style={{ 
                fontSize: 15, 
                fontWeight: 700, 
                color: "var(--gold)",
                minHeight: 22,
                transition: "all 0.2s"
              }}>
                {ratingLabels[hoverRating || rating]}
              </span>
            </div>
          </div>
          <div className={t.formGroup}>
            <label className={t.label} style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Comment (Optional)</label>
            <textarea
              className={t.textarea}
              style={{
                border: "1px solid #d1d5db",
                borderRadius: 12,
                padding: 16,
                fontSize: 14,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                resize: "none"
              }}
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was your experience with this vendor?"
            />
          </div>
          {error && (
            <p style={{ color: "#dc2626", fontSize: 13, marginTop: 8 }}>
              {error}
            </p>
          )}
        </div>
        <div className={t.modalFoot}>
          <button
            className={`${t.btn} ${t.btnOutline}`}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`${t.btn} ${t.btnPrimary}`}
            disabled={loading}
            onClick={handleSubmit}
          >
            <Send size={14} />{" "}
            {loading ? "Submitting..." : "Submit Rating"}
          </button>
        </div>
      </div>
    </div>
  );
}
