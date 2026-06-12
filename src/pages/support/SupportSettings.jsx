import { useState } from "react";
import { Bell } from "lucide-react";
import SupportLayout from "../../components/support/SupportLayout";
import p from "../../styles/SupportPage.module.css";

function Toggle({ on, onToggle }) {
  return (
    <button className={`${p.toggle} ${on ? p.on : ""}`} onClick={onToggle}>
      <span className={p.toggleKnob} />
    </button>
  );
}

const NOTIF_OPTIONS = [
  { key: "newTicket",    label: "New ticket in queue",          desc: "Alert when any new ticket is submitted to the queue" },
  { key: "newReply",    label: "New reply on your tickets",     desc: "When a user replies to one of your claimed tickets" },
  { key: "highPriority",label: "High priority ticket assigned", desc: "Immediately when a High or Urgent ticket is assigned to you" },
  { key: "slaBreached", label: "SLA breach warning",           desc: "When a ticket is approaching or past SLA limit" },
  { key: "dailyDigest", label: "Daily summary email",          desc: "End-of-day digest of your ticket activity" },
];

export default function SupportSettings() {
  const [notifs, setNotifs] = useState({
    newTicket:    true,
    newReply:     true,
    highPriority: true,
    slaBreached:  true,
    dailyDigest:  false,
  });

  const toggleNotif = (k) => setNotifs((n) => ({ ...n, [k]: !n[k] }));

  return (
    <SupportLayout
      pageTitle="Settings"
      pageSubtitle="Manage your notification preferences."
      breadcrumb="Settings"
    >
      <div className={p.panel} style={{ maxWidth: 560 }}>
        <div className={p.panelHead}>
          <div>
            <h3 className={p.panelTitle} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Bell size={16} /> Notification Preferences
            </h3>
            <p className={p.panelSubtitle}>
              Choose which alerts you want to receive. To update your profile or change your password, visit{" "}
              <a href="/support/profile" style={{ color: "var(--sup-accent)", fontWeight: 600 }}>My Profile</a>.
            </p>
          </div>
        </div>

        <div className={p.panelBody}>
          {NOTIF_OPTIONS.map((n) => (
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
                <p style={{ margin: "0 0 3px", fontWeight: 600, fontSize: 14, color: "var(--sup-text)" }}>{n.label}</p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--sup-text-muted)" }}>{n.desc}</p>
              </div>
              <Toggle on={notifs[n.key]} onToggle={() => toggleNotif(n.key)} />
            </div>
          ))}
        </div>
      </div>
    </SupportLayout>
  );
}
