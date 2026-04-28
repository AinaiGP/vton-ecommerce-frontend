import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleIcon } from "../common/SocialIcons";
import { forgotPassword, loginUser } from "../../utils/authFunctions";
import { useAuth } from "../../context/AuthContext";

/* ─────────────────────────────────────────────
   LoginForm – Embeddable login form component
   Designed to be used inside AuthPage.
   Receives CSS module styles as a prop.
───────────────────────────────────────────── */

export default function LoginForm({ styles, onSwitchToSignup }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await loginUser(formData.email, formData.password);

    if (result.status) {
      login(
        result.data.user,
        result.data.accessToken,
        result.data.refreshToken,
      );

      const role = result.data.user?.role;
      if (role === "vendor") {
        navigate("/vendor");
      } else if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const handleForgotPassword = async () => {
    setForgotMessage("");
    setError("");

    if (!formData.email) {
      setError("Please enter your email first.");
      return;
    }

    setForgotLoading(true);
    const result = await forgotPassword(formData.email);
    if (result.status) {
      setForgotMessage("If this email exists, a reset link was sent.");
    } else {
      setError(result.message);
    }
    setForgotLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.formContent}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Welcome Back</h2>
        <p className={styles.formSubtitle}>Sign in to your AINAI account</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Email */}
        <div className={styles.formGroup}>
          <label htmlFor="login-email" className={styles.label}>
            Email Address
          </label>
          <div className={styles.inputWrapper}>
            <Mail className={styles.inputIcon} size={20} />
            <input
              id="login-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className={styles.input}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className={styles.formGroup}>
          <label htmlFor="login-password" className={styles.label}>
            Password
          </label>
          <div className={styles.inputWrapper}>
            <Lock className={styles.inputIcon} size={20} />
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={styles.input}
              required
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Remember / Forgot */}
        <div className={styles.rememberForgot}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" className={styles.checkbox} />
            <span>Remember me</span>
          </label>
          <Link
            to="/auth/forgot-password"
            className={styles.forgotLink}
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      {error && <p className={styles.formMessageError}>{error}</p>}
      {forgotMessage && (
        <p className={styles.formMessageInfo}>{forgotMessage}</p>
      )}

      {/* Divider */}
      <div className={styles.divider}>
        <span>Or continue with</span>
      </div>

      {/* Social */}
      <div className={styles.socialButtons}>
        <button
          type="button"
          className={styles.socialButton}
          onClick={() => {
            window.location.href = "http://localhost:3000/auth/google";
          }}
        >
          <GoogleIcon />
          <span>Google</span>
        </button>
      </div>

      {/* Switch prompt */}
      <p className={styles.switchPrompt}>
        Don't have an account?{" "}
        <button
          type="button"
          className={styles.switchLink}
          onClick={onSwitchToSignup}
        >
          Sign up
        </button>
      </p>
    </div>
  );
}
