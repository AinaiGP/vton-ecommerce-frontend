import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleIcon } from "../common/SocialIcons";
import { registerUser } from "../../utils/authFunctions";
import { useAuth } from "../../context/AuthContext";

/* ─────────────────────────────────────────────
   RegistrationForm – Embeddable signup form
   Designed to be used inside AuthPage.
   Receives CSS module styles as a prop.
───────────────────────────────────────────── */

export default function RegistrationForm({ styles, onSwitchToLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.firstName || !formData.lastName) {
      setError("First name and last name are required.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const result = await registerUser(
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.password,
    );

    if (result.status) {
      login(
        result.data.user,
        result.data.accessToken,
        result.data.refreshToken,
        true,
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.formContent}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Create Account</h2>
        <p className={styles.formSubtitle}>
          Join AINAI and discover luxury fashion
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="signup-first-name" className={styles.label}>
              First Name
            </label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={20} />
              <input
                id="signup-first-name"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="signup-last-name" className={styles.label}>
              Last Name
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="signup-last-name"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                className={styles.input}
                required
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div className={styles.formGroup}>
          <label htmlFor="signup-email" className={styles.label}>
            Email Address
          </label>
          <div className={styles.inputWrapper}>
            <Mail className={styles.inputIcon} size={20} />
            <input
              id="signup-email"
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
          <label htmlFor="signup-password" className={styles.label}>
            Password
          </label>
          <div className={styles.inputWrapper}>
            <Lock className={styles.inputIcon} size={20} />
            <input
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
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

        {/* Confirm Password */}
        <div className={styles.formGroup}>
          <label htmlFor="signup-confirm" className={styles.label}>
            Confirm Password
          </label>
          <div className={styles.inputWrapper}>
            <Lock className={styles.inputIcon} size={20} />
            <input
              id="signup-confirm"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={styles.input}
              required
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Terms */}
        <div className={styles.termsWrapper}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" className={styles.checkbox} />
            <span>
              I agree to the{" "}
              <a href="#" className={styles.termsLink}>
                Terms &amp; Conditions
              </a>{" "}
              and{" "}
              <a href="#" className={styles.termsLink}>
                Privacy Policy
              </a>
            </span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      {error && <p className={styles.formMessageError}>{error}</p>}

      {/* Divider */}
      <div className={styles.divider}>
        <span>Or sign up with</span>
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
        Already have an account?{" "}
        <button
          type="button"
          className={styles.switchLink}
          onClick={onSwitchToLogin}
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
