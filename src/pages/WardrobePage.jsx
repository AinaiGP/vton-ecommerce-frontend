import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  X,
  Plus,
  Trash2,
  Check,
  Sparkles,
  ChevronRight,
  Grid,
  Heart,
  Shirt,
  Package,
  Footprints,
  Watch,
  LayoutGrid,
  Save,
  Eye,
  Shuffle,
  Star,
  Loader2,
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import apiClient, { multipartClient } from "../utils/apiClient";
import styles from "../styles/WardrobePage.module.css";

/* ─── Data ─────────────────────────────────────────── */
const CATEGORIES = [
  { id: "all", label: "All Items", icon: <LayoutGrid size={16} /> },
  { id: "tops", label: "Tops", icon: <Shirt size={16} /> },
  { id: "bottoms", label: "Bottoms", icon: <Package size={16} /> },
  { id: "dresses", label: "Dresses", icon: <Heart size={16} /> },
  { id: "shoes", label: "Shoes", icon: <Footprints size={16} /> },
  { id: "accessories", label: "Accessories", icon: <Watch size={16} /> },
];

/* ─── Component ─────────────────────────────────────── */
export default function WardrobePage() {
  const [tab, setTab] = useState("wardrobe"); // wardrobe | builder | outfits | ai
  const [activeCategory, setActiveCategory] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [outfits, setOutfits] = useState([]);
  const [aiRecs, setAiRecs] = useState([]);
  const [selectedForOutfit, setSelectedForOutfit] = useState([]);
  const [outfitName, setOutfitName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState(null);
  const [wishlistedRecs, setWishlistedRecs] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchWardrobe();
  }, []);

  const fetchWardrobe = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/customers/wardrobe");
      // res.data is { data: WardrobeItem[], total: number, ... }
      setItems(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch wardrobe", err);
    } finally {
      setLoading(false);
    }
  };

  /* helpers */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredItems = items; // Backend doesn't support category filtering yet, and we don't have categories in the DB for wardrobe

  /* ── Upload ── */
  const handleFiles = useCallback(async (files) => {
    if (files.length === 0) return;
    setUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const formData = new FormData();
        formData.append("photo", file);
        formData.append("label", file.name.replace(/\.[^.]+$/, ""));
        
        await multipartClient.post("/customers/wardrobe", formData);
      }
      showToast(`${files.length} item(s) added to wardrobe!`);
      fetchWardrobe();
    } catch (err) {
      showToast("Failed to upload some items.", "error");
    } finally {
      setUploading(false);
    }
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  /* ── Delete item ── */
  const deleteItem = async (id) => {
    if (!window.confirm("Remove this item from your wardrobe?")) return;
    try {
      await apiClient.delete(`/customers/wardrobe/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setSelectedForOutfit((prev) => prev.filter((sid) => sid !== id));
      showToast("Item removed.", "info");
    } catch (err) {
      showToast("Failed to remove item.", "error");
    }
  };

  /* ── Outfit builder ── */
  const toggleOutfitItem = (id) => {
    setSelectedForOutfit((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const saveOutfit = () => {
    if (selectedForOutfit.length === 0) {
      showToast("Select at least one item.", "error");
      return;
    }
    const name = outfitName.trim() || `Outfit ${outfits.length + 1}`;
    const coverItem = items.find((i) => i.id === selectedForOutfit[0]);
    
    // Outfits are client-side only in this version (no backend support mentioned)
    setOutfits((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        items: [...selectedForOutfit],
        cover: coverItem?.imageUrl || "",
      },
    ]);
    setSelectedForOutfit([]);
    setOutfitName("");
    showToast(`"${name}" saved to your session!`);
    setTab("outfits");
  };

  /* ── Delete outfit ── */
  const deleteOutfit = (id) => {
    setOutfits((prev) => prev.filter((o) => o.id !== id));
    showToast("Outfit removed.", "info");
  };

  /* ── Wishlist rec ── */
  const toggleWishlistRec = (id) => {
    setWishlistedRecs((prev) => ({ ...prev, [id]: !prev[id] }));
    showToast(
      wishlistedRecs[id] ? "Removed from wishlist." : "Added to wishlist!",
    );
  };

  /* ─── RENDER ─── */
  return (
    <div className={styles.page}>
      <Header />

      {/* ── Toast ── */}
      {toast && (
        <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}>
          {toast.type === "success" && <Check size={15} />}
          {toast.type === "error" && <X size={15} />}
          {toast.msg}
        </div>
      )}

      <main className={styles.main}>
        {/* ── Page Header ── */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>
              <span className={styles.pageTitleIcon}>
                <Grid size={28} />
              </span>
              My Wardrobe
            </h1>
            <p className={styles.pageSubtitle}>
              Organize, style & discover your personal fashion universe
            </p>
          </div>
          <button
            className={styles.uploadCta}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 size={16} className={styles.spin} /> : <Upload size={16} />} 
            {uploading ? "Uploading…" : "Upload Clothes"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* ── Tab Nav ── */}
        <div className={styles.tabs}>
          {[
            { id: "wardrobe", label: "My Clothes", icon: <Shirt size={16} /> },
            {
              id: "builder",
              label: "Outfit Builder",
              icon: <Shuffle size={16} />,
            },
            {
              id: "outfits",
              label: `Saved Outfits (${outfits.length})`,
              icon: <Save size={16} />,
            },
            { id: "ai", label: "AI Style Picks", icon: <Sparkles size={16} /> },
          ].map((t) => (
            <button
              key={t.id}
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════
            TAB: MY WARDROBE
        ═══════════════════════════════════ */}
        {tab === "wardrobe" && (
          <div className={styles.tabContent}>
            {/* Drop zone */}
            <div
              className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 size={32} className={`${styles.dropIcon} ${styles.spin}`} />
              ) : (
                <Upload size={32} className={styles.dropIcon} />
              )}
              <p className={styles.dropText}>
                {uploading ? "Processing your clothes…" : "Drag & drop your clothes here, or click to browse"}
              </p>
              <p className={styles.dropHint}>
                PNG, JPG, WEBP • Multiple files supported
              </p>
            </div>

            {/* Wardrobe Grid */}
            {loading ? (
              <div className={styles.empty}>
                <Loader2 size={48} className={styles.spin} style={{ color: 'var(--charcoal-muted)' }} />
                <p>Loading wardrobe…</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className={styles.empty}>
                <Shirt size={56} strokeWidth={1} className={styles.emptyIcon} />
                <h3>Your wardrobe is empty</h3>
                <p>
                  Upload photos of your clothes to start building your virtual wardrobe.
                </p>
              </div>
            ) : (
              <div className={styles.wardrobeGrid}>
                {filteredItems.map((item) => (
                  <div key={item.id} className={styles.wardrobeCard}>
                    <div className={styles.cardImageWrap}>
                      <img
                        src={item.imageUrl}
                        alt={item.label}
                        className={styles.cardImage}
                      />
                      <div className={styles.cardOverlay}>
                        <button
                          className={`${styles.overlayBtn} ${styles.overlayBtnDanger}`}
                          title="Delete"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                        <Link
                          to="/ai-try-on"
                          className={`${styles.overlayBtn} ${styles.overlayBtnTryOn}`}
                          title="Try on"
                        >
                          <Eye size={14} />
                        </Link>
                      </div>
                    </div>
                    <div className={styles.cardInfo}>
                      <p className={styles.cardName}>{item.label || "Untitled Item"}</p>
                    </div>
                  </div>
                ))}

                {/* Add item card */}
                <div
                  className={styles.addCard}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                >
                  {uploading ? <Loader2 size={32} className={styles.spin} /> : <Plus size={32} />}
                  <span>{uploading ? "Uploading…" : "Add Item"}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════
            TAB: OUTFIT BUILDER
        ═══════════════════════════════════ */}
        {tab === "builder" && (
          <div className={styles.tabContent}>
            <div className={styles.builderLayout}>
              {/* Left: item selector */}
              <div className={styles.builderSelector}>
                <h2 className={styles.builderSectionTitle}>
                  <Shirt size={18} /> Select Items
                </h2>
                <p className={styles.builderHint}>
                  Tap items to add them to your outfit. Selected items appear in
                  the canvas.
                </p>

                <div className={styles.builderGrid}>
                  {items.map((item) => {
                    const selected = selectedForOutfit.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`${styles.builderItem} ${selected ? styles.builderItemSelected : ""}`}
                        onClick={() => toggleOutfitItem(item.id)}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.label}
                          className={styles.builderItemImg}
                        />
                        {selected && (
                          <div className={styles.builderItemCheck}>
                            <Check size={16} />
                          </div>
                        )}
                        <p className={styles.builderItemName}>{item.label || "Untitled"}</p>
                      </div>
                    );
                  })}
                  {items.length === 0 && (
                    <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: 'var(--charcoal-muted)', fontSize: 14 }}>
                      Your wardrobe is empty.
                    </p>
                  )}
                </div>
              </div>

              {/* Right: canvas */}
              <div className={styles.builderCanvas}>
                <h2 className={styles.builderSectionTitle}>
                  <LayoutGrid size={18} /> Outfit Canvas
                </h2>

                {selectedForOutfit.length === 0 ? (
                  <div className={styles.canvasEmpty}>
                    <Shuffle size={48} strokeWidth={1} />
                    <p>
                      Select clothes on the left to start building your outfit
                    </p>
                  </div>
                ) : (
                  <div className={styles.canvasGrid}>
                    {selectedForOutfit.map((sid) => {
                      const item = items.find((i) => i.id === sid);
                      if (!item) return null;
                      return (
                        <div key={sid} className={styles.canvasItem}>
                          <button
                            className={styles.canvasRemoveBtn}
                            onClick={() => toggleOutfitItem(sid)}
                          >
                            <X size={12} />
                          </button>
                          <img
                            src={item.imageUrl}
                            alt={item.label}
                            className={styles.canvasItemImg}
                          />
                          <p className={styles.canvasItemName}>{item.label}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className={styles.saveOutfitRow}>
                  <input
                    className={styles.outfitNameInput}
                    placeholder="Name your outfit…"
                    value={outfitName}
                    onChange={(e) => setOutfitName(e.target.value)}
                  />
                  <button
                    className={styles.saveOutfitBtn}
                    onClick={saveOutfit}
                    disabled={selectedForOutfit.length === 0}
                  >
                    <Save size={16} /> Save Outfit
                  </button>
                </div>

                <div className={styles.tryOnBanner}>
                  <Sparkles size={16} />
                  <span>Ready to see how it looks?</span>
                  <Link to="/ai-try-on" className={styles.tryOnLink}>
                    Virtual Try-On <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════
            TAB: SAVED OUTFITS
        ═══════════════════════════════════ */}
        {tab === "outfits" && (
          <div className={styles.tabContent}>
            <div className={styles.outfitsHeader}>
              <h2 className={styles.sectionHeading}>
                <Save size={20} /> Saved Outfits
              </h2>
              <button
                className={styles.newOutfitBtn}
                onClick={() => setTab("builder")}
              >
                <Plus size={15} /> Create New Outfit
              </button>
            </div>

            {outfits.length === 0 ? (
              <div className={styles.empty}>
                <Save size={56} strokeWidth={1} className={styles.emptyIcon} />
                <h3>No saved outfits yet</h3>
                <p>
                  Head to the Outfit Builder to create and save your first look.
                </p>
                <button
                  className={styles.emptyCta}
                  onClick={() => setTab("builder")}
                >
                  Open Builder
                </button>
              </div>
            ) : (
              <div className={styles.outfitsGrid}>
                {outfits.map((outfit) => {
                  const outfitItems = outfit.items
                    .map((id) => items.find((i) => i.id === id))
                    .filter(Boolean);
                  return (
                    <div key={outfit.id} className={styles.outfitCard}>
                      <div className={styles.outfitCover}>
                        <img
                          src={outfit.cover}
                          alt={outfit.name}
                          className={styles.outfitCoverImg}
                        />
                        <div className={styles.outfitItemPreviews}>
                          {outfitItems.slice(0, 3).map((item) => (
                            <img
                              key={item.id}
                              src={item.imageUrl}
                              alt={item.label}
                              className={styles.outfitPreviewThumb}
                            />
                          ))}
                          {outfitItems.length > 3 && (
                            <span className={styles.outfitMoreBadge}>
                              +{outfitItems.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={styles.outfitInfo}>
                        <h3 className={styles.outfitName}>{outfit.name}</h3>
                        <p className={styles.outfitMeta}>
                          {outfitItems.length} piece
                          {outfitItems.length !== 1 ? "s" : ""}
                        </p>
                        <div className={styles.outfitActions}>
                          <Link
                            to="/ai-try-on"
                            className={styles.outfitTryOnBtn}
                            title="Try on"
                          >
                            <Eye size={14} /> Try On
                          </Link>
                          <button
                            className={`${styles.outfitActionBtn} ${styles.outfitDeleteBtn}`}
                            onClick={() => deleteOutfit(outfit.id)}
                            title="Delete"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════
            TAB: AI RECOMMENDATIONS
        ═══════════════════════════════════ */}
        {tab === "ai" && (
          <div className={styles.tabContent}>
            <div className={styles.aiHeader}>
              <div className={styles.aiHeaderText}>
                <h2 className={styles.sectionHeading}>
                  <Sparkles size={20} /> AI Style Picks
                </h2>
                <p className={styles.aiSubtitle}>
                  Based on your {items.length} items, we've found these store pieces to elevate your style.
                </p>
              </div>
              <div className={styles.aiMatchBadge}>
                <Star size={14} /> Personalized for you
              </div>
            </div>

            <div className={styles.aiGrid}>
              <div className={styles.empty} style={{ gridColumn: '1/-1' }}>
                <h3>AI Picks coming soon.</h3>
                <p>
                  We're still analyzing your wardrobe. Check back soon for personalized recommendations!
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
