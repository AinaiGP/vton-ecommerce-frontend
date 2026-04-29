import { useState, useEffect } from "react";
import {
  User,
  Store,
  Lock,
  Eye,
  EyeOff,
  Save,
  ImageIcon,
  Check,
} from "lucide-react";
import VendorLayout from "../components/vendor/VendorLayout";
import p from "../styles/VendorPage.module.css";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "store", label: "Store", icon: Store },
  { id: "password", label: "Password", icon: Lock },
];

export default function VendorSettingsPage() {
  const [tab, setTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
  });
  const [store, setStore] = useState({
    storeName: "",
    slug: "",
    category: "Fashion & Apparel",
    description: "",
    email: "",
    country: "UAE",
  });
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    // TODO: wire vendor settings/profile to real API endpoint
  }, []);

  const handleSave = (e) => {
    e?.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <VendorLayout
      pageTitle="Settings"
      pageSubtitle="Manage your profile, store and account security."
      breadcrumb="Settings"
    >
      {/* Tabs */}
      <div className={p.settingsTabs}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`${p.settingsTab} ${tab === id ? p.active : ""}`}
            onClick={() => setTab(id)}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {saved && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 18px",
            background: "#dcfce7",
            border: "1px solid #bbf7d0",
            borderRadius: 10,
            color: "#16a34a",
            fontWeight: 600,
            fontSize: 13.5,
          }}
        >
          <Check size={16} /> Settings saved successfully.
        </div>
      )}

      {/* ── Profile ── */}
      {tab === "profile" && (
        <form onSubmit={handleSave}>
          <div className={p.settingsPanel}>
            <h3 className={p.settingsSectionTitle}>Personal Information</h3>
            {/* Avatar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  color: "white",
                  fontSize: 26,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    alt="avatar"
                  />
                ) : (
                  "KM"
                )}
              </div>
              <div>
                <p style={{ margin: "0 0 6px", fontWeight: 600 }}>
                  Profile Photo
                </p>
                <label
                  className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}
                  style={{ cursor: "pointer" }}
                >
                  <ImageIcon size={13} /> Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files[0];
                      if (f) setAvatarPreview(URL.createObjectURL(f));
                    }}
                  />
                </label>
              </div>
            </div>
            <div className={p.formRow}>
              <div className={p.formGroup}>
                <label className={p.label}>Full Name</label>
                <input
                  className={p.input}
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                />
              </div>
              <div className={p.formGroup}>
                <label className={p.label}>Email Address</label>
                <input
                  className={p.input}
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                />
              </div>
              <div className={p.formGroup}>
                <label className={p.label}>Phone Number</label>
                <input
                  className={p.input}
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                />
              </div>
            </div>
            <div className={p.formGroup}>
              <label className={p.label}>Short Bio</label>
              <textarea
                className={p.textarea}
                rows={3}
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 16,
            }}
          >
            <button type="submit" className={`${p.btn} ${p.btnPrimary}`}>
              <Save size={14} /> Save Profile
            </button>
          </div>
        </form>
      )}

      {/* ── Store ── */}
      {tab === "store" && (
        <form onSubmit={handleSave}>
          <div className={p.settingsPanel}>
            <h3 className={p.settingsSectionTitle}>Store Details</h3>
            {/* Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  background: "var(--vdr-accent-light)",
                  border: "1px solid #c4b5fd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    alt="logo"
                  />
                ) : (
                  <Store size={26} style={{ color: "var(--vdr-accent)" }} />
                )}
              </div>
              <div>
                <p style={{ margin: "0 0 6px", fontWeight: 600 }}>Store Logo</p>
                <label
                  className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}
                  style={{ cursor: "pointer" }}
                >
                  <ImageIcon size={13} /> Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files[0];
                      if (f) setLogoPreview(URL.createObjectURL(f));
                    }}
                  />
                </label>
              </div>
            </div>
            <div className={p.formRow}>
              <div className={p.formGroup}>
                <label className={p.label}>Store Name</label>
                <input
                  className={p.input}
                  value={store.storeName}
                  onChange={(e) =>
                    setStore({ ...store, storeName: e.target.value })
                  }
                />
              </div>
              <div className={p.formGroup}>
                <label className={p.label}>Store Slug</label>
                <input
                  className={p.input}
                  value={store.slug}
                  onChange={(e) => setStore({ ...store, slug: e.target.value })}
                />
              </div>
              <div className={p.formGroup}>
                <label className={p.label}>Category</label>
                <select
                  className={p.select}
                  value={store.category}
                  onChange={(e) =>
                    setStore({ ...store, category: e.target.value })
                  }
                >
                  <option>Fashion & Apparel</option>
                  <option>Accessories</option>
                  <option>Beauty & Cosmetics</option>
                  <option>Sportswear</option>
                  <option>Traditional Wear</option>
                </select>
              </div>
              <div className={p.formGroup}>
                <label className={p.label}>Contact Email</label>
                <input
                  className={p.input}
                  type="email"
                  value={store.email}
                  onChange={(e) =>
                    setStore({ ...store, email: e.target.value })
                  }
                />
              </div>
              <div className={p.formGroup}>
                <label className={p.label}>Country</label>
                <select
                  className={p.select}
                  value={store.country}
                  onChange={(e) =>
                    setStore({ ...store, country: e.target.value })
                  }
                >
                  <option>UAE</option>
                  <option>Saudi Arabia</option>
                  <option>Qatar</option>
                  <option>Egypt</option>
                  <option>Jordan</option>
                </select>
              </div>
            </div>
            <div className={p.formGroup}>
              <label className={p.label}>Store Description</label>
              <textarea
                className={p.textarea}
                rows={3}
                value={store.description}
                onChange={(e) =>
                  setStore({ ...store, description: e.target.value })
                }
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 16,
            }}
          >
            <button type="submit" className={`${p.btn} ${p.btnPrimary}`}>
              <Save size={14} /> Save Store Info
            </button>
          </div>
        </form>
      )}

      {/* ── Password ── */}
      {tab === "password" && (
        <form onSubmit={handleSave}>
          <div className={p.settingsPanel} style={{ maxWidth: 480 }}>
            <h3 className={p.settingsSectionTitle}>Change Password</h3>
            <div className={p.formGroup}>
              <label className={p.label}>Current Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className={p.input}
                  type={showCurrent ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                  placeholder="Enter current password"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--vdr-text-muted)",
                  }}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className={p.formGroup}>
              <label className={p.label}>New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className={p.input}
                  type={showNew ? "text" : "password"}
                  value={passwords.newPass}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPass: e.target.value })
                  }
                  placeholder="Minimum 8 characters"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--vdr-text-muted)",
                  }}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className={p.formGroup}>
              <label className={p.label}>Confirm New Password</label>
              <input
                className={p.input}
                type="password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
                placeholder="Repeat new password"
              />
            </div>
            {passwords.newPass &&
              passwords.confirm &&
              passwords.newPass !== passwords.confirm && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "#fee2e2",
                    border: "1px solid #fca5a5",
                    borderRadius: 8,
                    color: "#dc2626",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  ⚠ Passwords do not match.
                </div>
              )}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 16,
            }}
          >
            <button
              type="submit"
              className={`${p.btn} ${p.btnPrimary}`}
              disabled={
                !!(
                  passwords.newPass &&
                  passwords.confirm &&
                  passwords.newPass !== passwords.confirm
                )
              }
            >
              <Lock size={14} /> Update Password
            </button>
          </div>
        </form>
      )}
    </VendorLayout>
  );
}
