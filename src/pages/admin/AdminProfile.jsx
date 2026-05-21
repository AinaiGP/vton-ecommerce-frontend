import { useState, useRef, useEffect } from "react";
import {
  Camera,
  Check,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  User,
  Lock,
  Settings,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import t from "../../styles/AdminTable.module.css";
import OTPVerificationModal from "../../components/common/OTPVerificationModal";
import apiClient from "../../utils/apiClient";
import { useAuth } from "../../context/AuthContext";

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
    <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 99,
            background: i < score ? colors[score - 1] : "var(--adm-border)",
            transition: "background 0.3s",
          }}
        />
      ))}
    </div>
  );
}

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "preferences", label: "Preferences", icon: Settings },
];

export default function AdminProfilePage() {
  const fileRef = useRef(null);
  const [tab, setTab] = useState("profile");
  const [photo, setPhoto] = useState(null);
  const [alert, setAlert] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confPass, setConfPass] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const { user, updateUser } = useAuth();
  const [showOTP, setShowOTP] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifSystem, setNotifSystem] = useState(false);
  const [lang2FA, setLang2FA] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get("/admin/profile");
      const d = res.data;
      setName(d.firstName + " " + (d.lastName || ""));
      setEmail(d.user?.email || "");
      setTitle(d.jobTitle || "");
    } catch (err) {
      console.error("Failed to fetch admin profile", err);
    }
  };

  const showAlertMsg = (type, text) => {
    setAlert({ type, text });
    setTimeout(() => setAlert(null), 3000);
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(URL.createObjectURL(file));
      showAlertMsg("success", "Profile photo updated!");
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const names = name.split(" ");
      const firstName = names[0];
      const lastName = names.slice(1).join(" ");
      
      const payload = { firstName, lastName, jobTitle: title };
      if (email !== user?.email) {
        payload.email = email;
      }
      
      const res = await apiClient.patch("/admin/profile", payload);
      
      if (email !== user?.email) {
        setPendingEmail(email);
        setShowOTP(true);
        showAlertMsg("info", res.data.message);
      } else {
        showAlertMsg("success", "Profile updated!");
        updateUser({ firstName, lastName });
      }
    } catch (err) {
      showAlertMsg("error", err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (code) => {
    await apiClient.post("/admin/profile/verify-email", { otp: code });
    setShowOTP(false);
    showAlertMsg("success", "Email verified! Please log in again.");
    setTimeout(() => window.location.reload(), 2000);
  };

  const savePassword = async () => {
    if (!oldPass) {
      showAlertMsg("error", "Enter current password.");
      return;
    }
    if (newPass.length < 8) {
      showAlertMsg("error", "Min 8 characters.");
      return;
    }
    if (newPass !== confPass) {
      showAlertMsg("error", "Passwords don't match.");
      return;
    }
    
    setLoading(true);
    try {
      await apiClient.patch("/admin/profile", {
        changePassword: { currentPassword: oldPass, newPassword: newPass }
      });
      setOldPass("");
      setNewPass("");
      setConfPass("");
      showAlertMsg("success", "Password changed successfully!");
    } catch (err) {
      showAlertMsg("error", err.response?.data?.message || "Change failed");
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    padding: "9px 13px",
    border: "1px solid var(--adm-border)",
    borderRadius: 8,
    fontFamily: "inherit",
    fontSize: 13.5,
    color: "var(--adm-text)",
    background: "var(--adm-surface)",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };
  const lbl = {
    fontSize: 12.5,
    fontWeight: 700,
    color: "var(--adm-text)",
    display: "block",
    marginBottom: 5,
  };

  return (
    <AdminLayout
      pageTitle="Admin Profile"
      pageSubtitle="Manage your account information and settings."
      breadcrumb="Profile"
    >
      {/* Photo hero */}
      <div
        style={{
          background: "linear-gradient(135deg,#8b4852 0%,#4a1520 100%)",
          borderRadius: 16,
          padding: "28px 32px",
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 80% 20%,rgba(212,175,122,0.2) 0%,transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", flexShrink: 0 }}>
          {photo ? (
            <img
              src={photo}
              alt="Profile"
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid rgba(255,255,255,0.35)",
              }}
            />
          ) : (
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                border: "3px solid rgba(255,255,255,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 700,
                color: "white",
              }}
            >
              A
            </div>
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.2s",
              cursor: "pointer",
              color: "white",
              fontSize: 11,
              fontWeight: 600,
              textAlign: "center",
              padding: 4,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
            onClick={() => fileRef.current?.click()}
          >
            <Camera size={18} />
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePhoto}
          />
        </div>
        <div>
          <p
            style={{
              fontFamily: "Georgia,serif",
              fontSize: 20,
              fontWeight: 700,
              color: "white",
              margin: "0 0 4px",
            }}
          >
            {name}
          </p>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.7)",
              margin: "0 0 12px",
            }}
          >
            {title} · {email}
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Camera size={13} /> Upload Photo
          </button>
        </div>
      </div>

      {alert && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderRadius: 10,
            marginBottom: 16,
            fontSize: 13,
            background: alert.type === "success" ? "#dcfce7" : "#fee2e2",
            color: alert.type === "success" ? "#16a34a" : "#dc2626",
            border: `1px solid ${alert.type === "success" ? "#86efac" : "#fca5a5"}`,
          }}
        >
          {alert.type === "success" ? (
            <CheckCircle size={15} />
          ) : (
            <AlertCircle size={15} />
          )}
          {alert.text}
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 3,
          background: "var(--adm-surface)",
          borderRadius: 10,
          padding: 4,
          marginBottom: 20,
          border: "1px solid var(--adm-border)",
          overflowX: "auto",
        }}
      >
        {TABS.map((tb) => {
          const Icon = tb.icon;
          return (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "9px 16px",
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 600,
                transition: "all 0.15s",
                background: tab === tb.id ? "var(--adm-accent)" : "transparent",
                color: tab === tb.id ? "white" : "var(--adm-text-muted)",
              }}
            >
              <Icon size={14} />
              {tb.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {tab === "profile" && (
        <div
          style={{
            background: "var(--adm-surface)",
            border: "1px solid var(--adm-border)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px 24px",
              borderBottom: "1px solid var(--adm-border)",
            }}
          >
            <h2
              style={{
                fontFamily: "Georgia,serif",
                fontSize: 15,
                fontWeight: 700,
                color: "var(--adm-text)",
                margin: "0 0 2px",
              }}
            >
              Personal Information
            </h2>
            <p
              style={{
                fontSize: 12.5,
                color: "var(--adm-text-muted)",
                margin: 0,
              }}
            >
              Update your admin display name and email.
            </p>
          </div>
          <div
            style={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <label style={lbl}>Full Name</label>
                <input
                  style={inp}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="System Admin"
                />
              </div>
              <div>
                <label style={lbl}>Admin Title</label>
                <input
                  style={inp}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="System Administrator"
                />
              </div>
            </div>
            <div>
              <label style={lbl}>Email Address</label>
              <input
                style={inp}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ainai.com"
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className={`${t.btn} ${t.btnPrimary}`}
                onClick={saveProfile}
              >
                <Check size={14} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {tab === "security" && (
        <div
          style={{
            background: "var(--adm-surface)",
            border: "1px solid var(--adm-border)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px 24px",
              borderBottom: "1px solid var(--adm-border)",
            }}
          >
            <h2
              style={{
                fontFamily: "Georgia,serif",
                fontSize: 15,
                fontWeight: 700,
                color: "var(--adm-text)",
                margin: "0 0 2px",
              }}
            >
              Change Password
            </h2>
            <p
              style={{
                fontSize: 12.5,
                color: "var(--adm-text-muted)",
                margin: 0,
              }}
            >
              Use a strong password of at least 8 characters.
            </p>
          </div>
          <div
            style={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {[
              ["Current Password", oldPass, setOldPass, showOld, setShowOld],
              ["New Password", newPass, setNewPass, showNew, setShowNew],
              [
                "Confirm New Password",
                confPass,
                setConfPass,
                showConf,
                setShowConf,
              ],
            ].map(([lbl2, val, setter, show, setShow], i) => (
              <div key={i}>
                <label style={lbl}>{lbl2}</label>
                <div style={{ position: "relative" }}>
                  <input
                    style={{ ...inp, paddingRight: 44 }}
                    type={show ? "text" : "password"}
                    value={val}
                    onChange={(e) => setter(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--adm-text-muted)",
                    }}
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {i === 1 && newPass && <StrengthMeter password={newPass} />}
                {i === 2 && confPass && newPass && (
                  <span
                    style={{
                      fontSize: 12,
                      color: confPass === newPass ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {confPass === newPass
                      ? "✓ Passwords match"
                      : "✗ Passwords do not match"}
                  </span>
                )}
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className={`${t.btn} ${t.btnPrimary}`}
                onClick={savePassword}
              >
                <Lock size={14} /> Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {tab === "preferences" && (
        <div
          style={{
            background: "var(--adm-surface)",
            border: "1px solid var(--adm-border)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px 24px",
              borderBottom: "1px solid var(--adm-border)",
            }}
          >
            <h2
              style={{
                fontFamily: "Georgia,serif",
                fontSize: 15,
                fontWeight: 700,
                color: "var(--adm-text)",
                margin: "0 0 2px",
              }}
            >
              Notification Preferences
            </h2>
          </div>
          <div
            style={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {[
              [
                notifEmail,
                setNotifEmail,
                "Email Notifications",
                "Receive alerts for new orders, tickets, and vendor applications.",
              ],
              [
                notifSystem,
                setNotifSystem,
                "System Notifications",
                "In-app bell alerts for platform events.",
              ],
              [
                lang2FA,
                setLang2FA,
                "Two-Factor Authentication",
                "Require a verification code at login (coming soon).",
              ],
            ].map(([val, setter, title2, desc], i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  background: "var(--adm-bg)",
                  borderRadius: 10,
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 2px",
                      fontWeight: 700,
                      fontSize: 13.5,
                      color: "var(--adm-text)",
                    }}
                  >
                    {title2}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: "var(--adm-text-muted)",
                    }}
                  >
                    {desc}
                  </p>
                </div>
                <button
                  onClick={() => setter((v) => !v)}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 99,
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    background: val ? "var(--adm-accent)" : "var(--adm-border)",
                    transition: "background 0.2s",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      left: val ? 22 : 2,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "white",
                      transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {showOTP && (
        <OTPVerificationModal
          email={pendingEmail}
          onVerify={handleVerifyOTP}
          onClose={() => setShowOTP(false)}
          title="Verify Email Change"
        />
      )}
    </AdminLayout>
  );
}
