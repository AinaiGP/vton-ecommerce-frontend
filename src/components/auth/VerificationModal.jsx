import { Mail, RefreshCw, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import ContentModal from "../common/ContentModal";
import { resendVerificationEmail } from "../../utils/authFunctions";

export default function VerificationModal({ email, onClose, autoSend = false }) {
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [hasAutoSent, setHasAutoSent] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize countdown from localStorage on mount
    const lastSentStr = localStorage.getItem(`lastVerificationSent_${email}`);
    let initialCountdown = 0;
    if (lastSentStr) {
      const lastSentTime = parseInt(lastSentStr, 10);
      const elapsed = Date.now() - lastSentTime;
      if (elapsed < 60000) {
        initialCountdown = Math.ceil((60000 - elapsed) / 1000);
      }
    }
    
    // If not auto-sending and no timer is active, default to 60s for registration flow
    if (!autoSend && initialCountdown === 0) {
      initialCountdown = 60;
    }
    
    setCountdown(initialCountdown);
    setIsInitialized(true);
  }, [email, autoSend]);

  useEffect(() => {
    if (isInitialized && autoSend && !hasAutoSent) {
      setHasAutoSent(true);
      // Only auto-send if the cooldown has expired
      if (countdown === 0) {
        handleResend(true);
      }
    }
  }, [autoSend, hasAutoSent, isInitialized, countdown]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async (isAuto = false) => {
    if (isAuto !== true && countdown > 0) return;
    setLoading(true);
    setMessage("");
    setError("");

    const result = await resendVerificationEmail(email);
    if (result.status) {
      setMessage(isAuto === true ? "A new verification email has been sent to your inbox." : "Verification email has been resent successfully!");
      setCountdown(60);
      localStorage.setItem(`lastVerificationSent_${email}`, Date.now().toString());
    } else {
      setError(result.message || "Failed to send email. Please try again.");
    }
    setLoading(false);
  };

  return (
    <ContentModal title="Verify Your Email" onClose={onClose}>
      <div style={{ textAlign: "center", padding: "1rem 0" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          width: 64, 
          height: 64, 
          background: "#f0fdf4", 
          color: "#16a34a", 
          borderRadius: "50%", 
          margin: "0 auto 1.5rem" 
        }}>
          <Mail size={32} />
        </div>
        
        <h3 style={{ fontSize: "1.25rem", color: "#1a1a1a", marginBottom: "0.5rem", fontWeight: "700" }}>
          Check your inbox
        </h3>
        
        <p style={{ color: "#444", fontSize: "0.95rem", marginBottom: "2rem", lineHeight: 1.6 }}>
          We've sent a verification link to <strong style={{ color: "#1a1a1a" }}>{email}</strong>. 
          Please click the link to verify your account and continue.
        </p>

        {message && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#16a34a", background: "#f0fdf4", padding: "0.75rem", borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            <CheckCircle size={16} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div style={{ color: "#dc2626", background: "#fef2f2", padding: "0.75rem", borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        <button 
          onClick={handleResend}
          disabled={countdown > 0 || loading}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            width: "100%",
            padding: "0.875rem",
            background: countdown > 0 ? "#f5f5f5" : "#1a1a1a",
            color: countdown > 0 ? "#999" : "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "0.95rem",
            fontWeight: "600",
            cursor: countdown > 0 ? "not-allowed" : "pointer",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => {
            if (countdown === 0 && !loading) {
              e.currentTarget.style.background = "#333";
            }
          }}
          onMouseOut={(e) => {
            if (countdown === 0 && !loading) {
              e.currentTarget.style.background = "#1a1a1a";
            }
          }}
        >
          <RefreshCw size={18} className={loading ? "spin" : ""} />
          {loading ? "Sending..." : countdown > 0 ? `Resend email in ${countdown}s` : "Resend verification email"}
        </button>

        <style>
          {`
            .spin {
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </ContentModal>
  );
}
