import { useState } from "react";
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

/* Step 2: Enter new password */
function StepReset({ email, onNext }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (strength < 3) { setError("Password is too weak. Please meet more requirements."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setError("");
    setLoading(true);
    setTimeout(() => { setLoading(false); onNext(); }, 1200);
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
  const [step, setStep] = useState(1); // 1 | 2 | 3
  const [email, setEmail] = useState("");

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
            <div className={styles.brandFeature}><span className={styles.featureDot} /><span>Secure one-time reset link</span></div>
            <div className={styles.brandFeature}><span className={styles.featureDot} /><span>Link expires after 15 minutes</span></div>
            <div className={styles.brandFeature}><span className={styles.featureDot} /><span>Protected by 256-bit encryption</span></div>
          </div>

          {/* Step indicator */}
          <div className={s.stepIndicator}>
            {[1, 2, 3].map(n => (
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
          {step === 1 && <StepRequest onNext={(em) => { setEmail(em); setStep(2); }} />}
          {step === 2 && <StepReset email={email} onNext={() => setStep(3)} />}
          {step === 3 && <StepSuccess />}
        </div>
      </main>
    </div>
  );
}
