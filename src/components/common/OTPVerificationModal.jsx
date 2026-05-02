import { useState, useEffect, useRef } from "react";
import { X, ShieldCheck, Mail, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import styles from "../../styles/OTPModal.module.css";

/**
 * A premium, reusable 6-digit OTP verification modal.
 * 
 * @param {string} email - The email address the code was sent to.
 * @param {Function} onVerify - Callback function(otp) to verify the code.
 * @param {Function} onClose - Callback to close the modal.
 * @param {string} title - Optional title (defaults to "Verify your email").
 * @param {string} subtitle - Optional subtitle.
 */
export default function OTPVerificationModal({ 
  email, 
  onVerify, 
  onClose,
  onResend,
  title = "Verify Security Code",
  subtitle = "We've sent a 6-digit verification code to"
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60); // 60 seconds resend cooldown
  const inputs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputs.current[0]) inputs.current[0].focus();

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only numbers
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (!pasteData.every(char => /^\d$/.test(char))) return;

    const newOtp = [...otp];
    pasteData.forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    
    // Focus last filled or next empty
    const nextIndex = Math.min(pasteData.length, 5);
    inputs.current[nextIndex].focus();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onVerify(code);
    } catch (err) {
      setError(err?.message || "Invalid verification code. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>

        <div className={styles.header}>
          <div className={styles.iconCircle}>
            <ShieldCheck size={32} />
          </div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>
            {subtitle} <br />
            <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.otpGrid}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className={`${styles.otpInput} ${error ? styles.otpInputError : ""}`}
                disabled={loading}
              />
            ))}
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            className={styles.submitBtn} 
            disabled={loading || otp.some(d => d === "")}
          >
            {loading ? "Verifying..." : "Verify Code"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className={styles.footer}>
          <p>Didn't receive the code?</p>
          {timer > 0 ? (
            <span className={styles.timer}>Resend in {timer}s</span>
          ) : (
            <button 
              className={styles.resendBtn} 
              disabled={loading}
              onClick={() => {
                if (onResend) onResend();
                setTimer(60);
              }}
            >
              Resend Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
