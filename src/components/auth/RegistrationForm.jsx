import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleIcon } from "../common/SocialIcons";
import { registerUser } from "../../utils/authFunctions";
import { useAuth } from "../../context/AuthContext";
import ContentModal from "../common/ContentModal";
import VerificationModal from "./VerificationModal";

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
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

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
      localStorage.setItem(`lastVerificationSent_${formData.email}`, Date.now().toString());
      setRegisteredEmail(formData.email);
      setShowVerificationModal(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      // We don't login immediately because email verification is required.
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
            <input type="checkbox" className={styles.checkbox} required />
            <span>
              I agree to the{" "}
              <button
                type="button"
                className={styles.inlineLink}
                onClick={() => setShowTerms(true)}
              >
                Terms &amp; Conditions
              </button>{" "}
              and{" "}
              <button
                type="button"
                className={styles.inlineLink}
                onClick={() => setShowPrivacy(true)}
              >
                Privacy Policy
              </button>
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

      {/* Legal Modals */}
      {showPrivacy && (
        <ContentModal title="Privacy Policy" onClose={() => setShowPrivacy(false)}>
          <div style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#333' }}>
            <p><strong>Last updated: January 2026</strong></p>
            <p>At AINAI, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our platform.</p>
            
            <h3 style={{ fontSize: '1rem', marginTop: '1.25rem', marginBottom: '0.5rem', color: '#1a1a1a' }}>What data we collect</h3>
            <ul>
              <li><strong>Personal Information:</strong> Name, email address, shipping address, and phone number.</li>
              <li><strong>Payment Information:</strong> Processed securely via Stripe.</li>
              <li><strong>Browsing Behavior:</strong> Pages viewed, products searched, and interaction data.</li>
              <li><strong>Virtual Try-On Photos:</strong> Photos you upload for the Virtual Try-On feature.</li>
            </ul>

            <h3 style={{ fontSize: '1rem', marginTop: '1.25rem', marginBottom: '0.5rem', color: '#1a1a1a' }}>How we use your data</h3>
            <p>We use your information to process orders, personalize your shopping experience, and improve our AI features.</p>

            <h3 style={{ fontSize: '1rem', marginTop: '1.25rem', marginBottom: '0.5rem', color: '#1a1a1a' }}>Data storage and security</h3>
            <p>Your data is encrypted and stored securely on Amazon Web Services (AWS).</p>

            <h3 style={{ fontSize: '1rem', marginTop: '1.25rem', marginBottom: '0.5rem', color: '#1a1a1a' }}>Virtual Try-On Photos</h3>
            <p>Photos uploaded for Virtual Try-On are processed in real-time. These photos are not stored permanently unless you save them to your wardrobe.</p>

            <h3 style={{ fontSize: '1rem', marginTop: '1.25rem', marginBottom: '0.5rem', color: '#1a1a1a' }}>Contact</h3>
            <p>For any privacy-related inquiries, please contact us at <a href="mailto:ainai.egy@outlook.com">ainai.egy@outlook.com</a>.</p>
          </div>
        </ContentModal>
      )}

      {showTerms && (
        <ContentModal title="Terms of Service" onClose={() => setShowTerms(false)}>
          <div style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#333' }}>
            <p><strong>Last updated: January 2026</strong></p>
            
            <h3 style={{ fontSize: '1rem', marginTop: '1.25rem', marginBottom: '0.5rem', color: '#1a1a1a' }}>1. Acceptance of terms</h3>
            <p>By accessing or using the AINAI platform, you agree to be bound by these Terms of Service and all applicable laws in the Arab Republic of Egypt.</p>

            <h3 style={{ fontSize: '1rem', marginTop: '1.25rem', marginBottom: '0.5rem', color: '#1a1a1a' }}>2. Account responsibilities</h3>
            <p>You are responsible for maintaining the confidentiality of your account credentials.</p>

            <h3 style={{ fontSize: '1rem', marginTop: '1.25rem', marginBottom: '0.5rem', color: '#1a1a1a' }}>3. Prohibited conduct</h3>
            <p>Users are prohibited from engaging in fraudulent activities or unauthorized scraping.</p>

            <h3 style={{ fontSize: '1rem', marginTop: '1.25rem', marginBottom: '0.5rem', color: '#1a1a1a' }}>4. Virtual Try-On feature</h3>
            <p>The Virtual Try-On feature is provided for illustrative purposes. Uploaded photos are used solely for generating the preview.</p>

            <h3 style={{ fontSize: '1rem', marginTop: '1.25rem', marginBottom: '0.5rem', color: '#1a1a1a' }}>5. Governing law</h3>
            <p>These terms are governed by the laws of the Arab Republic of Egypt.</p>

            <h3 style={{ fontSize: '1rem', marginTop: '1.25rem', marginBottom: '0.5rem', color: '#1a1a1a' }}>6. Contact</h3>
            <p>For questions regarding these terms, please contact us at <a href="mailto:ainai.egy@outlook.com">ainai.egy@outlook.com</a>.</p>
          </div>
        </ContentModal>
      )}

      {showVerificationModal && (
        <VerificationModal 
          email={registeredEmail} 
          onClose={() => {
            setShowVerificationModal(false);
            onSwitchToLogin();
          }} 
        />
      )}
    </div>
  );
}
