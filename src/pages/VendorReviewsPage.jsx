import { useState, useEffect } from "react";
import { Star, MessageSquare, X, Check, Filter, Package, Search, ChevronRight } from "lucide-react";
import VendorLayout from "../components/vendor/VendorLayout";
import p from "../styles/VendorPage.module.css";
import apiClient from "../utils/apiClient";

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
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("All");
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) fetchReviews(selectedProduct.id);
  }, [selectedProduct]);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get("/products/my/products", { params: { limit: 100 } });
      const list = res.data?.data || [];
      setProducts(list);
      if (list.length > 0) setSelectedProduct(list[0]);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const fetchReviews = async (productId) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/products/${productId}/reviews`);
      setReviews(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoading(false);
    }
  };

  const totalRating = reviews.length > 0 ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : 0;

  const filtered = reviews.filter(r => {
    if (filter === "5★") return r.rating === 5;
    if (filter === "4★") return r.rating === 4;
    if (filter === "3★ & below") return r.rating <= 3;
    return true;
  });

  const dist = [5,4,3,2,1].map(r => ({ stars: r, count: reviews.filter(v => v.rating === r).length }));

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <VendorLayout pageTitle="Reviews & Ratings" pageSubtitle="Manage customer feedback by product." breadcrumb="Reviews">
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, alignItems: "start" }}>
        
        {/* Left: Product Picker */}
        <aside className={p.tableCard} style={{ padding: "16px 0" }}>
          <div style={{ padding: "0 16px 16px" }}>
            <h3 className={p.label} style={{ marginBottom: 12 }}>Select Product</h3>
            <div className={p.searchBox}>
              <Search size={14} className={p.searchIcon} />
              <input className={p.searchInput} placeholder="Filter products..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
            {filteredProducts.map(prod => (
              <button
                key={prod.id}
                className={`${p.productItem} ${selectedProduct?.id === prod.id ? p.active : ""}`}
                onClick={() => setSelectedProduct(prod)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                  border: "none", background: selectedProduct?.id === prod.id ? "var(--vdr-accent-light)" : "transparent",
                  textAlign: "left", cursor: "pointer", transition: "all 0.2s"
                }}
              >
                <div className={p.productThumb} style={{ width: 36, height: 36, borderRadius: 6 }}>
                  {prod.images?.[0] ? <img src={prod.images[0].s3Url} alt="" /> : <Package size={14} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{prod.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--vdr-text-muted)" }}>{prod.category?.name}</p>
                </div>
                <ChevronRight size={14} style={{ opacity: selectedProduct?.id === prod.id ? 1 : 0.3 }} />
              </button>
            ))}
          </div>
        </aside>

        {/* Right: Reviews List */}
        <main style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {!selectedProduct ? (
            <div className={p.emptyState}><Package size={32} /><h3>No product selected</h3></div>
          ) : (
            <>
              {/* Summary Header */}
              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 18 }}>
                <div className={p.chartCard} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 8 }}>
                  <span style={{ fontSize: 52, fontWeight: 900, color: "var(--vdr-accent)", lineHeight: 1 }}>{totalRating.toFixed(1)}</span>
                  <StarRow rating={Math.round(totalRating)} size={20} />
                  <p style={{ margin: 0, fontSize: 13, color: "var(--vdr-text-muted)" }}>{reviews.length} total reviews</p>
                </div>
                <div className={p.chartCard} style={{ padding: 20 }}>
                  <h3 className={p.chartTitle} style={{ marginBottom: 12 }}>Rating Distribution</h3>
                  {dist.map(d => (
                    <div key={d.stars} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", width: 30 }}>{d.stars} ★</span>
                      <div style={{ flex: 1, height: 6, background: "var(--vdr-border)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${reviews.length > 0 ? (d.count / reviews.length) * 100 : 0}%`, background: "var(--vdr-accent)", borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, color: "var(--vdr-text-muted)", width: 24, textAlign: "right" }}>{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Filter size={14} style={{ color: "var(--vdr-text-subtle)" }} />
                <div className={p.filterChips}>
                  {FILTERS.map(f => (
                    <button key={f} className={`${p.filterTab} ${filter === f ? p.active : ""}`} onClick={() => setFilter(f)}>{f}</button>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {loading ? (
                  <div className={p.skeleton} style={{ height: 300 }}></div>
                ) : filtered.length === 0 ? (
                  <div className={p.emptyState} style={{ background: "white", borderRadius: 16 }}><Star size={22} /><h3 className={p.emptyTitle}>No reviews found</h3></div>
                ) : (
                  filtered.map(r => (
                    <div key={r.id} className={p.reviewCard}>
                      <div className={p.reviewHeader}>
                        <div className={p.avatar} style={{ width: 40, height: 40, fontSize: 14 }}>
                          {r.customer?.firstName?.[0] || "V"}
                        </div>
                        <div className={p.reviewMeta}>
                          <span className={p.reviewName}>
                            {r.customer?.firstName
                              ? `${r.customer.firstName} ${r.customer.lastName || ""}`.trim()
                              : "Verified Buyer"}
                          </span>
                          <span className={p.reviewDate}>{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        <StarRow rating={r.rating} />
                      </div>
                      <p className={p.reviewComment}>{r.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </VendorLayout>
  );
}
