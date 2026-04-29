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
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/CustomerProfile.module.css";

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
  const [number, setNumber] = useState(initial?.number || "");
  const [label, setLabel] = useState(initial?.label || "Mobile");
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
            <label className={styles.label}>Label</label>
            <select
              className={styles.select}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            >
              <option>Mobile</option>
              <option>Home</option>
              <option>Work</option>
              <option>Other</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Phone Number</label>
            <input
              className={styles.input}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="+20 100 000 0000"
            />
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
            onClick={() => onSave({ number, label })}
            disabled={!number.trim()}
          >
            <Check size={14} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Address Modal ─── */
function AddressModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(
    initial || { name: "", line1: "", city: "", country: "Egypt", zip: "" },
  );
  const f = (k) => ({
    value: form[k],
    onChange: (e) => setForm({ ...form, [k]: e.target.value }),
  });
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
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Label (e.g. Home)</label>
              <input
                className={styles.input}
                {...f("name")}
                placeholder="Home / Work…"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Country</label>
              <select className={styles.select} {...f("country")}>
                <option>Egypt</option>
                <option>UAE</option>
                <option>Saudi Arabia</option>
                <option>Kuwait</option>
                <option>Jordan</option>
              </select>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Street Address</label>
            <input
              className={styles.input}
              {...f("line1")}
              placeholder="123 Street Name, Apt 4B"
            />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>City</label>
              <input
                className={styles.input}
                {...f("city")}
                placeholder="Cairo"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>ZIP / Postal Code</label>
              <input
                className={styles.input}
                {...f("zip")}
                placeholder="12345"
              />
            </div>
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
            onClick={() => onSave(form)}
            disabled={!form.line1.trim() || !form.city.trim()}
          >
            <Check size={14} /> Save Address
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
];

/* ─── Main page ─── */
export default function CustomerProfilePage() {
  const { user, updateUser } = useAuth();
  const fileRef = useRef(null);

  const [activeTab, setActiveTab] = useState("profile");
  const [photoURL, setPhotoURL] = useState(null);
  const [alert, setAlert] = useState(null); // { type: 'success'|'error', text }

  /* Profile */
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");

  /* Security */
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confPass, setConfPass] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);

  /* Phones */
  const [phones, setPhones] = useState([]);
  const [phoneModal, setPhoneModal] = useState(null); // null | 'add' | { id }

  /* Addresses */
  const [addresses, setAddresses] = useState([]);
  const [addrModal, setAddrModal] = useState(null); // null | 'add' | { id }

  useEffect(() => {
    // TODO: wire to real API endpoint — Phase X
    setPhones([]);
    setAddresses([]);
  }, []);

  const showAlert = (type, text) => {
    setAlert({ type, text });
    setTimeout(() => setAlert(null), 3500);
  };

  /* Photo upload */
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setPhotoURL(base64);
      // Store in localStorage so Header can read it persistently
      localStorage.setItem("ainai_profile_photo", base64);
      showAlert("success", "Profile photo updated!");
    };
    reader.readAsDataURL(file);
  };

  const getInitials = () => {
    const f = firstName || user?.firstName || "";
    const l = lastName || user?.lastName || "";
    if (f || l) return (f[0] || "") + (l[0] || "");
    return (user?.email?.[0] || "?").toUpperCase();
  };

  /* Save profile */
  const saveProfile = () => {
    // In a real app: API call
    showAlert("success", "Profile updated successfully!");
  };

  /* Save password */
  const savePassword = () => {
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
    setOldPass("");
    setNewPass("");
    setConfPass("");
    showAlert("success", "Password changed successfully!");
  };

  /* Phones */
  const nextPhoneId = useRef(phones.length + 1);
  const handlePhoneSave = (data) => {
    if (phoneModal === "add") {
      setPhones((prev) => [
        ...prev,
        { id: ++nextPhoneId.current, ...data, isDefault: prev.length === 0 },
      ]);
    } else {
      setPhones((prev) =>
        prev.map((p) => (p.id === phoneModal.id ? { ...p, ...data } : p)),
      );
    }
    setPhoneModal(null);
    showAlert("success", "Phone number saved!");
  };
  const deletePhone = (id) =>
    setPhones((prev) => prev.filter((p) => p.id !== id));
  const setDefaultPhone = (id) =>
    setPhones((prev) => prev.map((p) => ({ ...p, isDefault: p.id === id })));

  /* Addresses */
  const nextAddrId = useRef(addresses.length + 1);
  const handleAddrSave = (data) => {
    if (addrModal === "add") {
      setAddresses((prev) => [
        ...prev,
        { id: ++nextAddrId.current, ...data, isDefault: prev.length === 0 },
      ]);
    } else {
      setAddresses((prev) =>
        prev.map((a) => (a.id === addrModal.id ? { ...a, ...data } : a)),
      );
    }
    setAddrModal(null);
    showAlert("success", "Address saved!");
  };
  const deleteAddress = (id) =>
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  const setDefaultAddr = (id) =>
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));

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
              onClick={() => fileRef.current?.click()}
            >
              <Camera size={18} />
              <br />
              Change Photo
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoChange}
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
            >
              <Camera size={14} /> Upload Photo
            </button>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <div
            className={`${styles.alert} ${alert.type === "success" ? styles.alertSuccess : styles.alertError}`}
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
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  className={styles.input}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                <span className={styles.inputNote}>
                  Changing your email may require re-verification.
                </span>
              </div>
              <div className={styles.saveRow}>
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={saveProfile}
                >
                  <Check size={14} /> Save Changes
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
                >
                  <Lock size={14} /> Change Password
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
                    className={`${styles.entryCard} ${ph.isDefault ? styles.entryDefault : ""}`}
                  >
                    <div className={styles.entryIcon}>
                      <Phone size={16} />
                    </div>
                    <div className={styles.entryBody}>
                      <p className={styles.entryMain}>{ph.number}</p>
                      <p className={styles.entrySub}>{ph.label}</p>
                      {ph.isDefault && (
                        <span className={styles.defaultBadge}>
                          <Star size={9} /> Default
                        </span>
                      )}
                    </div>
                    <div className={styles.entryActions}>
                      {!ph.isDefault && (
                        <button
                          className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                          onClick={() => setDefaultPhone(ph.id)}
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        className={styles.btnGhost}
                        onClick={() => setPhoneModal({ id: ph.id })}
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
                    className={`${styles.entryCard} ${addr.isDefault ? styles.entryDefault : ""}`}
                  >
                    <div className={styles.entryIcon}>
                      <MapPin size={16} />
                    </div>
                    <div className={styles.entryBody}>
                      <p className={styles.entryMain}>{addr.name}</p>
                      <p className={styles.entrySub}>
                        {addr.line1}, {addr.city}, {addr.country}
                      </p>
                      {addr.isDefault && (
                        <span className={styles.defaultBadge}>
                          <Star size={9} /> Default
                        </span>
                      )}
                    </div>
                    <div className={styles.entryActions}>
                      {!addr.isDefault && (
                        <button
                          className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                          onClick={() => setDefaultAddr(addr.id)}
                        >
                          Set Default
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

      <Footer />
    </div>
  );
}
