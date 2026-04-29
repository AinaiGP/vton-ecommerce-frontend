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
  Bell,
  Headphones,
} from "lucide-react";
import SupportLayout from "../../components/support/SupportLayout";

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
            background: i < score ? colors[score - 1] : "#e2e8f0",
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
  { id: "preferences", label: "Preferences", icon: Bell },
];

const base = {
  wrap: { background: "#f8f6f3", minHeight: "100vh" },
  card: {
    background: "white",
    border: "1px solid #e8ded0",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 20,
  },
  head: { padding: "18px 24px", borderBottom: "1px solid #f0e8df" },
  body: { padding: 24, display: "flex", flexDirection: "column", gap: 18 },
  lbl: {
    fontSize: 12.5,
    fontWeight: 700,
    color: "#3a302b",
    display: "block",
    marginBottom: 5,
  },
  inp: {
    padding: "9px 13px",
    border: "1px solid #e8ded0",
    borderRadius: 8,
    fontFamily: "inherit",
    fontSize: 13.5,
    color: "#3a302b",
    background: "#faf8f5",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  tab: (active) => ({
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
    background: active ? "#8b4852" : "transparent",
    color: active ? "white" : "#8a7d76",
  }),
};

export default function SupportProfilePage() {
  const fileRef = useRef(null);
  const [tab, setTab] = useState("profile");
  const [photo, setPhoto] = useState(null);
  const [alert, setAlert] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confPass, setConfPass] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [notifTicket, setNotifTicket] = useState(true);
  const [notifChat, setNotifChat] = useState(true);
  const [notifSLA, setNotifSLA] = useState(true);
  const [sound, setSound] = useState(false);

  useEffect(() => {
    // TODO: wire support profile to real API endpoint
  }, []);

  const showAlertMsg = (type, text) => {
    setAlert({ type, text });
    setTimeout(() => setAlert(null), 3000);
  };
  const handlePhoto = (e) => {
    const f = e.target.files[0];
    if (f) {
      setPhoto(URL.createObjectURL(f));
      showAlertMsg("success", "Profile photo updated!");
    }
  };
  const saveProfile = () =>
    showAlertMsg("success", "Profile saved successfully!");
  const savePassword = () => {
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
    setOldPass("");
    setNewPass("");
    setConfPass("");
    showAlertMsg("success", "Password changed successfully!");
  };

  return (
    <SupportLayout
      pageTitle="My Profile"
      pageSubtitle="Manage your personal information and account settings."
      breadcrumb="Profile"
    >
      {/* Photo hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #8b4852 0%, #4a1520 100%)",
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
              JS
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
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 20,
              padding: "3px 10px",
              marginBottom: 8,
            }}
          >
            <Headphones size={12} style={{ color: "#d4af7a" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#d4af7a" }}>
              Technical Support
            </span>
          </div>
          <p
            style={{
              fontFamily: "Georgia, serif",
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
            {level} · {email}
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

      {/* Alert */}
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
          )}{" "}
          {alert.text}
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 3,
          background: "white",
          borderRadius: 10,
          padding: 4,
          marginBottom: 20,
          border: "1px solid #e8ded0",
          overflowX: "auto",
        }}
      >
        {TABS.map((tb) => {
          const Icon = tb.icon;
          return (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              style={base.tab(tab === tb.id)}
            >
              <Icon size={14} /> {tb.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {tab === "profile" && (
        <div style={base.card}>
          <div style={base.head}>
            <h2
              style={{
                fontFamily: "Georgia,serif",
                fontSize: 15,
                fontWeight: 700,
                color: "#3a302b",
                margin: "0 0 2px",
              }}
            >
              Personal Information
            </h2>
            <p style={{ fontSize: 12.5, color: "#8a7d76", margin: 0 }}>
              Update your display name, email, and agent level.
            </p>
          </div>
          <div style={base.body}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <label style={base.lbl}>Full Name</label>
                <input
                  style={base.inp}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jamie Sullivan"
                />
              </div>
              <div>
                <label style={base.lbl}>Agent Level / Title</label>
                <input
                  style={base.inp}
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  placeholder="Level 2 Support Agent"
                />
              </div>
            </div>
            <div>
              <label style={base.lbl}>Email Address</label>
              <input
                style={base.inp}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jamie@ainai.com"
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  height: 36,
                  padding: "0 18px",
                  borderRadius: 20,
                  background: "#8b4852",
                  color: "white",
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                }}
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
        <div style={base.card}>
          <div style={base.head}>
            <h2
              style={{
                fontFamily: "Georgia,serif",
                fontSize: 15,
                fontWeight: 700,
                color: "#3a302b",
                margin: "0 0 2px",
              }}
            >
              Change Password
            </h2>
            <p style={{ fontSize: 12.5, color: "#8a7d76", margin: 0 }}>
              Use a strong password of at least 8 characters.
            </p>
          </div>
          <div style={base.body}>
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
            ].map(([lbl, val, setter, show, setShow], i) => (
              <div key={i}>
                <label style={base.lbl}>{lbl}</label>
                <div style={{ position: "relative" }}>
                  <input
                    style={{ ...base.inp, paddingRight: 44 }}
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
                      color: "#8a7d76",
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
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  height: 36,
                  padding: "0 18px",
                  borderRadius: 20,
                  background: "#8b4852",
                  color: "white",
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                }}
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
        <div style={base.card}>
          <div style={base.head}>
            <h2
              style={{
                fontFamily: "Georgia,serif",
                fontSize: 15,
                fontWeight: 700,
                color: "#3a302b",
                margin: "0 0 2px",
              }}
            >
              Notification Preferences
            </h2>
          </div>
          <div style={base.body}>
            {[
              [
                notifTicket,
                setNotifTicket,
                "New Ticket Assignments",
                "Alert when a new ticket is assigned to you.",
              ],
              [
                notifChat,
                setNotifChat,
                "Live Chat Requests",
                "Alert for incoming live chat sessions.",
              ],
              [
                notifSLA,
                setNotifSLA,
                "SLA Breach Warnings",
                "Alert 15 minutes before SLA deadline.",
              ],
              [
                sound,
                setSound,
                "Sound Notifications",
                "Play a sound for new messages and alerts.",
              ],
            ].map(([val, setter, title, desc], i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  background: "#faf8f5",
                  borderRadius: 10,
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 2px",
                      fontWeight: 700,
                      fontSize: 13.5,
                      color: "#3a302b",
                    }}
                  >
                    {title}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: "#8a7d76" }}>
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
                    background: val ? "#8b4852" : "#d1d5db",
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
    </SupportLayout>
  );
}
