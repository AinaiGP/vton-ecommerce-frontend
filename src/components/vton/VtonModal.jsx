/**
 * VtonModal.jsx — 4-step Virtual Try-On wizard modal.
 *
 * Steps:
 *   1. Upload person photo → generate mask via POST /vton/generate-mask
 *   2. Review / paint-edit the mask on a canvas
 *   3. Processing spinner → run-tryon via POST /vton/run-tryon
 *   4. Result image display with download button
 *
 * Tech rules:
 * - React JSX + CSS Modules only
 * - No inline styles, no Tailwind
 * - apiClient from utils/apiClient.js for all HTTP calls
 * - All images sent as base64 strings
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Upload,
  Sparkles,
  RotateCcw,
  Download,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ImageIcon,
  ArrowRight,
  ChevronLeft,
  Paintbrush,
  Eraser,
  Undo2,
} from "lucide-react";
import apiClient from "../../utils/apiClient";
import styles from "../../styles/VtonModal.module.css";

// ─── Constants ──────────────────────────────────────────────────────────────

const STEPS = [
  { number: 1, label: "Upload" },
  { number: 2, label: "Edit Mask" },
  { number: 3, label: "Processing" },
  { number: 4, label: "Result" },
];

const MAX_UNDO_STACK = 20;
const PROCESSING_MESSAGES = [
  "Sending your photo to the AI worker…",
  "Generating your virtual try-on…",
  "This may take up to 60 seconds on first run…",
  "Almost there — applying the garment…",
];

// ─── Utility: image file → base64 string (no data-URL prefix) ──────────────

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Strip the "data:<mime>;base64," prefix
      const result = reader.result;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Utility: URL → base64 (for cloth image from S3) ───────────────────────

async function urlToBase64(url) {
  const response = await fetch(url, { mode: "cors" });
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ─── Sub-component: Step Indicator ──────────────────────────────────────────

function StepIndicator({ currentStep }) {
  return (
    <div className={styles.stepIndicator}>
      {STEPS.map((step, index) => {
        const isDone = step.number < currentStep;
        const isActive = step.number === currentStep;
        return (
          <div key={step.number} className={styles.stepItem}>
            <div
              className={[
                styles.stepDot,
                isDone ? styles.stepDotDone : "",
                isActive ? styles.stepDotActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={`Step ${step.number}: ${step.label}`}
            >
              {isDone ? <CheckCircle size={14} /> : step.number}
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={[
                  styles.stepConnector,
                  isDone ? styles.stepConnectorDone : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function VtonModal({
  isOpen,
  onClose,
  clothImageUrl,
  categorySlug,
  productId,
}) {
  // ── Step ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);

  // ── Step 1 state ─────────────────────────────────────────────────────────
  const [personFile, setPersonFile] = useState(null);
  const [personPreviewUrl, setPersonPreviewUrl] = useState(null);
  const [personB64, setPersonB64] = useState(null);
  const [clothB64, setClothB64] = useState(null);
  const [clothFetchError, setClothFetchError] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isGeneratingMask, setIsGeneratingMask] = useState(false);
  const [maskError, setMaskError] = useState(null);

  // ── Step 2 state ─────────────────────────────────────────────────────────
  const [originalMaskB64, setOriginalMaskB64] = useState(null);
  const [brushColor, setBrushColor] = useState("white");
  const [brushSize, setBrushSize] = useState(20);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const undoStackRef = useRef([]);
  const [undoStackLength, setUndoStackLength] = useState(0);
  const lastPointRef = useRef(null);

  // ── Step 3 state ─────────────────────────────────────────────────────────
  const [processingMsgIndex, setProcessingMsgIndex] = useState(0);
  const [tryonError, setTryonError] = useState(null);
  const [usedOriginalMask, setUsedOriginalMask] = useState(false);
  const processingIntervalRef = useRef(null);

  // ── Step 4 state ─────────────────────────────────────────────────────────
  const [resultB64, setResultB64] = useState(null);

  // ─── Fetch cloth image as base64 when modal opens ─────────────────────────

  useEffect(() => {
    if (!isOpen || !clothImageUrl) return;
    setClothFetchError(false);
    setClothB64(null);

    urlToBase64(clothImageUrl)
      .then((b64) => setClothB64(b64))
      .catch(() => {
        console.warn(
          "Could not fetch cloth image (possibly CORS). Proceeding without cloth b64 prefetch."
        );
        setClothFetchError(true);
      });
  }, [isOpen, clothImageUrl]);

  // ─── Reset all state when modal closes ───────────────────────────────────

  const resetAll = useCallback(() => {
    setStep(1);
    setPersonFile(null);
    setPersonPreviewUrl(null);
    setPersonB64(null);
    setClothB64(null);
    setClothFetchError(false);
    setIsDragOver(false);
    setIsGeneratingMask(false);
    setMaskError(null);
    setOriginalMaskB64(null);
    setBrushColor("white");
    setBrushSize(20);
    undoStackRef.current = [];
    setUndoStackLength(0);
    lastPointRef.current = null;
    setProcessingMsgIndex(0);
    setTryonError(null);
    setUsedOriginalMask(false);
    setResultB64(null);
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
    }
  }, []);

  const handleClose = useCallback(() => {
    resetAll();
    onClose();
  }, [resetAll, onClose]);

  // ─── Step 1: Handle file selection / drop ────────────────────────────────

  const handleFileSelect = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setPersonFile(file);
    setPersonPreviewUrl(URL.createObjectURL(file));
    setMaskError(null);
    try {
      const b64 = await fileToBase64(file);
      setPersonB64(b64);
    } catch {
      setMaskError("Failed to read image file. Please try another image.");
    }
  }, []);

  const onFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => setIsDragOver(false);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  // ─── Step 1: Generate Mask ────────────────────────────────────────────────

  const handleGenerateMask = async () => {
    if (!personB64 || !categorySlug) return;
    setIsGeneratingMask(true);
    setMaskError(null);

    try {
      const res = await apiClient.post("/vton/generate-mask", {
        personImage: personB64,
        categorySlug,
      });
      const maskB64 = res.data?.maskImage;
      if (!maskB64) throw new Error("No mask returned from server.");
      setOriginalMaskB64(maskB64);
      setStep(2);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Mask generation failed. Please try again.";
      setMaskError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsGeneratingMask(false);
    }
  };

  // ─── Step 2: Initialize Canvas when mask arrives ─────────────────────────

  useEffect(() => {
    if (step !== 2 || !originalMaskB64 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      // Save initial state for undo
      undoStackRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
      setUndoStackLength(1);
    };
    img.src = `data:image/png;base64,${originalMaskB64}`;
  }, [step, originalMaskB64]);

  // ─── Step 2: Canvas drawing ───────────────────────────────────────────────

  const saveUndoState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStackRef.current.push(state);
    if (undoStackRef.current.length > MAX_UNDO_STACK) {
      undoStackRef.current.shift();
    }
    setUndoStackLength(undoStackRef.current.length);
  }, []);

  const drawOnCanvas = useCallback(
    (x, y) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = brushColor;
      ctx.beginPath();

      if (lastPointRef.current) {
        // Draw a line from last point to current for smooth strokes
        ctx.lineWidth = brushSize * 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = brushColor;
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        ctx.arc(x, y, brushSize, 0, Math.PI * 2);
        ctx.fill();
      }

      lastPointRef.current = { x, y };
    },
    [brushColor, brushSize]
  );

  const getCanvasPoint = (canvas, clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const onCanvasMouseDown = (e) => {
    isDrawingRef.current = true;
    lastPointRef.current = null;
    saveUndoState();
    const { x, y } = getCanvasPoint(canvasRef.current, e.clientX, e.clientY);
    drawOnCanvas(x, y);
  };

  const onCanvasMouseMove = (e) => {
    if (!isDrawingRef.current) return;
    const { x, y } = getCanvasPoint(canvasRef.current, e.clientX, e.clientY);
    drawOnCanvas(x, y);
  };

  const onCanvasMouseUp = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const onCanvasTouchStart = (e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    lastPointRef.current = null;
    saveUndoState();
    const touch = e.touches[0];
    const { x, y } = getCanvasPoint(canvasRef.current, touch.clientX, touch.clientY);
    drawOnCanvas(x, y);
  };

  const onCanvasTouchMove = (e) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const touch = e.touches[0];
    const { x, y } = getCanvasPoint(canvasRef.current, touch.clientX, touch.clientY);
    drawOnCanvas(x, y);
  };

  const onCanvasTouchEnd = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const handleUndo = () => {
    if (undoStackRef.current.length <= 1) return;
    undoStackRef.current.pop();
    const prevState = undoStackRef.current[undoStackRef.current.length - 1];
    const canvas = canvasRef.current;
    if (!canvas || !prevState) return;
    const ctx = canvas.getContext("2d");
    ctx.putImageData(prevState, 0, 0);
    setUndoStackLength(undoStackRef.current.length);
  };

  const handleResetMask = () => {
    if (!originalMaskB64 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      undoStackRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
      setUndoStackLength(1);
    };
    img.src = `data:image/png;base64,${originalMaskB64}`;
  };

  const getCanvasB64 = () => {
    if (!canvasRef.current) return originalMaskB64;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    return dataUrl.split(",")[1];
  };

  // ─── Step 2 → 3: Proceed to run-tryon ────────────────────────────────────

  const handleProceedToTryon = async (useOriginalMask = false) => {
    setUsedOriginalMask(useOriginalMask);
    setTryonError(null);
    setStep(3);

    // Cycle processing messages
    processingIntervalRef.current = setInterval(() => {
      setProcessingMsgIndex((prev) =>
        prev < PROCESSING_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 8000);

    // Resolve cloth image base64 — try cached, then fetch, then fail gracefully
    let clothImageB64 = clothB64;
    if (!clothImageB64 && clothImageUrl && !clothFetchError) {
      try {
        clothImageB64 = await urlToBase64(clothImageUrl);
        setClothB64(clothImageB64);
      } catch {
        setClothFetchError(true);
      }
    }

    if (!clothImageB64) {
      clearInterval(processingIntervalRef.current);
      setTryonError(
        "Could not load the garment image. This is usually a CORS issue. " +
        "Please try refreshing the page or contact support."
      );
      return;
    }

    const maskB64 = useOriginalMask ? originalMaskB64 : getCanvasB64();

    try {
      const res = await apiClient.post("/vton/run-tryon", {
        personImage: personB64,
        clothImage: clothImageB64,
        maskImage: maskB64,
        ...(productId ? { productId } : {}),
      });
      const resultImage = res.data?.resultImage;
      if (!resultImage) throw new Error("No result image returned.");
      setResultB64(resultImage);
      setStep(4);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Virtual try-on failed. Please try again.";
      setTryonError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      clearInterval(processingIntervalRef.current);
    }
  };

  const handleRetryInference = () => {
    handleProceedToTryon(usedOriginalMask);
  };

  // ─── Step 4: Download result ──────────────────────────────────────────────

  const handleDownload = () => {
    if (!resultB64) return;
    const link = document.createElement("a");
    link.href = `data:image/jpeg;base64,${resultB64}`;
    link.download = `ainai-tryon-${Date.now()}.jpg`;
    link.click();
  };

  // ─── Retry from step 1 ────────────────────────────────────────────────────

  const handleRetry = () => {
    setTryonError(null);
    setProcessingMsgIndex(0);
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
    }
    // Go back to step 1 for a fresh start
    setPersonFile(null);
    setPersonPreviewUrl(null);
    setPersonB64(null);
    setOriginalMaskB64(null);
    setMaskError(null);
    undoStackRef.current = [];
    setUndoStackLength(0);
    setStep(1);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose} role="dialog" aria-modal="true" aria-label="Virtual Try-On">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* ── Header ── */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <Sparkles size={18} />
            </div>
            <h2 className={styles.headerTitle}>Virtual Try-On</h2>
          </div>
          <button
            id="vton-modal-close"
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Close Virtual Try-On"
          >
            <X size={20} />
          </button>
        </header>

        {/* ── Step Indicator ── */}
        <StepIndicator currentStep={step} />

        {/* ── Step Content ── */}
        <div className={styles.stepContent}>
          {step === 1 && (
            <StepUpload
              styles={styles}
              personPreviewUrl={personPreviewUrl}
              clothImageUrl={clothImageUrl}
              isDragOver={isDragOver}
              isGeneratingMask={isGeneratingMask}
              maskError={maskError}
              personB64={personB64}
              categorySlug={categorySlug}
              onFileInputChange={onFileInputChange}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onGenerateMask={handleGenerateMask}
            />
          )}

          {step === 2 && (
            <StepMaskEditor
              styles={styles}
              personPreviewUrl={personPreviewUrl}
              canvasRef={canvasRef}
              brushColor={brushColor}
              setBrushColor={setBrushColor}
              brushSize={brushSize}
              setBrushSize={setBrushSize}
              undoStackLength={undoStackLength}
              onCanvasMouseDown={onCanvasMouseDown}
              onCanvasMouseMove={onCanvasMouseMove}
              onCanvasMouseUp={onCanvasMouseUp}
              onCanvasTouchStart={onCanvasTouchStart}
              onCanvasTouchMove={onCanvasTouchMove}
              onCanvasTouchEnd={onCanvasTouchEnd}
              onUndo={handleUndo}
              onReset={handleResetMask}
            />
          )}

          {step === 3 && (
            <StepProcessing
              styles={styles}
              tryonError={tryonError}
              processingMessage={PROCESSING_MESSAGES[processingMsgIndex]}
              onRetry={handleRetry}
              onClose={handleClose}
            />
          )}

          {step === 4 && (
            <StepResult
              styles={styles}
              resultB64={resultB64}
            />
          )}
        </div>

        {/* ── Footer ── */}
        <footer className={styles.footer}>
          {step === 1 && (
            <>
              <div className={styles.footerLeft}>
                <button id="vton-cancel-btn" className={styles.secondaryBtn} onClick={handleClose}>
                  Cancel
                </button>
              </div>
              <div className={styles.footerRight}>
                <button
                  id="vton-generate-mask-btn"
                  className={styles.primaryBtn}
                  onClick={handleGenerateMask}
                  disabled={!personB64 || !categorySlug || isGeneratingMask}
                >
                  {isGeneratingMask ? (
                    <>
                      <RefreshCw size={16} className={styles.spinning} />
                      Generating Mask…
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate Mask
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className={styles.footerLeft}>
                <button
                  id="vton-back-btn"
                  className={styles.secondaryBtn}
                  onClick={() => setStep(1)}
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
                <button
                  id="vton-skip-edit-btn"
                  className={styles.secondaryBtn}
                  onClick={() => handleProceedToTryon(true)}
                >
                  Skip Editing
                </button>
              </div>
              <div className={styles.footerRight}>
                <button
                  id="vton-proceed-btn"
                  className={styles.primaryBtn}
                  onClick={() => handleProceedToTryon(false)}
                >
                  Looks Good
                  <ArrowRight size={14} />
                </button>
              </div>
            </>
          )}

          {step === 3 && !tryonError && (
            <div className={styles.footerLeft}>
              <button
                id="vton-cancel-tryon-btn"
                className={styles.dangerBtn}
                onClick={handleClose}
              >
                Cancel
              </button>
            </div>
          )}

          {step === 3 && tryonError && (
            <>
              <div className={styles.footerLeft}>
                <button
                  id="vton-start-over-btn"
                  className={styles.secondaryBtn}
                  onClick={handleRetry}
                >
                  <RotateCcw size={16} />
                  Start Over
                </button>
              </div>
              <div className={styles.footerRight}>
                <button
                  id="vton-retry-btn"
                  className={styles.primaryBtn}
                  onClick={handleRetryInference}
                >
                  <RefreshCw size={16} />
                  Retry Generation
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className={styles.footerLeft}>
                <button
                  id="vton-try-another-btn"
                  className={styles.secondaryBtn}
                  onClick={handleRetry}
                >
                  <RefreshCw size={16} />
                  Try Another Photo
                </button>
              </div>
              <div className={styles.footerRight}>
                <button
                  id="vton-download-btn"
                  className={styles.downloadBtn}
                  onClick={handleDownload}
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  id="vton-done-btn"
                  className={styles.primaryBtn}
                  onClick={handleClose}
                >
                  Done
                </button>
              </div>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}

// ─── Step 1: Upload ──────────────────────────────────────────────────────────

function StepUpload({
  styles,
  personPreviewUrl,
  clothImageUrl,
  isDragOver,
  isGeneratingMask,
  maskError,
  personB64,
  categorySlug,
  onFileInputChange,
  onDragOver,
  onDragLeave,
  onDrop,
  onGenerateMask,
}) {
  const fileInputRef = useRef(null);

  return (
    <div className={styles.uploadLayout}>
      {/* Person photo upload / preview */}
      <div>
        {!personPreviewUrl ? (
          <div
            id="vton-upload-zone"
            className={[
              styles.uploadZone,
              isDragOver ? styles.uploadZoneHover : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            aria-label="Upload person photo"
          >
            <input
              ref={fileInputRef}
              id="vton-file-input"
              type="file"
              accept="image/*"
              className={styles.uploadInput}
              onChange={onFileInputChange}
              onClick={(e) => e.stopPropagation()}
            />
            <div className={styles.uploadIcon}>
              <Upload size={28} />
            </div>
            <p className={styles.uploadTitle}>Upload Your Photo</p>
            <p className={styles.uploadHint}>
              Drag &amp; drop or click to select
              <br />
              JPEG, PNG — full body recommended
            </p>
          </div>
        ) : (
          <div className={styles.uploadPreview}>
            <img
              src={personPreviewUrl}
              alt="Your uploaded photo"
              className={styles.uploadPreviewImg}
            />
            <button
              id="vton-change-photo-btn"
              className={styles.uploadChangeBtn}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={14} />
              Change Photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className={styles.uploadInput}
              style={{ display: "none" }}
              onChange={onFileInputChange}
            />
          </div>
        )}

        {maskError && (
          <p className={styles.errorBox} role="alert">
            <AlertCircle size={16} />
            {maskError}
          </p>
        )}

        {isGeneratingMask && (
          <p className={styles.infoBox} role="status">
            <RefreshCw size={16} className={styles.spinning} />
            Analyzing your photo… this runs on CPU and may take <strong>30–90 seconds</strong>. Please wait.
          </p>
        )}

        {!categorySlug && personB64 && (
          <p className={styles.infoBox}>
            <AlertCircle size={16} />
            This product does not have a supported category for try-on. Please contact support.
          </p>
        )}
      </div>

      {/* Garment reference */}
      <div className={styles.clothPanel}>
        <p className={styles.clothPanelLabel}>You&apos;re trying on</p>
        <div className={styles.clothThumbnail}>
          {clothImageUrl ? (
            <img
              src={clothImageUrl}
              alt="Garment to try on"
              className={styles.clothThumbnailImg}
            />
          ) : (
            <div className={styles.clothPlaceholder}>
              <ImageIcon size={32} />
              <span>No garment image</span>
            </div>
          )}
        </div>
        <p className={styles.clothInfo}>
          Stand straight, facing the camera.
          <br />
          A full-body photo gives the best result.
        </p>
      </div>
    </div>
  );
}

// ─── Step 2: Mask Editor ─────────────────────────────────────────────────────

function StepMaskEditor({
  styles,
  personPreviewUrl,
  canvasRef,
  brushColor,
  setBrushColor,
  brushSize,
  setBrushSize,
  undoStackLength,
  onCanvasMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
  onCanvasTouchStart,
  onCanvasTouchMove,
  onCanvasTouchEnd,
  onUndo,
  onReset,
}) {
  return (
    <div>
      {/* Brush toolbar */}
      <div className={styles.brushToolbar} role="toolbar" aria-label="Mask editing tools">
        {/* Brush color */}
        <div className={styles.brushGroup}>
          <span className={styles.brushGroupLabel}>Brush</span>
          <button
            id="vton-brush-white"
            className={[
              styles.brushBtn,
              styles.brushBtnWhite,
              brushColor === "white" ? styles.brushBtnActive : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setBrushColor("white")}
            title="Add to try-on (white)"
            aria-pressed={brushColor === "white"}
          >
            <Paintbrush size={14} />
          </button>
          <button
            id="vton-brush-black"
            className={[
              styles.brushBtn,
              styles.brushBtnBlack,
              brushColor === "black" ? styles.brushBtnActive : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setBrushColor("black")}
            title="Remove from try-on (black)"
            aria-pressed={brushColor === "black"}
          >
            <Eraser size={14} />
          </button>
        </div>

        <div className={styles.toolbarDivider} />

        {/* Brush size */}
        <div className={styles.brushGroup}>
          <span className={styles.brushGroupLabel}>Size</span>
          <input
            id="vton-brush-size"
            type="range"
            min={5}
            max={60}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className={styles.sizeSlider}
            aria-label="Brush size"
          />
          <span className={styles.sizeValue}>{brushSize}</span>
        </div>

        <div className={styles.toolbarDivider} />

        {/* Undo / Reset */}
        <button
          id="vton-undo"
          className={styles.toolbarBtn}
          onClick={onUndo}
          disabled={undoStackLength <= 1}
          title="Undo"
        >
          <Undo2 size={14} />
          Undo
        </button>
        <button
          id="vton-reset-mask"
          className={styles.toolbarBtn}
          onClick={onReset}
          title="Reset to generated mask"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      {/* Two-panel layout */}
      <div className={styles.editorLayout} style={{ marginTop: "1rem" }}>
        {/* Left: person photo reference */}
        <div className={styles.editorPanel}>
          <p className={styles.editorPanelLabel}>Your Photo</p>
          <img
            src={personPreviewUrl}
            alt="Your photo reference"
            className={styles.editorImg}
          />
        </div>

        {/* Right: editable mask canvas */}
        <div className={styles.editorPanel}>
          <p className={styles.editorPanelLabel}>
            <Sparkles size={14} />
            Mask (AI Generated)
          </p>
          <div className={styles.canvasWrapper}>
            <canvas
              id="vton-mask-canvas"
              ref={canvasRef}
              className={styles.canvas}
              onMouseDown={onCanvasMouseDown}
              onMouseMove={onCanvasMouseMove}
              onMouseUp={onCanvasMouseUp}
              onMouseLeave={onCanvasMouseUp}
              onTouchStart={onCanvasTouchStart}
              onTouchMove={onCanvasTouchMove}
              onTouchEnd={onCanvasTouchEnd}
              aria-label="Editable mask canvas — paint to adjust try-on area"
            />
          </div>
          <p className={styles.editorHint}>
            ⬜ White = garment area &nbsp; ⬛ Black = keep as-is
            <br />
            Paint to adjust the mask, then click &quot;Looks Good&quot;.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Processing ──────────────────────────────────────────────────────

function StepProcessing({ styles, tryonError, processingMessage, onRetry, onClose }) {
  if (tryonError) {
    return (
      <div className={styles.processingContainer}>
        <p className={styles.errorBox} role="alert">
          <AlertCircle size={18} />
          <span>{tryonError}</span>
        </p>
      </div>
    );
  }

  return (
    <div className={styles.processingContainer}>
      <div className={styles.processingSpinner} aria-hidden="true">
        <div className={styles.processingRing} />
        <div className={styles.processingRingInner} />
        <div className={styles.processingIcon}>
          <Sparkles size={20} />
        </div>
      </div>
      <p className={styles.processingTitle}>Generating Your Try-On</p>
      <p className={styles.processingMessage}>{processingMessage}</p>
      <div className={styles.processingSteps}>
        <div className={styles.processingStep}>
          <CheckCircle size={14} />
          Photo uploaded
        </div>
        <div className={styles.processingStep}>
          <CheckCircle size={14} />
          Mask ready
        </div>
        <div className={`${styles.processingStep} ${styles.processingStepActive}`}>
          <RefreshCw size={14} />
          Running AI inference…
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Result ──────────────────────────────────────────────────────────

function StepResult({ styles, resultB64 }) {
  return (
    <div className={styles.resultContainer}>
      <div className={styles.resultBadge}>
        <CheckCircle size={16} />
        Try-on complete!
      </div>
      <div className={styles.resultImageWrapper}>
        <img
          id="vton-result-image"
          src={`data:image/jpeg;base64,${resultB64}`}
          alt="Your virtual try-on result"
          className={styles.resultImage}
        />
      </div>
    </div>
  );
}
