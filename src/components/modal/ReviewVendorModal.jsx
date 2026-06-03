import React, { useState } from "react";
import { Star, X, Send } from "lucide-react";
import t from "../../styles/CustomerTickets.module.css";
import apiClient from "../../utils/apiClient";

export default function ReviewVendorModal({ isOpen, onClose, vendorId, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
          <div className={t.formGroup} style={{ textAlign: "center", marginBottom: 24 }}>
            <label className={t.label} style={{ marginBottom: 12 }}>Rating</label>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  aria-label={`Rate ${n} stars`}
                >
                  <Star
                    size={32}
                    fill={rating >= n ? "var(--gold)" : "none"}
                    stroke={rating >= n ? "var(--gold)" : "#ccc"}
                    style={{ transition: "all 0.2s" }}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className={t.formGroup}>
            <label className={t.label}>Comment (Optional)</label>
            <textarea
              className={t.textarea}
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
