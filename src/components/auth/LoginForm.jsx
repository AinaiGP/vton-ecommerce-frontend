import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleIcon } from "../common/SocialIcons";
import { forgotPassword, loginUser, getRedirectPathByRole } from "../../utils/authFunctions";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

/* ─────────────────────────────────────────────
   LoginForm – Embeddable login form component
   Designed to be used inside AuthPage.
   Receives CSS module styles as a prop.
───────────────────────────────────────────── */

const decodeJwtPayload = (token) => {
  try {
    const base64 = token.split('.')[1]
      .replace(/-/g, '+').replace(/_/g, '/');
    const normalized = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4), '='
    );
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
};

export default function LoginForm({ styles, onSwitchToSignup }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    let result;
    try {
      result = await loginUser(formData.email, formData.password);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 400 || status === 404) {
        setErrorMessage("Invalid email or password. Please try again.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
      setLoading(false);
      return; // stop here, do not proceed
    }

    // only reaches here on success
    const accessToken = result?.accessToken;
    if (!accessToken) {
      setErrorMessage('Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    const payload = decodeJwtPayload(accessToken);
    const user = {
      id: payload?.sub || payload?.id || null,
      email: payload?.email || null,
      role: payload?.role || null,
      isOnboardingComplete: payload?.isOnboardingComplete ?? true,
      authProvider: payload?.authProvider,
      firstName: payload?.firstName,
      lastName: payload?.lastName,
      brandName: payload?.brandName,
      isSubscribedToNewsletter: payload?.isSubscribedToNewsletter ?? false,
    };

    if (!user.id || !user.email) {
      setErrorMessage('Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    login(user, accessToken, result.refreshToken, rememberMe);

    setLoading(false);

    if (from && from !== '/auth') {
      navigate(from, { replace: true });
    } else {
      navigate(getRedirectPathByRole(user.role), { replace: true });
    }
  };

  const handleForgotPassword = async () => {
    setForgotMessage("");
    setErrorMessage("");

    if (!formData.email) {
      setErrorMessage("Please enter your email first.");
      return;
    }

    setForgotLoading(true);
    const result = await forgotPassword(formData.email);
    if (result.status) {
      setForgotMessage("If this email exists, a reset link was sent.");
    } else {
      setErrorMessage(result.message);
    }
    setForgotLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
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
          {errorMessage && (
            <p className={styles.errorMessage}>{errorMessage}</p>
          )}
        </div>

        {/* Remember / Forgot */}
        <div className={styles.rememberForgot}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span>Remember me</span>
          </label>
          <Link to="/auth/forgot-password" className={styles.forgotLink}>
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
            window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
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
