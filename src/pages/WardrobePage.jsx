import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  X,
  Plus,
  Trash2,
  Edit3,
  Check,
  Sparkles,
  ShoppingBag,
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
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
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

let nextId = 100;

/* ─── Component ─────────────────────────────────────── */
export default function WardrobePage() {
  const [tab, setTab] = useState("wardrobe"); // wardrobe | builder | outfits | ai
  const [activeCategory, setActiveCategory] = useState("all");
  const [items, setItems] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [aiRecs, setAiRecs] = useState([]);
  const [selectedForOutfit, setSelectedForOutfit] = useState([]);
  const [outfitName, setOutfitName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingOutfitId, setEditingOutfitId] = useState(null);
  const [editingOutfitName, setEditingOutfitName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState(null);
  const [wishlistedRecs, setWishlistedRecs] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    // TODO: wire to real API endpoint — Phase X
    setItems([]);
    setOutfits([]);
    setAiRecs([]);
  }, []);

  /* helpers */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const filteredItems =
    activeCategory === "all"
      ? items
      : items.filter((i) => i.category === activeCategory);

  /* ── Upload ── */
  const handleFiles = useCallback((files) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        nextId++;
        const cat = CATEGORIES.find((c) => c.id !== "all")?.id || "tops";
        setItems((prev) => [
          ...prev,
          {
            id: nextId,
            name: file.name.replace(/\.[^.]+$/, ""),
            category: cat,
            color: "#a8b5a0",
            url: e.target.result,
            isCustom: true,
          },
        ]);
        showToast("Item added to wardrobe!");
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  /* ── Edit item ── */
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };
  const saveEdit = (id) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, name: editingName } : i)),
    );
    setEditingId(null);
    showToast("Item name updated.");
  };

  /* ── Delete item ── */
  const deleteItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedForOutfit((prev) => prev.filter((sid) => sid !== id));
    showToast("Item removed.", "info");
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
    nextId++;
    setOutfits((prev) => [
      ...prev,
      {
        id: nextId,
        name,
        items: [...selectedForOutfit],
        cover: coverItem?.url || "",
      },
    ]);
    setSelectedForOutfit([]);
    setOutfitName("");
    showToast(`"${name}" saved!`);
    setTab("outfits");
  };

  /* ── Delete outfit ── */
  const deleteOutfit = (id) => {
    setOutfits((prev) => prev.filter((o) => o.id !== id));
    showToast("Outfit deleted.", "info");
  };

  /* ── Rename outfit ── */
  const startRenameOutfit = (outfit) => {
    setEditingOutfitId(outfit.id);
    setEditingOutfitName(outfit.name);
  };
  const saveRenameOutfit = (id) => {
    setOutfits((prev) =>
      prev.map((o) => (o.id === id ? { ...o, name: editingOutfitName } : o)),
    );
    setEditingOutfitId(null);
    showToast("Outfit renamed.");
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
          >
            <Upload size={16} /> Upload Clothes
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
            { id: "ai", label: "AI Picks", icon: <Sparkles size={16} /> },
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
              <Upload size={32} className={styles.dropIcon} />
              <p className={styles.dropText}>
                Drag & drop your clothes here, or{" "}
                <strong>click to browse</strong>
              </p>
              <p className={styles.dropHint}>
                PNG, JPG, WEBP • Multiple files supported
              </p>
            </div>

            {/* Category Filter */}
            <div className={styles.categoryBar}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`${styles.catBtn} ${activeCategory === cat.id ? styles.catBtnActive : ""}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.icon}
                  {cat.label}
                  <span className={styles.catCount}>
                    {cat.id === "all"
                      ? items.length
                      : items.filter((i) => i.category === cat.id).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Wardrobe Grid */}
            {filteredItems.length === 0 ? (
              <div className={styles.empty}>
                <Shirt size={56} strokeWidth={1} className={styles.emptyIcon} />
                <h3>
                  No items in{" "}
                  {CATEGORIES.find((c) => c.id === activeCategory)?.label}
                </h3>
                <p>
                  Upload photos of your clothes to start building your wardrobe.
                </p>
              </div>
            ) : (
              <div className={styles.wardrobeGrid}>
                {filteredItems.map((item) => (
                  <div key={item.id} className={styles.wardrobeCard}>
                    <div className={styles.cardImageWrap}>
                      <img
                        src={item.url}
                        alt={item.name}
                        className={styles.cardImage}
                      />
                      <span className={styles.cardCatBadge}>
                        {CATEGORIES.find((c) => c.id === item.category)?.label}
                      </span>
                      <div className={styles.cardOverlay}>
                        <button
                          className={styles.overlayBtn}
                          title="Edit name"
                          onClick={() => startEdit(item)}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className={`${styles.overlayBtn} ${styles.overlayBtnDanger}`}
                          title="Delete"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          className={`${styles.overlayBtn} ${styles.overlayBtnTryOn}`}
                          title="Try on"
                          onClick={() => {}}
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                    <div className={styles.cardInfo}>
                      {editingId === item.id ? (
                        <div className={styles.editRow}>
                          <input
                            className={styles.editInput}
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && saveEdit(item.id)
                            }
                            autoFocus
                          />
                          <button
                            className={styles.editSaveBtn}
                            onClick={() => saveEdit(item.id)}
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <p className={styles.cardName}>{item.name}</p>
                      )}
                      <div
                        className={styles.colorDot}
                        style={{ background: item.color }}
                        title="Color swatch"
                      />
                    </div>
                  </div>
                ))}

                {/* Add item card */}
                <div
                  className={styles.addCard}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus size={32} />
                  <span>Add Item</span>
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

                {/* Category filter inside builder */}
                <div className={styles.categoryBarCompact}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      className={`${styles.catBtnSm} ${activeCategory === cat.id ? styles.catBtnSmActive : ""}`}
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className={styles.builderGrid}>
                  {filteredItems.map((item) => {
                    const selected = selectedForOutfit.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`${styles.builderItem} ${selected ? styles.builderItemSelected : ""}`}
                        onClick={() => toggleOutfitItem(item.id)}
                      >
                        <img
                          src={item.url}
                          alt={item.name}
                          className={styles.builderItemImg}
                        />
                        {selected && (
                          <div className={styles.builderItemCheck}>
                            <Check size={16} />
                          </div>
                        )}
                        <p className={styles.builderItemName}>{item.name}</p>
                      </div>
                    );
                  })}
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
                            src={item.url}
                            alt={item.name}
                            className={styles.canvasItemImg}
                          />
                          <p className={styles.canvasItemName}>{item.name}</p>
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
                              src={item.url}
                              alt={item.name}
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
                        {editingOutfitId === outfit.id ? (
                          <div className={styles.editRow}>
                            <input
                              className={styles.editInput}
                              value={editingOutfitName}
                              onChange={(e) =>
                                setEditingOutfitName(e.target.value)
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" && saveRenameOutfit(outfit.id)
                              }
                              autoFocus
                            />
                            <button
                              className={styles.editSaveBtn}
                              onClick={() => saveRenameOutfit(outfit.id)}
                            >
                              <Check size={14} />
                            </button>
                          </div>
                        ) : (
                          <h3 className={styles.outfitName}>{outfit.name}</h3>
                        )}
                        <p className={styles.outfitMeta}>
                          {outfitItems.length} piece
                          {outfitItems.length !== 1 ? "s" : ""}
                        </p>
                        <div className={styles.outfitActions}>
                          <button
                            className={styles.outfitActionBtn}
                            onClick={() => startRenameOutfit(outfit)}
                            title="Rename"
                          >
                            <Edit3 size={14} /> Rename
                          </button>
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
                            <Trash2 size={14} />
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
                  Based on your {items.length}-item wardrobe, our AI recommends
                  these store pieces to elevate your style.
                </p>
              </div>
              <div className={styles.aiMatchBadge}>
                <Star size={14} /> Personalized for you
              </div>
            </div>

            <div className={styles.aiGrid}>
              {aiRecs.length === 0 ? (
                <div className={styles.empty}>
                  <h3>No data yet.</h3>
                  <p>
                    AI recommendations will appear once your wardrobe is
                    connected.
                  </p>
                </div>
              ) : (
                aiRecs.map((rec) => (
                  <div key={rec.id} className={styles.aiCard}>
                    <div className={styles.aiImgWrap}>
                      <img
                        src={rec.img}
                        alt={rec.name}
                        className={styles.aiImg}
                      />
                      <div className={styles.aiMatchLabel}>
                        <Sparkles size={12} /> {rec.match}% match
                      </div>
                      <button
                        className={`${styles.wishlistBtn} ${wishlistedRecs[rec.id] ? styles.wishlistBtnActive : ""}`}
                        onClick={() => toggleWishlistRec(rec.id)}
                      >
                        <Heart
                          size={16}
                          fill={
                            wishlistedRecs[rec.id] ? "currentColor" : "none"
                          }
                        />
                      </button>
                    </div>
                    <div className={styles.aiInfo}>
                      <h3 className={styles.aiName}>{rec.name}</h3>
                      <p className={styles.aiPrice}>
                        EGP {rec.price.toFixed(0)}
                      </p>
                      <div className={styles.aiCardActions}>
                        <Link
                          to={`/product/${rec.id}`}
                          className={styles.aiViewBtn}
                        >
                          View Product
                        </Link>
                        <Link to="/ai-try-on" className={styles.aiTryBtn}>
                          <Eye size={14} /> Try On
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Combo suggestions */}
            <div className={styles.comboSection}>
              <h3 className={styles.comboTitle}>
                <Shuffle size={18} /> Outfit Combinations from Your Wardrobe
              </h3>
              <div className={styles.comboGrid}>
                <div className={styles.empty}>
                  <h3>No data yet.</h3>
                  <p>
                    Outfit combinations will appear once your wardrobe is
                    connected.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
