import { useEffect, useState } from "react";
import { User, Bell, Shield, Users } from "lucide-react";
import SupportLayout from "../../components/support/SupportLayout";
import p from "../../styles/SupportPage.module.css";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "sla", label: "SLA Rules", icon: Shield },
  { id: "team", label: "Team", icon: Users },
];

const STATUS_COLORS = {
  Online: "#16a34a",
  Away: "#d4af7a",
  Offline: "#94a3b8",
};

function Toggle({ on, onToggle }) {
  return (
    <button className={`${p.toggle} ${on ? p.on : ""}`} onClick={onToggle}>
      <span className={p.toggleKnob} />
    </button>
  );
}

export default function SupportSettings() {
  const [tab, setTab] = useState("profile");
  const [team, setTeam] = useState([]);
  const [notifs, setNotifs] = useState({
    newTicket: true,
    newReply: true,
    highPriority: true,
    slaBreached: true,
    dailyDigest: false,
    weeklyReport: true,
  });
  const toggleNotif = (k) => setNotifs((n) => ({ ...n, [k]: !n[k] }));

  useEffect(() => {
    // TODO: wire to real API endpoint — Phase X
    setTeam([]);
  }, []);

  return (
    <SupportLayout
      pageTitle="Settings"
      pageSubtitle="Manage your agent profile, notifications, and team."
      breadcrumb="Settings"
    >
      <div className={p.panel}>
        {/* Tabs */}
        <div className={p.tabs}>
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                className={`${p.tab} ${tab === t.id ? p.active : ""}`}
                onClick={() => setTab(t.id)}
              >
                <Icon
                  size={14}
                  style={{ verticalAlign: "middle", marginRight: 5 }}
                />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className={p.panelBody}>
          {/* Profile Tab */}
          {tab === "profile" && (
            <div
              style={{
                maxWidth: 540,
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 18,
                    background: "#fdf5f6",
                    color: "#8b4852",
                    fontSize: 24,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  JS
                </div>
                <div>
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontWeight: 700,
                      color: "var(--sup-text)",
                      fontSize: 15,
                    }}
                  >
                    Jamie Sullivan
                  </p>
                  <button className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}>
                    Change Photo
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div className={p.formGroup}>
                  <label className={p.label}>First Name</label>
                  <input className={p.input} defaultValue="Jamie" />
                </div>
                <div className={p.formGroup}>
                  <label className={p.label}>Last Name</label>
                  <input className={p.input} defaultValue="Sullivan" />
                </div>
                <div className={p.formGroup} style={{ gridColumn: "1/-1" }}>
                  <label className={p.label}>Email</label>
                  <input
                    className={p.input}
                    defaultValue="jamie.s@ainai.com"
                    type="email"
                  />
                </div>
                <div className={p.formGroup}>
                  <label className={p.label}>Role</label>
                  <input
                    className={p.input}
                    defaultValue="Level 2 Support Agent"
                    readOnly
                    style={{ opacity: 0.7 }}
                  />
                </div>
                <div className={p.formGroup}>
                  <label className={p.label}>Timezone</label>
                  <select className={p.select}>
                    <option>UTC+02:00 — Cairo</option>
                    <option>UTC+03:00 — Riyadh</option>
                    <option>UTC+04:00 — Dubai</option>
                  </select>
                </div>
                <div className={p.formGroup} style={{ gridColumn: "1/-1" }}>
                  <label className={p.label}>Bio / Signature</label>
                  <textarea
                    className={p.textarea}
                    defaultValue="Hi! I'm Jamie from AINAI Support. Happy to help 🙂"
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button className={`${p.btn} ${p.btnOutline}`}>
                  Change Password
                </button>
                <button className={`${p.btn} ${p.btnPrimary}`}>
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {tab === "notifications" && (
            <div style={{ maxWidth: 520 }}>
              <p
                style={{
                  margin: "0 0 20px",
                  fontSize: 13,
                  color: "var(--sup-text-muted)",
                }}
              >
                Choose which alerts you want to receive.
              </p>
              {[
                {
                  key: "newTicket",
                  label: "New ticket created",
                  desc: "Alert when any new ticket is submitted",
                },
                {
                  key: "newReply",
                  label: "New reply on your tickets",
                  desc: "When a user replies to one of your tickets",
                },
                {
                  key: "highPriority",
                  label: "High priority ticket assigned",
                  desc: "Immediately when a High/Urgent ticket is assigned to you",
                },
                {
                  key: "slaBreached",
                  label: "SLA breach warning",
                  desc: "When a ticket is approaching or past SLA limit",
                },
                {
                  key: "dailyDigest",
                  label: "Daily summary email",
                  desc: "End-of-day digest of your ticket activity",
                },
                {
                  key: "weeklyReport",
                  label: "Weekly performance report",
                  desc: "Your CSAT and resolution stats each Monday",
                },
              ].map((n) => (
                <div
                  key={n.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 0",
                    borderBottom: "1px solid var(--sup-border)",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: "0 0 3px",
                        fontWeight: 600,
                        fontSize: 14,
                        color: "var(--sup-text)",
                      }}
                    >
                      {n.label}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: "var(--sup-text-muted)",
                      }}
                    >
                      {n.desc}
                    </p>
                  </div>
                  <Toggle
                    on={notifs[n.key]}
                    onToggle={() => toggleNotif(n.key)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* SLA Tab */}
          {tab === "sla" && (
            <div
              style={{
                maxWidth: 520,
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "var(--sup-text-muted)",
                }}
              >
                Define response time limits per ticket priority.
              </p>
              {[
                { label: "Urgent", frt: 30, resolution: 2 },
                { label: "High", frt: 60, resolution: 4 },
                { label: "Medium", frt: 240, resolution: 24 },
                { label: "Low", frt: 480, resolution: 72 },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "var(--sup-bg)",
                    borderRadius: 12,
                    padding: "16px 18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 12,
                    }}
                  >
                    <span
                      className={p.badge}
                      style={{
                        background:
                          s.label === "Urgent"
                            ? "#8b4852"
                            : s.label === "High"
                              ? "#fee2e2"
                              : s.label === "Medium"
                                ? "#fef9c3"
                                : "#f1f5f9",
                        color:
                          s.label === "Urgent"
                            ? "white"
                            : s.label === "High"
                              ? "#991b1b"
                              : s.label === "Medium"
                                ? "#854d0e"
                                : "#64748b",
                      }}
                    >
                      {s.label}
                    </span>
                    <span
                      style={{ fontSize: 12, color: "var(--sup-text-muted)" }}
                    >
                      Priority
                    </span>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <div className={p.formGroup}>
                      <label className={p.label}>First Reply (mins)</label>
                      <input
                        className={p.input}
                        defaultValue={s.frt}
                        type="number"
                      />
                    </div>
                    <div className={p.formGroup}>
                      <label className={p.label}>Resolution (hrs)</label>
                      <input
                        className={p.input}
                        defaultValue={s.resolution}
                        type="number"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                className={`${p.btn} ${p.btnPrimary}`}
                style={{ alignSelf: "flex-start" }}
              >
                Save SLA Rules
              </button>
            </div>
          )}

          {/* Team Tab */}
          {tab === "team" && (
            <div className={p.tableWrap}>
              <table className={p.table}>
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {team.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className={p.emptyState}>
                          <div className={p.emptyIcon}>
                            <Users size={22} />
                          </div>
                          <h3 className={p.emptyTitle}>No data yet.</h3>
                          <p className={p.emptyText}>
                            Team members will appear once support data is
                            connected.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    team.map((a) => (
                      <tr key={a.name}>
                        <td>
                          <div className={p.avatarCell}>
                            <div className={p.avatar}>
                              {a.name
                                .split(" ")
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>
                              {a.name}
                            </span>
                          </div>
                        </td>
                        <td
                          style={{
                            color: "var(--sup-text-muted)",
                            fontSize: 13,
                          }}
                        >
                          {a.email}
                        </td>
                        <td style={{ fontSize: 13 }}>{a.role}</td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: STATUS_COLORS[a.status],
                                display: "inline-block",
                              }}
                            />
                            <span
                              style={{
                                fontSize: 12,
                                color: "var(--sup-text-muted)",
                              }}
                            >
                              {a.status}
                            </span>
                          </div>
                        </td>
                        <td>
                          <button
                            className={`${p.btn} ${p.btnGhost} ${p.btnXs}`}
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SupportLayout>
  );
}
