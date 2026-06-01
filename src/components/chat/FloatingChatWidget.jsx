import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../utils/apiClient";
import { formatPrice, getProductImage } from "../../utils/productHelpers";
import styles from "../../styles/FloatingChatWidget.module.css";
import ConfirmModal from "../common/ConfirmModal";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Renders a single line of inline markdown into React nodes.
 * Handles: **bold** → <strong>, everything else as plain text.
 * The caller strips leading bullet characters before passing the line in.
 */
function renderInline(line, key) {
  const BOLD_RE = /\*\*([^*]+)\*\*/g;
  const parts = [];
  let last = 0;
  let match;
  let idx = 0;

  while ((match = BOLD_RE.exec(line)) !== null) {
    if (match.index > last) {
      parts.push(<span key={idx++}>{line.slice(last, match.index)}</span>);
    }
    parts.push(<strong key={idx++}>{match[1]}</strong>);
    last = match.index + match[0].length;
  }

  if (last < line.length) {
    parts.push(<span key={idx++}>{line.slice(last)}</span>);
  }

  return <p key={key} className={styles.messageText}>{parts}</p>;
}

/**
 * Renders a text segment, handling line-by-line markdown:
 *  - Lines starting with `* ` or `- ` have the bullet stripped
 *  - **bold** is rendered as <strong>
 *  - Blank lines become spacing
 */
function renderTextSegment(text, segKey) {
  const lines = text.split("\n");
  return lines.map((rawLine, i) => {
    // Strip leading bullet: `* `, `- `, or `• `
    const line = rawLine.replace(/^[\*\-•]\s+/, "").trimEnd();
    if (!line) return null;
    return renderInline(line, `${segKey}-${i}`);
  });
}

/**
 * The chatbot reply is markdown-ish text that may contain product image tags
 * already injected as markdown: ![name](cloudinary_url)
 * We parse the reply into segments so we can:
 *  1. Render plain text as-is (with inline markdown stripped)
 *  2. Detect embedded images and trigger product matching for each one
 */
function parseReplySegments(reply) {
  const IMAGE_RE = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = IMAGE_RE.exec(reply)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: reply.slice(lastIndex, match.index) });
    }
    segments.push({ type: "image", alt: match[1], url: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < reply.length) {
    segments.push({ type: "text", content: reply.slice(lastIndex) });
  }

  return segments;
}

// ---------------------------------------------------------------------------
// ProductCard rendered inside chat messages
// ---------------------------------------------------------------------------

function ChatProductCard({ imageUrl, altName }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | found | notfound

  useEffect(() => {
    let cancelled = false;

    async function match() {
      try {
        const params = new URLSearchParams({ imageUrl });
        const res = await apiClient.get(`/products/match?${params}`);
        if (!cancelled) {
          setProduct(res.data);
          setStatus("found");
        }
      } catch (err) {
        if (!cancelled) {
          // Fallback: try matching by name if imageUrl lookup fails
          if (altName) {
            try {
              const params = new URLSearchParams({ name: altName });
              const res = await apiClient.get(`/products/match?${params}`);
              if (!cancelled) {
                setProduct(res.data);
                setStatus("found");
                return;
              }
            } catch {
              // fall through
            }
          }
          setStatus("notfound");
        }
      }
    }

    match();
    return () => { cancelled = true; };
  }, [imageUrl, altName]);

  if (status === "loading") {
    return (
      <div className={styles.chatProductCard}>
        <div className={styles.chatProductCardSkeleton} />
      </div>
    );
  }

  if (status === "notfound" || !product) {
    return (
      <div className={styles.chatProductCard}>
        <img src={imageUrl} alt={altName || "Product"} className={styles.chatProductCardImg} />
        <div className={styles.chatProductCardBody}>
          <p className={styles.chatProductCardName}>{altName || "Product"}</p>
          <p className={styles.chatProductCardUnavailable}>Product details unavailable</p>
        </div>
      </div>
    );
  }

  const displayImage = getProductImage(product) || imageUrl;
  const price = formatPrice(product.basePrice, product.currency);

  return (
    <div className={styles.chatProductCard}>
      <img
        src={displayImage}
        alt={product.name}
        className={styles.chatProductCardImg}
      />
      <div className={styles.chatProductCardBody}>
        <p className={styles.chatProductCardName}>{product.name}</p>
        <p className={styles.chatProductCardPrice}>{price}</p>
        <div className={styles.chatProductCardActions}>
          <button
            className={styles.chatProductCardBtn}
            onClick={() => navigate(`/product/${product.id}`)}
          >
            View Product
          </button>
          <button
            className={`${styles.chatProductCardBtn} ${styles.chatProductCardBtnSecondary}`}
            onClick={() => {
              if (!isAuthenticated) {
                navigate("/auth", { 
                  state: { 
                    from: { 
                      pathname: `/product/${product.id}`, 
                      state: { autoTriggerTryOn: true } 
                    } 
                  } 
                });
                return;
              }
              navigate(`/product/${product.id}`, {
                state: { autoTriggerTryOn: true },
              });
            }}
          >
            Try This On
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single message bubble
// ---------------------------------------------------------------------------

function ChatMessageBubble({ message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className={`${styles.messageBubble} ${styles.messageBubbleUser}`}>
        <p className={styles.messageText}>{message.content}</p>
      </div>
    );
  }

  // Assistant message — parse segments and render product cards for images
  const segments = parseReplySegments(message.content);

  return (
    <div className={`${styles.messageBubble} ${styles.messageBubbleAssistant}`}>
      {segments.map((seg, i) => {
        if (seg.type === "image") {
          return (
            <ChatProductCard
              key={i}
              imageUrl={seg.url}
              altName={seg.alt}
            />
          );
        }
        // Render text with inline markdown (bold, bullet strip)
        return seg.content.trim()
          ? renderTextSegment(seg.content, i)
          : null;
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Typing indicator
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <div className={`${styles.messageBubble} ${styles.messageBubbleAssistant}`}>
      <div className={styles.typingDots}>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main widget
// ---------------------------------------------------------------------------

const WELCOME_MESSAGE = {
  role: "model",
  content:
    "Hi! I'm your AINAI fashion assistant 👋\nAsk me for outfit ideas, product recommendations, or sizing advice.",
};

export default function FloatingChatWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [history, setHistory] = useState([]); // chatbot conversation history
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);
  const [showNewChatConfirm, setShowNewChatConfirm] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isExpanded]);

  // Focus input when chat expands
  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isExpanded]);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text || inputValue).trim();
      if (!trimmed || isTyping) return;

      setInputValue("");
      setError(null);
      setLastFailedMessage(null);

      // Add user message to UI
      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setIsTyping(true);

      try {
        const res = await apiClient.post("/ai/chatbot/message", {
          message: trimmed,
          history,
        });

        const { reply, history: updatedHistory } = res.data;

        setMessages((prev) => [...prev, { role: "model", content: reply }]);
        setHistory(updatedHistory);
      } catch (err) {
        let msg;
        if (err?.response?.status === 401) {
          msg = "Please log in to chat with the AINAI assistant.";
        } else if (err?.response?.status === 503) {
          msg = "Sorry, I'm having trouble connecting. Please try again later.";
        } else {
          msg = "Something went wrong. Please try again.";
        }
        setError(msg);
        setLastFailedMessage(trimmed);
        setMessages((prev) => [
          ...prev,
          { role: "model", content: msg, isError: true },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [inputValue, isTyping, history],
  );

  const handleRetry = () => {
    if (!lastFailedMessage) return;
    // Remove the last error message bubble before retrying
    setMessages((prev) => prev.slice(0, -1));
    sendMessage(lastFailedMessage);
  };

  const handleNewChat = () => {
    if (messages.length > 1) {
      setShowNewChatConfirm(true);
      return;
    }
    confirmNewChat();
  };

  const confirmNewChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setHistory([]);
    setInputValue("");
    setError(null);
    setLastFailedMessage(null);
    setShowNewChatConfirm(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={styles.widgetRoot}>
      {/* ── Expanded chat window ─────────────────────────────────────── */}
      {isExpanded && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderTitle}>
              <span className={styles.chatHeaderDot} />
              AINAI Assistant
            </div>
            <div className={styles.chatHeaderActions}>
              <button
                className={styles.chatHeaderBtn}
                onClick={handleNewChat}
                title="Start new chat"
              >
                New Chat
              </button>
              <button
                className={styles.chatHeaderBtn}
                onClick={() => setIsExpanded(false)}
                title="Minimize"
                aria-label="Minimize chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className={styles.chatMessages}>
            {messages.map((msg, i) => (
              <ChatMessageBubble key={i} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            {error && lastFailedMessage && (
              <div className={styles.retryRow}>
                <button className={styles.retryBtn} onClick={handleRetry}>
                  Retry
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={styles.chatInputArea}>
            <textarea
              ref={inputRef}
              className={styles.chatInput}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about outfits, products, sizing…"
              rows={1}
              disabled={isTyping}
            />
            <button
              className={styles.chatSendBtn}
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isTyping}
              aria-label="Send message"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Toggle button ────────────────────────────────────────────── */}
      <button
        className={`${styles.toggleBtn} ${isExpanded ? styles.toggleBtnOpen : ""}`}
        onClick={() => setIsExpanded((v) => !v)}
        aria-label={isExpanded ? "Close chat" : "Open chat"}
      >
        {isExpanded ? (
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          </svg>
        )}
      </button>

      <ConfirmModal
        isOpen={showNewChatConfirm}
        onClose={() => setShowNewChatConfirm(false)}
        onConfirm={confirmNewChat}
        title="Start a new chat?"
        message="This will clear the current conversation. Do you want to proceed?"
        confirmText="Start New Chat"
        isDanger={true}
      />
    </div>
  );
}
