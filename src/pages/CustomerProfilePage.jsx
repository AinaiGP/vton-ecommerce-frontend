import { useEffect, useRef, useState } from "react";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Camera,
  Eye,
  EyeOff,
  Plus,
  Pencil,
  Trash2,
  Check,
  Star,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Images,
  Zap,
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../context/SubscriptionContext";
import apiClient, { multipartClient } from "../utils/apiClient";
import styles from "../styles/CustomerProfile.module.css";
import OTPVerificationModal from "../components/common/OTPVerificationModal";
import CancelSubscriptionModal from "../components/modal/CancelSubscriptionModal";
import { useNavigate, Link } from "react-router-dom";

/* ─── Password strength ─── */
function StrengthMeter({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  return (
    <div className={styles.strBars}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={styles.strBar}
          style={{
            background: i < score ? colors[score - 1] : "var(--ivory-dark)",
          }}
        />
      ))}
    </div>
  );
}


/* ─── Phone Modal ─── */
function PhoneModal({ initial, onSave, onClose }) {
  const [number, setNumber] = useState(initial?.phoneNumber || "");
  const [isPrimary, setIsPrimary] = useState(initial?.isPrimary || false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave({ phoneNumber: number, isPrimary });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h2 className={styles.modalTitle}>
            {initial ? "Edit Phone Number" : "Add Phone Number"}
          </h2>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={17} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Phone Number</label>
            <input
              className={styles.input}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="+20 100 000 0000"
            />
          </div>
          <div
            className={styles.checkRow}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 8,
            }}
          >
            <input
              type="checkbox"
              id="primaryPhone"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
            />
            <label
              htmlFor="primaryPhone"
              style={{ fontSize: 14, cursor: "pointer" }}
            >
              Set as primary number
            </label>
          </div>
        </div>
        <div className={styles.modalFoot}>
          <button
            className={`${styles.btn} ${styles.btnOutline}`}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleSubmit}
            disabled={!number.trim() || loading}
          >
            {loading ? (
              <Loader2 size={14} className={styles.spin} />
            ) : (
              <Check size={14} />
            )}{" "}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Address Modal ─── */
function AddressModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(
    initial || { label: "", street: "", city: "", isPrimary: false },
  );
  const [loading, setLoading] = useState(false);

  const f = (k) => ({
    value: form[k],
    onChange: (e) => setForm({ ...form, [k]: e.target.value }),
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h2 className={styles.modalTitle}>
            {initial ? "Edit Address" : "Add Address"}
          </h2>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={17} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Label (e.g. Home)</label>
            <input
              className={styles.input}
              {...f("label")}
              placeholder="Home / Work…"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Street Address</label>
            <input
              className={styles.input}
              {...f("street")}
              placeholder="123 Street Name, Apt 4B"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>City</label>
            <input
              className={styles.input}
              {...f("city")}
              placeholder="Cairo"
            />
          </div>
          <div
            className={styles.checkRow}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 8,
            }}
          >
            <input
              type="checkbox"
              id="primaryAddr"
              checked={form.isPrimary}
              onChange={(e) =>
                setForm({ ...form, isPrimary: e.target.checked })
              }
            />
            <label
              htmlFor="primaryAddr"
              style={{ fontSize: 14, cursor: "pointer" }}
            >
              Set as primary address
            </label>
          </div>
        </div>
        <div className={styles.modalFoot}>
          <button
            className={`${styles.btn} ${styles.btnOutline}`}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleSubmit}
            disabled={!form.street.trim() || !form.city.trim() || loading}
          >
            {loading ? (
              <Loader2 size={14} className={styles.spin} />
            ) : (
              <Check size={14} />
            )}{" "}
            Save Address
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Tabs ─── */
const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "phones", label: "Phones", icon: Phone },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "photos", label: "My Photos", icon: Images },
  { id: "subscription", label: "Subscription", icon: Zap },
];

/* ─── Main page ─── */
export default function CustomerProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const { subscription, isPro, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const photoInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("profile");
  const [photoURL, setPhotoURL] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  /* Profile */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [showVerify, setShowVerify] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  /* Security */
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confPass, setConfPass] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);

  /* Phones */
  const [phones, setPhones] = useState([]);
  const [phoneModal, setPhoneModal] = useState(null);
  const [phoneError, setPhoneError] = useState('');

  /* Addresses */
  const [addresses, setAddresses] = useState([]);
  const [addrModal, setAddrModal] = useState(null);

  /* Photos */
  const [profilePhotos, setProfilePhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [photoUploadLoading, setPhotoUploadLoading] = useState(false);

  /* Subscription */
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingSub, setCancellingSub] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Sync profilePhotos from fetched profile data
  useEffect(() => {
    if (profilePhotos !== undefined) {
      /* already updated via fetchProfile */
    }
  }, [profilePhotos]);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get("/customers/profile");
      const c = res.data;
      setFirstName(c.firstName || "");
      setLastName(c.lastName || "");
      setEmail(user?.email || "");
      setGender(c.gender || "");
      setPhones(c.phoneNumbers || []);
      setAddresses(c.shippingAddresses || []);
      // FIX 4B: store all profile photos
      const photos = c.profilePhotos || [];
      setProfilePhotos(photos);
      if (photos.length > 0) {
        setPhotoURL(photos[0].s3Url);
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const showAlert = (type, text) => {
    setAlert({ type, text });
    setTimeout(() => setAlert(null), 3500);
  };

  /* Photo upload (header avatar) */
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await multipartClient.post(
        "/customers/profile/photos",
        formData,
      );
      const newUrl = res.data.s3Url;
      setPhotoURL(newUrl);
      // FIX 4A: Write to localStorage so Header avatar updates immediately
      localStorage.setItem('ainai_profile_photo', newUrl);
      updateUser({ primaryPhotoUrl: newUrl });
      showAlert("success", "Profile photo updated!");
      fetchProfile();
    } catch (err) {
      showAlert("error", "Failed to upload photo.");
    } finally {
      setLoading(false);
    }
  };

  /* FIX 4B: Add profile photo (Photos tab) */
  const handleTabPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (profilePhotos.length >= 5) {
      showAlert('error', 'Maximum 5 photos reached.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      setPhotoUploadLoading(true);
      const res = await multipartClient.post('/customers/profile/photos', formData);
      const newUrl = res.data.s3Url;
      // If this is the first photo, update the header avatar
      if (profilePhotos.length === 0) {
        setPhotoURL(newUrl);
        localStorage.setItem('ainai_profile_photo', newUrl);
        updateUser({ primaryPhotoUrl: newUrl });
      }
      showAlert('success', 'Photo added!');
      fetchProfile();
    } catch (err) {
      showAlert('error', 'Failed to upload photo.');
    } finally {
      setPhotoUploadLoading(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  /* FIX 4B: Delete profile photo */
  const handleDeletePhoto = async (photoId, photoUrl) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await apiClient.delete(`/customers/profile/photos/${photoId}`);
      const remaining = profilePhotos.filter((p) => p.id !== photoId);
      // If deleted photo was the displayed avatar, update to next available
      if (photoURL === photoUrl) {
        const nextUrl = remaining[0]?.s3Url || null;
        setPhotoURL(nextUrl);
        if (nextUrl) {
          localStorage.setItem('ainai_profile_photo', nextUrl);
          updateUser({ primaryPhotoUrl: nextUrl });
        } else {
          localStorage.removeItem('ainai_profile_photo');
          updateUser({ primaryPhotoUrl: null });
        }
      }
      showAlert('success', 'Photo deleted.');
      fetchProfile();
    } catch (err) {
      showAlert('error', 'Failed to delete photo.');
    }
  };

  const handleSetPrimaryPhoto = async (photo) => {
    try {
      await apiClient.patch(`/customers/profile/photos/${photo.id}/primary`);
      setPhotoURL(photo.s3Url);
      updateUser({ primaryPhotoUrl: photo.s3Url });
      showAlert('success', 'Primary photo updated.');
      fetchProfile();
    } catch (err) {
      showAlert('error', 'Failed to update primary photo.');
    }
  };

  const getInitials = () => {
    const f = firstName || user?.firstName || "";
    const l = lastName || user?.lastName || "";
    if (f || l) return (f[0] || "") + (l[0] || "");
    return (user?.email?.[0] || "?").toUpperCase();
  };

  /* Save profile */
  const saveProfile = async () => {
    setLoading(true);
    try {
      const payload = { firstName, lastName, gender };
      if (email !== user?.email) {
        payload.newEmail = email;
      }
      const res = await apiClient.patch("/customers/profile", payload);

      updateUser({ firstName, lastName, gender });

      if (email !== user?.email) {
        setPendingEmail(email);
        setShowVerify(true);
        showAlert("info", res.data.message);
      } else {
        showAlert("success", "Profile updated successfully!");
      }
    } catch (err) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to update profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (otpCode) => {
    await apiClient.post("/customers/profile/verify-email-change", {
      otp: otpCode,
    });
    setShowVerify(false);
    // FIX 2: Force logout — backend invalidates tokens on email change
    showAlert("success", "Email updated. Please log in again.");
    setTimeout(async () => {
      await logout();
      navigate('/auth');
    }, 1500);
  };

  const handleResendEmailOTP = async () => {
    try {
      await apiClient.patch("/customers/profile", { newEmail: pendingEmail });
      showAlert("success", "Verification code resent!");
    } catch (err) {
      showAlert("error", "Failed to resend verification code.");
    }
  };

  /* Save password */
  const savePassword = async () => {
    if (!oldPass) {
      showAlert("error", "Please enter your current password.");
      return;
    }
    if (newPass.length < 8) {
      showAlert("error", "New password must be at least 8 characters.");
      return;
    }
    if (newPass !== confPass) {
      showAlert("error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await apiClient.patch("/customers/profile", {
        changePassword: { currentPassword: oldPass, newPassword: newPass },
      });
      setOldPass("");
      setNewPass("");
      setConfPass("");
      // FIX 2: Force logout — backend invalidates tokens on password change
      showAlert("success", "Password updated. Please log in again.");
      setTimeout(async () => {
        await logout();
        navigate('/auth');
      }, 1500);
    } catch (err) {
      showAlert(
        "error",
        err.response?.data?.message || "Failed to change password.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* Phones */
  const handlePhoneSave = async (data) => {
    setPhoneError('');
    try {
      if (phoneModal === "add") {
        await apiClient.post("/customers/profile/phone-numbers", data);
      } else {
        await apiClient.patch(
          `/customers/profile/phone-numbers/${phoneModal.id}`,
          data,
        );
      }
      setPhoneModal(null);
      setPhoneError('');
      fetchProfile();
      showAlert("success", "Phone number saved!");
    } catch (err) {
      // FIX 6: Show specific duplicate error message
      const backendMessage = err?.response?.data?.message;
      const status = err?.response?.status;
      let msg;
      if (
        status === 409 ||
        (typeof backendMessage === 'string' && backendMessage.toLowerCase().includes('duplicate')) ||
        (typeof backendMessage === 'string' && backendMessage.toLowerCase().includes('already'))
      ) {
        msg = 'This phone number is already saved to your account.';
      } else if (Array.isArray(backendMessage)) {
        msg = backendMessage.join(', ');
      } else {
        msg = backendMessage || 'Failed to save phone number.';
      }
      setPhoneError(msg);
    }
  };

  const deletePhone = async (id) => {
    if (!window.confirm("Remove this phone number?")) return;
    try {
      await apiClient.delete(`/customers/profile/phone-numbers/${id}`);
      fetchProfile();
      showAlert("success", "Phone number removed.");
    } catch (err) {
      showAlert("error", "Failed to remove phone number.");
    }
  };

  const setDefaultPhone = async (id) => {
    try {
      await apiClient.patch(`/customers/profile/phone-numbers/${id}`, {
        isPrimary: true,
      });
      fetchProfile();
    } catch (err) {
      showAlert("error", "Failed to set primary phone.");
    }
  };

  /* Addresses */
  const handleAddrSave = async (data) => {
    try {
      if (addrModal === "add") {
        // FIX 5: correct endpoint is /addresses not /shipping-addresses
        await apiClient.post("/customers/profile/addresses", data);
      } else {
        await apiClient.patch(
          `/customers/profile/addresses/${addrModal.id}`,
          data,
        );
      }
      setAddrModal(null);
      fetchProfile();
      showAlert("success", "Address saved!");
    } catch (err) {
      const msg = err?.response?.data?.message;
      showAlert("error", Array.isArray(msg) ? msg.join(', ') : (msg || "Failed to save address."));
    }
  };

  const deleteAddress = async (id) => {
    if (!window.confirm("Remove this address?")) return;
    try {
      // FIX 5: correct endpoint
      await apiClient.delete(`/customers/profile/addresses/${id}`);
      fetchProfile();
      showAlert("success", "Address removed.");
    } catch (err) {
      showAlert("error", "Failed to remove address.");
    }
  };

  const setDefaultAddr = async (id) => {
    try {
      // FIX 5: correct endpoint
      await apiClient.patch(`/customers/profile/addresses/${id}`, {
        isPrimary: true,
      });
      fetchProfile();
    } catch (err) {
      showAlert("error", "Failed to set primary address.");
    }
  };

  /* Subscription Functions */
  const handleCancelSubscription = async () => {
    setCancellingSub(true);
    try {
      await apiClient.post("/subscriptions/cancel");
      await refreshSubscription();
      setShowCancelModal(false);
      showAlert("success", "Subscription cancelled. You will retain access until the end of your billing cycle.");
    } catch (err) {
      console.error("Failed to cancel subscription", err);
      showAlert("error", "An error occurred while cancelling your subscription.");
    } finally {
      setCancellingSub(false);
    }
  };

  const handleResumeSubscription = async () => {
    setCancellingSub(true);
    try {
      await apiClient.post("/subscriptions/resume");
      await refreshSubscription();
      showAlert("success", "Subscription resumed successfully.");
    } catch (err) {
      console.error("Failed to resume subscription", err);
      showAlert("error", "An error occurred while resuming your subscription.");
    } finally {
      setCancellingSub(false);
    }
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.pageHead}>
          <h1 className={styles.pageTitle}>My Profile</h1>
          <p className={styles.pageSub}>
            Manage your personal information, security and saved details.
          </p>
        </div>

        {/* Photo hero */}
        <div className={styles.photoHero}>
          <div className={styles.avatarWrap}>
            {photoURL ? (
              <img src={photoURL} alt="Profile" className={styles.avatarImg} />
            ) : (
              <div className={styles.avatarInitials}>{getInitials()}</div>
            )}
            <div
              className={styles.avatarOverlay}
              onClick={() => !loading && fileRef.current?.click()}
            >
              {loading ? (
                <Loader2 size={18} className={styles.spin} />
              ) : (
                <Camera size={18} />
              )}
              <br />
              Change Photo
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoChange}
              disabled={loading}
            />
          </div>
          <div className={styles.photoInfo}>
            <p className={styles.photoName}>
              {firstName || user?.firstName || "Your Name"}{" "}
              {lastName || user?.lastName || ""}
            </p>
            <p className={styles.photoEmail}>{email || user?.email}</p>
            <button
              className={styles.photoUploadBtn}
              onClick={() => fileRef.current?.click()}
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={14} className={styles.spin} />
              ) : (
                <Camera size={14} />
              )}{" "}
              Upload Photo
            </button>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <div
            className={`${styles.alert} ${alert.type === "success" ? styles.alertSuccess : alert.type === "error" ? styles.alertError : styles.alertInfo}`}
            style={{ marginBottom: 16 }}
          >
            {alert.type === "success" ? (
              <CheckCircle size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            {alert.text}
          </div>
        )}

        {/* Tabs */}
        <div className={styles.tabBar}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabActive : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={15} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Profile Tab ── */}
        {activeTab === "profile" && (
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Personal Information</h2>
              <p className={styles.panelSub}>
                Update your display name and email address.
              </p>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>First Name</label>
                  <input
                    className={styles.input}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Sara"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Last Name</label>
                  <input
                    className={styles.input}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Al-Rashid"
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Gender</label>
                  <select
                    className={styles.select}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    className={styles.input}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className={styles.saveRow}>
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={saveProfile}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 size={14} className={styles.spin} />
                  ) : (
                    <Check size={14} />
                  )}{" "}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Security Tab ── */}
        {activeTab === "security" && (
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Change Password</h2>
              <p className={styles.panelSub}>
                Use a strong password with at least 8 characters.
              </p>
            </div>
            <div className={styles.panelBody}>
              {/* Current password */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Current Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    className={styles.input}
                    type={showOld ? "text" : "password"}
                    value={oldPass}
                    onChange={(e) => setOldPass(e.target.value)}
                    placeholder="Enter current password"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--charcoal-muted)",
                    }}
                    onClick={() => setShowOld((v) => !v)}
                  >
                    {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {/* New password */}
              <div className={styles.formGroup}>
                <label className={styles.label}>New Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    className={styles.input}
                    type={showNew ? "text" : "password"}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="New password"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--charcoal-muted)",
                    }}
                    onClick={() => setShowNew((v) => !v)}
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {newPass && <StrengthMeter password={newPass} />}
              </div>
              {/* Confirm password */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm New Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    className={styles.input}
                    type={showConf ? "text" : "password"}
                    value={confPass}
                    onChange={(e) => setConfPass(e.target.value)}
                    placeholder="Repeat new password"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--charcoal-muted)",
                    }}
                    onClick={() => setShowConf((v) => !v)}
                  >
                    {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confPass && newPass && confPass !== newPass && (
                  <span style={{ fontSize: 12, color: "#dc2626" }}>
                    Passwords do not match
                  </span>
                )}
                {confPass && newPass && confPass === newPass && (
                  <span style={{ fontSize: 12, color: "#16a34a" }}>
                    ✓ Passwords match
                  </span>
                )}
              </div>
              <div className={styles.saveRow}>
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={savePassword}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 size={14} className={styles.spin} />
                  ) : (
                    <Lock size={14} />
                  )}{" "}
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Phones Tab ── */}
        {activeTab === "phones" && (
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Phone Numbers</h2>
              <p className={styles.panelSub}>
                Manage phone numbers for order notifications and delivery
                contact.
              </p>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.entryList}>
                {phones.length === 0 && (
                  <p className={styles.emptyText}>No data yet.</p>
                )}
                {phones.map((ph) => (
                  <div
                    key={ph.id}
                    className={`${styles.entryCard} ${ph.isPrimary ? styles.entryDefault : ""}`}
                  >
                    <div className={styles.entryIcon}>
                      <Phone size={16} />
                    </div>
                    <div className={styles.entryBody}>
                      <p className={styles.entryMain}>{ph.phoneNumber}</p>
                      <p className={styles.entrySub}>Verified Phone Number</p>
                      {ph.isPrimary && (
                        <span className={styles.defaultBadge}>
                          <Star size={9} /> Primary
                        </span>
                      )}
                    </div>
                    <div className={styles.entryActions}>
                      {!ph.isPrimary && (
                        <button
                          className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                          onClick={() => setDefaultPhone(ph.id)}
                        >
                          Set Primary
                        </button>
                      )}
                      <button
                        className={styles.btnGhost}
                        onClick={() => setPhoneModal({ id: ph.id, ...ph })}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className={`${styles.btnGhost}`}
                        style={{ color: "#dc2626" }}
                        onClick={() => deletePhone(ph.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  className={styles.addEntryBtn}
                  onClick={() => setPhoneModal("add")}
                >
                  <Plus size={16} /> Add Phone Number
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Phone error display inside Phone tab ── */}
        {activeTab === "phones" && phoneError && (
          <div
            className={`${styles.alert} ${styles.alertError}`}
            style={{ marginTop: -8, marginBottom: 8 }}
          >
            <AlertCircle size={16} />
            {phoneError}
          </div>
        )}

        {/* ── Addresses Tab ── */}
        {activeTab === "addresses" && (
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Saved Addresses</h2>
              <p className={styles.panelSub}>
                Manage delivery addresses for fast checkout.
              </p>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.entryList}>
                {addresses.length === 0 && (
                  <p className={styles.emptyText}>No data yet.</p>
                )}
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`${styles.entryCard} ${addr.isPrimary ? styles.entryDefault : ""}`}
                  >
                    <div className={styles.entryIcon}>
                      <MapPin size={16} />
                    </div>
                    <div className={styles.entryBody}>
                      <p className={styles.entryMain}>
                        {addr.label || "Address"}
                      </p>
                      <p className={styles.entrySub}>
                        {addr.street}, {addr.city}
                      </p>
                      {addr.isPrimary && (
                        <span className={styles.defaultBadge}>
                          <Star size={9} /> Primary
                        </span>
                      )}
                    </div>
                    <div className={styles.entryActions}>
                      {!addr.isPrimary && (
                        <button
                          className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                          onClick={() => setDefaultAddr(addr.id)}
                        >
                          Set Primary
                        </button>
                      )}
                      <button
                        className={styles.btnGhost}
                        onClick={() => setAddrModal({ id: addr.id, ...addr })}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className={styles.btnGhost}
                        style={{ color: "#dc2626" }}
                        onClick={() => deleteAddress(addr.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  className={styles.addEntryBtn}
                  onClick={() => setAddrModal("add")}
                >
                  <Plus size={16} /> Add New Address
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Photos Tab ── */}
        {activeTab === "photos" && (
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>My Photos</h2>
              <p className={styles.panelSub}>
                Manage your profile photos (up to 5). The first photo is used as your avatar.
              </p>
            </div>
            <div className={styles.panelBody}>
              {/* Photo grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 16, marginBottom: 20 }}>
                {profilePhotos.map((photo, idx) => (
                  <div key={photo.id} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: photo.isPrimary ? '2px solid var(--burgundy)' : '2px solid var(--ivory-dark)', aspectRatio: '1' }}>
                    <img
                      src={photo.s3Url}
                      alt={`Profile photo ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    {photo.isPrimary && (
                      <span style={{ position: 'absolute', top: 6, left: 6, background: 'var(--burgundy)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99 }}>
                        Primary
                      </span>
                    )}
                    {!photo.isPrimary && (
                      <button
                        onClick={() => handleSetPrimaryPhoto(photo)}
                        style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.9)', border: '1px solid var(--ivory-dark)', borderRadius: 20, padding: '4px 8px', fontSize: 10, fontWeight: 600, color: 'var(--charcoal)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePhoto(photo.id, photo.s3Url)}
                      style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(220,38,38,0.85)', border: 'none', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
                      title="Delete photo"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}

                {profilePhotos.length < 5 && (
                  <div
                    onClick={() => !photoUploadLoading && photoInputRef.current?.click()}
                    style={{ borderRadius: 12, border: '2px dashed var(--ivory-dark)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: photoUploadLoading ? 'wait' : 'pointer', aspectRatio: '1', gap: 8, color: 'var(--charcoal-muted)', transition: 'border-color 0.15s' }}
                    title="Add photo"
                  >
                    {photoUploadLoading ? (
                      <Loader2 size={22} className={styles.spin} />
                    ) : (
                      <>
                        <Plus size={22} />
                        <span style={{ fontSize: 12, fontWeight: 600 }}>Add Photo</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {profilePhotos.length >= 5 && (
                <p style={{ fontSize: 13, color: 'var(--charcoal-muted)', marginBottom: 12 }}>Maximum 5 photos reached.</p>
              )}

              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleTabPhotoUpload}
                disabled={photoUploadLoading}
              />
            </div>
          </div>
        )}

        {/* ── Subscription Tab ── */}
        {activeTab === "subscription" && (
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Subscription Details</h2>
              <p className={styles.panelSub}>
                Manage your AINAI Pro subscription and billing.
              </p>
            </div>
            <div className={styles.panelBody}>
              {!isPro ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <Zap size={48} style={{ color: "var(--gold)", marginBottom: 16 }} />
                  <h3 style={{ fontSize: 20, marginBottom: 8, fontFamily: "var(--font-serif)" }}>Unlock AINAI Pro</h3>
                  <p style={{ color: "var(--charcoal-muted)", marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
                    Get access to unlimited Virtual Try-Ons, priority support, and premium AI features.
                  </p>
                  <Link to="/subscribe" className={`${styles.btn} ${styles.btnPrimary}`}>
                    Upgrade to Pro
                  </Link>
                </div>
              ) : (
                <div className={styles.subCard} style={{ background: "rgba(0,0,0,0.02)", padding: 24, borderRadius: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ background: "rgba(212, 163, 115, 0.2)", padding: 12, borderRadius: 12, color: "var(--gold)" }}>
                        <Zap size={24} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>AINAI Pro</h3>
                        <span style={{ fontSize: 13, color: "var(--charcoal-muted)" }}>
                          {subscription?.isCancelled ? "Cancels at end of billing cycle" : "Active (Renews monthly)"}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>
                      200 EGP<span style={{ fontSize: 14, color: "var(--charcoal-muted)", fontWeight: 400 }}>/mo</span>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid var(--ivory-dark)", borderBottom: "1px solid var(--ivory-dark)", padding: "16px 0", marginBottom: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ color: "var(--charcoal-muted)" }}>Current Period Ends:</span>
                      <strong style={{ color: "var(--charcoal)" }}>{new Date(subscription?.expiresAt).toLocaleDateString()}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--charcoal-muted)" }}>Status:</span>
                      <strong style={{ color: subscription?.isCancelled ? "#ef4444" : "#22c55e" }}>
                        {subscription?.isCancelled ? "Canceled" : "Active"}
                      </strong>
                    </div>
                  </div>

                  {!subscription?.isCancelled ? (
                    <div>
                      <button 
                        className={`${styles.btn}`} 
                        onClick={() => setShowCancelModal(true)}
                        disabled={cancellingSub}
                        style={{ width: "100%", background: "transparent", color: "#ef4444", border: "1.5px solid #ef4444" }}
                      >
                        {cancellingSub ? "Processing..." : "Cancel Subscription"}
                      </button>
                      <p style={{ fontSize: 13, color: "var(--charcoal-muted)", textAlign: "center", marginTop: 12 }}>
                        You will retain Pro features until the end of your billing cycle.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <button 
                        className={`${styles.btn} ${styles.btnPrimary}`} 
                        onClick={handleResumeSubscription}
                        disabled={cancellingSub}
                        style={{ width: "100%" }}
                      >
                        {cancellingSub ? "Processing..." : "Resume Subscription"}
                      </button>
                      <p style={{ fontSize: 13, color: "var(--charcoal-muted)", textAlign: "center", marginTop: 12 }}>
                        Your subscription will continue without interruption.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {phoneModal !== null && (
        <PhoneModal
          initial={
            phoneModal !== "add"
              ? phones.find((p) => p.id === phoneModal.id)
              : null
          }
          onSave={handlePhoneSave}
          onClose={() => setPhoneModal(null)}
        />
      )}
      {addrModal !== null && (
        <AddressModal
          initial={
            addrModal !== "add"
              ? addresses.find((a) => a.id === addrModal.id)
              : null
          }
          onSave={handleAddrSave}
          onClose={() => setAddrModal(null)}
        />
      )}
      {showVerify && (
        <OTPVerificationModal
          isOpen={showVerify}
          email={pendingEmail}
          onVerify={handleVerifyEmail}
          onResend={handleResendEmailOTP}
          onClose={() => setShowVerify(false)}
        />
      )}

      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        isCancelling={cancellingSub}
        expiryDate={subscription?.expiresAt}
      />

      <Footer />
    </div>
  );
}
