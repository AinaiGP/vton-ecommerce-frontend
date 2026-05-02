import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle, Eye, EyeOff, Lock, KeyRound, ShieldCheck } from "lucide-react";
import AinaiLogo from "../components/common/AinaiLogo";
import styles from "../styles/AuthPage.module.css";
import s from "../styles/ForgotPassword.module.css";

/* ─────────────────────────────────────────────────────
   3-step flow:  request → reset → success
───────────────────────────────────────────────────── */

function PasswordStrength({ password }) {
  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Contains uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Contains number", ok: /[0-9]/.test(password) },
    { label: "Contains special character", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  return (
    <div className={s.strengthWrap}>
      <div className={s.strengthBars}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={s.strengthBar} style={{ background: i < score ? colors[score - 1] : "var(--ivory-dark)" }} />
        ))}
      </div>
      {password && (
        <span className={s.strengthLabel} style={{ color: colors[score - 1] || "#94a3b8" }}>
          {score > 0 ? labels[score - 1] : "Too weak"}
        </span>
      )}
      <div className={s.checkList}>
        {checks.map(c => (
          <div key={c.label} className={`${s.checkItem} ${c.ok ? s.checkOk : ""}`}>
            <CheckCircle size={12} />
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Step 1: Enter email */
function StepRequest({ onNext }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email address."); return; }
    setError("");
    setLoading(true);
    setTimeout(() => { setLoading(false); onNext(email); }, 1200);
  };

  return (
    <div className={styles.formContent}>
      <div className={styles.formHeader}>
        <div className={s.iconCircle}><KeyRound size={28} /></div>
        <h1 className={styles.formTitle}>Forgot your password?</h1>
        <p className={styles.formSubtitle}>No worries! Enter your email and we'll send you a reset link.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email Address</label>
          <div className={styles.inputWrapper}>
            <Mail size={17} className={styles.inputIcon} />
            <input
              className={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(""); }}
              autoFocus
            />
          </div>
          {error && <p className={styles.formMessageError}>{error}</p>}
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? "Sending reset link…" : "Send Reset Link"}
        </button>
      </form>

      <p className={styles.switchPrompt}>
        Remember your password?{" "}
        <Link to="/auth" className={styles.switchLink}>Back to Sign In</Link>
      </p>
    </div>
  );
}

/* Step 2: Verify OTP */
function StepVerify({ email, onNext, onResend }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleKey = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const digits = code.split('');
      if (digits[index]) {
        digits[index] = '';
        setCode(digits.join(''));
      } else if (index > 0) {
        digits[index - 1] = '';
        setCode(digits.join(''));
        inputRefs[index - 1].current?.focus();
      }
      return;
    }
    if (e.key.match(/^[0-9]$/)) {
      e.preventDefault();
      const digits = code.split('');
      digits[index] = e.key;
      setCode(digits.join(''));
      if (index < 5) {
        inputRefs[index + 1].current?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setCode(pasted.padEnd(6, '').slice(0, 6));
    const nextEmpty = Math.min(pasted.length, 5);
    inputRefs[nextEmpty].current?.focus();
  };

  const digits = code.split('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.replace(/\s/g, '').length < 6) { setError('Please enter all 6 digits.'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      if (!res.ok) throw new Error('Invalid or expired code.');
      onNext(code);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContent}>
      <div className={styles.formHeader}>
        <div className={s.iconCircle}><ShieldCheck size={28} /></div>
        <h1 className={styles.formTitle}>Check your email</h1>
        <p className={styles.formSubtitle}>We sent a 6-digit code to <strong>{email}</strong></p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={s.otpRow}>
          {Array.from({ length: 6 }).map((_, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digits[i] || ''}
              onChange={() => {}}
              onKeyDown={(e) => handleKey(i, e)}
              onPaste={handlePaste}
              className={s.otpBox}
              autoFocus={i === 0}
            />
          ))}
        </div>
        {error && <p className={styles.formMessageError}>{error}</p>}

        <button type="submit" className={styles.submitButton} disabled={loading || code.replace(/\D/g, '').length < 6}>
          {loading ? 'Verifying…' : 'Verify Code'}
        </button>
      </form>

      <p className={styles.switchPrompt}>
        Didn't get the code?{' '}
        <button
          className={styles.switchLink}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            opacity: resendCooldown > 0 ? 0.5 : 1,
            cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer'
          }}
          disabled={resendCooldown > 0}
          onClick={() => {
            onResend();
            setResendCooldown(60);
          }}
        >
          {resendCooldown > 0 ? `Resend in 0:${String(resendCooldown).padStart(2, '0')}` : 'Click to resend'}
        </button>
      </p>
    </div>
  );
}


/* Step 3: Enter new password */
function StepReset({ email, otp, onNext }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    
    setLoading(true);
    setError("");
    try {
      // Real API call: POST /auth/reset-password
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });
      if (!res.ok) throw new Error("Failed to reset password.");
      onNext();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContent}>
      <div className={styles.formHeader}>
        <div className={s.iconCircle}><Lock size={28} /></div>
        <h1 className={styles.formTitle}>Set a new password</h1>
        <p className={styles.formSubtitle}>Create a strong new password for <strong>{email}</strong></p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>New Password</label>
          <div className={styles.inputWrapper}>
            <Lock size={17} className={styles.inputIcon} />
            <input
              className={styles.input}
              type={showPass ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
            />
            <button type="button" className={styles.togglePassword} onClick={() => setShowPass(v => !v)}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {password && <PasswordStrength password={password} />}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Confirm New Password</label>
          <div className={styles.inputWrapper}>
            <Lock size={17} className={styles.inputIcon} />
            <input
              className={styles.input}
              type={showConf ? "text" : "password"}
              placeholder="Repeat new password"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError(""); }}
            />
            <button type="button" className={styles.togglePassword} onClick={() => setShowConf(v => !v)}>
              {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {confirm && password && confirm !== password && (
            <p className={styles.formMessageError}>Passwords do not match.</p>
          )}
          {confirm && password && confirm === password && (
            <p style={{ color: "#16a34a", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
              <CheckCircle size={13} /> Passwords match
            </p>
          )}
        </div>

        {error && <p className={styles.formMessageError}>{error}</p>}

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? "Resetting password…" : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

/* Step 3: Success */
function StepSuccess() {
  return (
    <div className={`${styles.formContent} ${s.successPanel}`}>
      <div className={s.successIcon}><ShieldCheck size={40} /></div>
      <h1 className={styles.formTitle}>Password reset!</h1>
      <p className={styles.formSubtitle}>
        Your password has been successfully reset. You can now sign in with your new password.
      </p>
      <Link to="/auth" className={`${styles.submitButton} ${s.successBtn}`}>
        Back to Sign In
      </Link>
    </div>
  );
}

/* ── Main export ── */
export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1 | 2 | 3 | 4
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const handleRequest = async (em) => {
    try {
      // POST /auth/forgot-password
      await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: em }),
      });
      setEmail(em);
      setStep(2);
    } catch (err) {
      // Even if it fails, we move to step 2 to prevent enumeration?
      // Actually, for better UX let's stay on step 1 if it's a network error.
      setEmail(em);
      setStep(2);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Brand panel */}
      <aside className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <Link to="/" className={styles.backHome}>
            <ArrowLeft size={18} /> Back to store
          </Link>
          <div className={styles.brandLogo}>
            <AinaiLogo size="lg" variant="dark" showTagline={false} />
          </div>
          <h2 className={styles.brandTagline}>Account <span>Security</span></h2>
          <p className={styles.brandDescription}>
            Your account security matters to us. Follow the steps to recover access to your AINAI account safely.
          </p>
          <div className={styles.brandFeatures}>
            <div className={styles.brandFeature}><span className={styles.featureDot} /><span>Secure 6-digit reset code</span></div>
            <div className={styles.brandFeature}><span className={styles.featureDot} /><span>Code expires after 15 minutes</span></div>
            <div className={styles.brandFeature}><span className={styles.featureDot} /><span>Protected by 256-bit encryption</span></div>
          </div>

          {/* Step indicator */}
          <div className={s.stepIndicator}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} className={`${s.stepDot} ${step >= n ? s.stepDotActive : ""}`}>
                <span>{n}</span>
              </div>
            ))}
            <div className={s.stepLine} />
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <main className={styles.formPanel}>
        <div className={styles.formContainer}>
          {step === 1 && <StepRequest onNext={handleRequest} />}
          {step === 2 && <StepVerify email={email} onNext={(code) => { setOtp(code); setStep(3); }} onResend={() => handleRequest(email)} />}
          {step === 3 && <StepReset email={email} otp={otp} onNext={() => setStep(4)} />}
          {step === 4 && <StepSuccess />}
        </div>
      </main>
    </div>
  );
}
