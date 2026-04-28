/**
 * ProductImageManager.jsx
 * -------------------------------------------------------
 * Reusable slide-in drawer for managing product images
 * and per-variant (color) images inside VendorInventoryPage.
 *
 * Props:
 *   product     — { id, name, images[], variants[] }
 *   onClose     — () => void
 *   onSave      — (updatedImages) => void   (called on "Save Changes")
 *
 * image object shape:
 *   { id, url, isPrimary, colorId, colorName, colorHex, file? }
 */

import { useState, useRef, useCallback } from "react";
import {
  X, Upload, Star, Trash2, Eye, ImagePlus,
  Check, Info, Image as ImageIcon,
} from "lucide-react";
import s from "../../styles/ProductImageManager.module.css";
import p from "../../styles/VendorPage.module.css";

/* ─── Unique-ID helper ── */
let uidCounter = 1;
const uid = () => `img-${Date.now()}-${uidCounter++}`;

/* ─── Derive unique color variants from product.variants ── */
function getColors(product) {
  if (!product?.variants?.length) return [];
  const seen = new Map();
  for (const v of product.variants) {
    const c = v?.color;
    if (!c?.id || seen.has(c.id)) continue;
    seen.set(c.id, { id: c.id, name: c.name, hex: c.hexCode || "#888" });
  }
  return Array.from(seen.values());
}

/* ─── Single image card ── */
function ImgCard({ img, isPrimary, onSetPrimary, onDelete, onPreview }) {
  return (
    <div
      className={`${s.imgCard} ${isPrimary ? s.isPrimary : ""}`}
      onClick={() => onPreview(img)}
    >
      {img.url
        ? <img src={img.url} alt="product" className={s.imgCardImg} />
        : <div className={s.imgCardPlaceholder}><ImageIcon size={28} /></div>
      }

      {/* Primary badge */}
      {isPrimary && (
        <span className={s.primaryBadge}>
          <Star size={9} fill="white" stroke="white" /> Primary
        </span>
      )}

      {/* Color dot */}
      {img.colorHex && (
        <span
          className={s.colorTagBadge}
          style={{ background: img.colorHex }}
          title={img.colorName}
        />
      )}

      {/* Hover overlay */}
      <div className={s.imgCardOverlay} onClick={e => e.stopPropagation()}>
        {!isPrimary && (
          <button
            className={`${s.imgOverlayBtn} ${s.setPrimaryBtn}`}
            onClick={() => onSetPrimary(img.id)}
          >
            <Star size={11} /> Set as Primary
          </button>
        )}
        <button
          className={`${s.imgOverlayBtn} ${s.deleteImgBtn}`}
          onClick={() => onDelete(img.id)}
        >
          <Trash2 size={11} /> Remove
        </button>
      </div>
    </div>
  );
}

/* ─── Drop zone ── */
function DropZone({ onFiles, label = "product" }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (!valid.length) return;
    const imgs = valid.map(f => ({
      id: uid(),
      url: URL.createObjectURL(f),
      file: f,
      isPrimary: false,
      colorId: null, colorName: null, colorHex: null,
    }));
    onFiles(imgs);
  };

  return (
    <div
      className={`${s.dropZone} ${dragging ? s.dragging : ""}`}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={e => handleFiles(e.target.files)}
      />
      <div className={s.dropZoneIcon}>
        <Upload size={20} />
      </div>
      <p className={s.dropZoneTitle}>Upload {label} images</p>
      <p className={s.dropZoneSub}>Drag & drop here, or click to browse</p>
      <button type="button" className={s.dropZoneBtn} onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}>
        <ImagePlus size={14} /> Choose Files
      </button>
    </div>
  );
}

/* ─── Main component ── */
export default function ProductImageManager({ product, onClose, onSave }) {
  // Initialize images from product prop
  const initImages = () => {
    const imgs = (product?.images || []).map(img => ({
      id: img.id || uid(),
      url: img.s3Url || img.url || "",
      isPrimary: !!img.isPrimary,
      colorId: img.colorId || null,
      colorName: img.colorName || null,
      colorHex: img.colorHex || null,
      file: null,
    }));
    // Ensure exactly one primary (first if none)
    const hasPrimary = imgs.some(i => i.isPrimary);
    if (!hasPrimary && imgs.length > 0) imgs[0].isPrimary = true;
    return imgs;
  };

  const [images, setImages] = useState(initImages);
  const [toast, setToast] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [saving, setSaving] = useState(false);

  const colors = getColors(product);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2800);
  };

  /* ── Set primary ── */
  const setPrimary = useCallback((id) => {
    setImages(prev => prev.map(i => ({ ...i, isPrimary: i.id === id })));
    showToast("Primary image updated.");
  }, []);

  /* ── Delete image ── */
  const deleteImg = useCallback((id) => {
    setImages(prev => {
      const next = prev.filter(i => i.id !== id);
      // Re-assign primary if deleted image was primary
      if (prev.find(i => i.id === id)?.isPrimary && next.length > 0) {
        next[0].isPrimary = true;
      }
      return next;
    });
    showToast("Image removed.", true);
  }, []);

  /* ── Add product-level images ── */
  const addProductImages = useCallback((newImgs) => {
    setImages(prev => {
      const hasPrimary = prev.some(i => i.isPrimary);
      const withPrimary = newImgs.map((img, idx) => ({
        ...img,
        isPrimary: !hasPrimary && idx === 0 && prev.length === 0,
      }));
      return [...prev, ...withPrimary];
    });
    showToast(`${newImgs.length} image(s) added.`);
  }, []);

  /* ── Add color-specific images ── */
  const addColorImages = useCallback((newImgs, colorId, colorName, colorHex) => {
    const tagged = newImgs.map(img => ({
      ...img,
      colorId, colorName, colorHex,
    }));
    setImages(prev => [...prev, ...tagged]);
    showToast(`${newImgs.length} image(s) added for "${colorName}".`);
  }, []);

  /* ── Save ── */
  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600)); // simulate async
    onSave?.(images);
    setSaving(false);
    showToast("Images saved successfully!");
    setTimeout(onClose, 1000);
  };

  /* ── Derived counts ── */
  const productLevelImgs = images.filter(i => !i.colorId);
  const primaryImg = images.find(i => i.isPrimary);
  const totalCount = images.length;

  return (
    <>
      <div className={s.drawer}>
        <div className={s.drawerBackdrop} onClick={onClose} />
        <div className={s.drawerPanel}>

          {/* ── Header ── */}
          <div className={s.drawerHead}>
            <div>
              <h2 className={s.drawerTitle}>Manage Images — {product?.name}</h2>
              <p className={s.drawerSub}>
                {totalCount} image{totalCount !== 1 ? "s" : ""} total ·{" "}
                {primaryImg ? "Primary image set" : "No primary image yet"}
              </p>
            </div>
            <button className={s.drawerClose} onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* ── Scrollable body ── */}
          <div className={s.drawerBody}>

            {/* ══ SECTION 1 — Product-level images ══ */}
            <section>
              <div className={s.sectionHead}>
                <h3 className={s.sectionTitle}>
                  <span className={s.sectionTitleIcon}><ImageIcon size={14} /></span>
                  Product Images
                </h3>
                <div className={s.sectionDivider} />
              </div>
              <p style={{ fontSize: 12.5, color: "var(--vdr-text-muted)", marginBottom: 14, lineHeight: 1.5 }}>
                <Info size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
                The <strong>Primary image</strong> appears on the Shop page and Product cards. It also shows in the product gallery until a customer selects a specific colour.
              </p>

              {productLevelImgs.length > 0 && (
                <div className={s.imgGrid} style={{ marginBottom: 14 }}>
                  {productLevelImgs.map(img => (
                    <ImgCard
                      key={img.id}
                      img={img}
                      isPrimary={img.isPrimary}
                      onSetPrimary={setPrimary}
                      onDelete={deleteImg}
                      onPreview={img => setLightbox(img.url)}
                    />
                  ))}
                </div>
              )}

              <DropZone onFiles={addProductImages} label="product" />
            </section>

            {/* ══ SECTION 2 — Per-colour variant images ══ */}
            {colors.length > 0 && (
              <section>
                <div className={s.sectionHead}>
                  <h3 className={s.sectionTitle}>
                    <span className={s.sectionTitleIcon} style={{ background: "#fef3c7", color: "#ca8a04" }}>
                      <Star size={14} />
                    </span>
                    Color Variant Images
                  </h3>
                  <div className={s.sectionDivider} />
                </div>
                <p style={{ fontSize: 12.5, color: "var(--vdr-text-muted)", marginBottom: 18, lineHeight: 1.5 }}>
                  <Info size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
                  When a customer selects a colour in the Product Details page, these images will be shown for that colour. If a colour has no images, the primary product image is used as fallback.
                </p>

                {colors.map(color => {
                  const colorImgs = images.filter(i => i.colorId === color.id);
                  return (
                    <div key={color.id} style={{ marginBottom: 22 }}>
                      <div className={s.variantHeader}>
                        <span className={s.variantColorDot} style={{ background: color.hex }} />
                        <span className={s.variantColorName}>{color.name}</span>
                        <span className={s.variantImgCount}>
                          {colorImgs.length} image{colorImgs.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {colorImgs.length > 0 ? (
                        <div className={s.imgGrid} style={{ marginBottom: 10 }}>
                          {colorImgs.map(img => (
                            <ImgCard
                              key={img.id}
                              img={img}
                              isPrimary={img.isPrimary}
                              onSetPrimary={setPrimary}
                              onDelete={deleteImg}
                              onPreview={img => setLightbox(img.url)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className={s.emptyVariant}>
                          No images for {color.name} — will use primary product image as fallback.
                        </div>
                      )}

                      <DropZone
                        onFiles={(imgs) => addColorImages(imgs, color.id, color.name, color.hex)}
                        label={`${color.name} variant`}
                      />
                    </div>
                  );
                })}
              </section>
            )}

            {/* ══ SECTION 3 — Current primary preview ══ */}
            {primaryImg?.url && (
              <section>
                <div className={s.sectionHead}>
                  <h3 className={s.sectionTitle}>
                    <span className={s.sectionTitleIcon} style={{ background: "#dcfce7", color: "#16a34a" }}>
                      <Check size={14} />
                    </span>
                    Current Primary Image
                  </h3>
                  <div className={s.sectionDivider} />
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <img
                    src={primaryImg.url}
                    alt="Primary"
                    style={{ width: 120, height: 160, objectFit: "cover", borderRadius: 12, border: "2.5px solid var(--vdr-accent)", flexShrink: 0, cursor: "zoom-in" }}
                    onClick={() => setLightbox(primaryImg.url)}
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", background: "var(--vdr-accent-light)", color: "var(--vdr-accent)", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                      <Star size={11} fill="currentColor" /> Primary Image
                    </span>
                    <p style={{ fontSize: 13, color: "var(--vdr-text-muted)", margin: 0, lineHeight: 1.5, maxWidth: 280 }}>
                      This image appears in the Shop browse grid, product cards, and as the default product gallery image. Click any other image and choose <em>"Set as Primary"</em> to change it.
                    </p>
                    {primaryImg.colorName && (
                      <span style={{ fontSize: 12, color: "var(--vdr-text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 12, height: 12, borderRadius: "50%", background: primaryImg.colorHex, display: "inline-block", border: "1px solid #ddd" }} />
                        Tagged to: {primaryImg.colorName}
                      </span>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ── Footer ── */}
          <div className={s.drawerFoot}>
            <p className={s.drawerFootInfo}>
              <ImageIcon size={13} />
              {totalCount} image{totalCount !== 1 ? "s" : ""} ·{" "}
              {images.filter(i => i.colorId).length} variant-specific
            </p>
            <div className={s.drawerFootActions}>
              <button className={`${p.btn} ${p.btnOutline}`} onClick={onClose}>
                Cancel
              </button>
              <button
                className={`${p.btn} ${p.btnPrimary}`}
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} /> Saving…</>
                  : <><Check size={14} /> Save Changes</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className={s.lightbox} onClick={() => setLightbox(null)}>
          <button className={s.lightboxClose} onClick={() => setLightbox(null)}><X size={18} /></button>
          <img src={lightbox} alt="Preview" className={s.lightboxImg} />
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`${s.imgToast} ${toast.ok ? s.imgToastSuccess : s.imgToastError}`}>
          {toast.ok ? <Check size={15} /> : <X size={15} />} {toast.msg}
        </div>
      )}
    </>
  );
}
