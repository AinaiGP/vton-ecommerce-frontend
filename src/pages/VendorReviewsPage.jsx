import { useState, useEffect } from "react";
import { Star, MessageSquare, X, Check, Filter } from "lucide-react";
import VendorLayout from "../components/vendor/VendorLayout";
import p from "../styles/VendorPage.module.css";

function StarRow({ rating, size = 15 }) {
  return (
    <div className={p.stars}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= rating ? p.starFull : p.starEmpty} style={{ fontSize: size }}>★</span>
      ))}
    </div>
  );
}

const FILTERS = ["All", "5★", "4★", "3★ & below"];

export default function VendorReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("All");
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    // TODO: wire to real API endpoint — Phase X
  }, []);

  const totalRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const filtered = reviews.filter(r => {
    if (filter === "5★") return r.rating === 5;
    if (filter === "4★") return r.rating === 4;
    if (filter === "3★ & below") return r.rating <= 3;
    return true;
  });

  const sendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReviews(reviews.map(r => r.id === replyTarget.id ? { ...r, reply: replyText.trim() } : r));
    setReplyTarget(null);
    setReplyText("");
  };

  // Rating distribution
  const dist = [5,4,3,2,1].map(r => ({ stars: r, count: reviews.filter(v => v.rating === r).length }));

  return (
    <VendorLayout pageTitle="Reviews & Ratings" pageSubtitle="Customer feedback for your store products." breadcrumb="Reviews">

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 18 }}>
        <div className={p.chartCard} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 20px", gap: 8 }}>
          <span style={{ fontSize: 52, fontWeight: 900, color: "var(--vdr-accent)", letterSpacing: "-0.03em", lineHeight: 1 }}>{totalRating.toFixed(1)}</span>
          <StarRow rating={Math.round(totalRating)} size={22} />
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--vdr-text-muted)" }}>{reviews.length} reviews</p>
        </div>
        <div className={p.chartCard} style={{ padding: "20px 24px" }}>
          <h3 className={p.chartTitle} style={{ marginBottom: 16 }}>Rating Breakdown</h3>
          {dist.map(d => (
            <div key={d.stars} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", width: 24, flexShrink: 0 }}>{"★".repeat(d.stars)}</span>
              <div style={{ flex: 1, height: 8, background: "var(--vdr-border)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${reviews.length > 0 ? (d.count / reviews.length) * 100 : 0}%`, background: "linear-gradient(90deg, var(--vdr-accent), #a78bfa)", borderRadius: 4, transition: "width 0.6s ease" }} />
              </div>
              <span style={{ fontSize: 12, color: "var(--vdr-text-muted)", width: 20, textAlign: "right", flexShrink: 0 }}>{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Filter size={14} style={{ color: "var(--vdr-text-subtle)" }} />
        <div className={p.filterTabs}>
          {FILTERS.map(f => (
            <button key={f} className={`${p.filterTab} ${filter === f ? p.active : ""}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      {/* Review cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.length === 0 ? (
          <div className={p.chartCard}>
            <div className={p.emptyState}>
              <div className={p.emptyIcon}><Star size={22} /></div>
              <h3 className={p.emptyTitle}>No reviews here</h3>
              <p className={p.emptyText}>No reviews match the selected filter.</p>
            </div>
          </div>
        ) : filtered.map(r => (
          <div key={r.id} className={p.reviewCard}>
            <div className={p.reviewHeader}>
              <div className={p.avatar} style={{ width: 40, height: 40, fontSize: 14 }}>{r.initials}</div>
              <div className={p.reviewMeta}>
                <span className={p.reviewName}>{r.name}</span>
                <span className={p.reviewProduct}>{r.product}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <StarRow rating={r.rating} />
                <span className={p.reviewDate}>{r.date}</span>
              </div>
            </div>
            <p className={p.reviewComment}>{r.comment}</p>
            {r.reply ? (
              <div className={p.reviewReply}>
                <span className={p.reviewReplyLabel}>My Reply</span>
                <p className={p.reviewReplyText}>{r.reply}</p>
              </div>
            ) : (
              <button
                className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}
                onClick={() => { setReplyTarget(r); setReplyText(""); }}
                style={{ alignSelf: "flex-start" }}
              >
                <MessageSquare size={13} /> Reply
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      {replyTarget && (
        <div className={p.modalBackdrop} onClick={() => setReplyTarget(null)}>
          <div className={p.modal} onClick={e => e.stopPropagation()}>
            <div className={p.modalHead}>
              <h2 className={p.modalTitle}>Reply to {replyTarget.name}</h2>
              <button className={p.modalClose} onClick={() => setReplyTarget(null)}><X size={17} /></button>
            </div>
            <div className={p.modalBody}>
              <div className={p.reviewCard} style={{ background: "var(--vdr-bg)" }}>
                <div className={p.reviewHeader}>
                  <div className={p.avatar}>{replyTarget.initials}</div>
                  <div className={p.reviewMeta}>
                    <span className={p.reviewName}>{replyTarget.name}</span>
                    <span className={p.reviewProduct}>{replyTarget.product}</span>
                  </div>
                  <StarRow rating={replyTarget.rating} />
                </div>
                <p className={p.reviewComment}>{replyTarget.comment}</p>
              </div>
              <form id="replyForm" onSubmit={sendReply}>
                <div className={p.formGroup}>
                  <label className={p.label}>Your Reply</label>
                  <textarea
                    className={p.textarea}
                    rows={4}
                    placeholder="Write a thoughtful reply..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    required
                  />
                </div>
              </form>
            </div>
            <div className={p.modalFoot}>
              <button className={`${p.btn} ${p.btnOutline}`} onClick={() => setReplyTarget(null)}>Cancel</button>
              <button type="submit" form="replyForm" className={`${p.btn} ${p.btnPrimary}`}><Check size={14} /> Post Reply</button>
            </div>
          </div>
        </div>
      )}
    </VendorLayout>
  );
}
