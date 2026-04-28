import { useState } from "react";
import { Send, Paperclip, UserCheck, PhoneForwarded, XCircle, Search } from "lucide-react";
import SupportLayout from "../../components/support/SupportLayout";
import p from "../../styles/SupportPage.module.css";

const CONVERSATIONS = [
  { id: 1, name: "Sara Al-Rashid", role: "Customer", snippet: "My payment keeps failing...",       time: "2m",  unread: 3, online: true },
  { id: 2, name: "Urban Threads",  role: "Vendor",   snippet: "The VTON quota is exceeded",        time: "8m",  unread: 1, online: true },
  { id: 3, name: "Omar Ali",       role: "Customer", snippet: "Still can't reset my password",     time: "22m", unread: 0, online: false },
  { id: 4, name: "Noor Fashion",   role: "Vendor",   snippet: "Thanks! Issue resolved 👍",          time: "1h",  unread: 0, online: false },
  { id: 5, name: "Layla Hassan",   role: "Customer", snippet: "When will I get my refund?",         time: "1h",  unread: 0, online: true },
  { id: 6, name: "Desert Rose",    role: "Vendor",   snippet: "Waiting for payout confirmation",   time: "2h",  unread: 0, online: false },
];

const MESSAGES = {
  1: [
    { from: "user",  text: "Hello, I tried to pay 3 times and it keeps failing.", time: "10:32" },
    { from: "agent", text: "Hi Sara! Sorry about that. Is there any error code shown?", time: "10:34" },
    { from: "user",  text: "Yes — it says CARD_DECLINED but my bank sees no issue.", time: "10:36" },
    { from: "agent", text: "Got it! I'll escalate to our payments team now. Can you share your order ID?", time: "10:38" },
    { from: "user",  text: "It's ORD-2841.", time: "10:39" },
  ],
  2: [
    { from: "user",  text: "Hi, the VTON feature shows 'quota exceeded'. I haven't used all my uploads yet.", time: "09:15" },
    { from: "agent", text: "Hello! I can see your account here. You have 3 uploads remaining — let me reset the counter.", time: "09:20" },
    { from: "user",  text: "That would be great, thank you!", time: "09:21" },
  ],
};

export default function SupportLiveChat() {
  const [activeId, setActiveId] = useState(1);
  const [conversations, setConversations] = useState(CONVERSATIONS);
  const [input, setInput]       = useState("");
  const [messages, setMessages] = useState(MESSAGES);
  const [search, setSearch]     = useState("");

  const conv = conversations.find(c => c.id === activeId);
  const msgs = messages[activeId] || [];
  const filtered = conversations.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.snippet.toLowerCase().includes(search.toLowerCase())
  );

  const send = () => {
    if (!input.trim()) return;
    setMessages(prev => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), { from: "agent", text: input.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]
    }));
    setInput("");
  };

  const handleEndChat = () => {
    setConversations(prev => prev.filter(c => c.id !== activeId));
    const nextList = conversations.filter(c => c.id !== activeId);
    if (nextList.length > 0) setActiveId(nextList[0].id);
    else setActiveId(null);
    alert("Chat session has been successfully ended.");
  };

  const handleTransfer = () => {
    alert("Opening agent transfer dialog...");
  };

  return (
    <SupportLayout
      pageTitle="Live Chat"
      pageSubtitle="Real-time conversations with customers and vendors."
      breadcrumb="Live Chat"
    >
      <div className={p.chatLayout}>
        {/* Sidebar */}
        <div className={p.chatSidebar}>
          <div className={p.chatSidebarHead}>
            <h3 className={p.chatSidebarTitle}>Active Chats <span style={{ color: "var(--sup-accent)", fontWeight: 800 }}>{conversations.filter(c => c.online).length}</span></h3>
            <div className={p.searchWrap}>
              <Search size={13} className={p.searchIcon} />
              <input className={p.searchInput} placeholder="Search conversations..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className={p.convList}>
            {filtered.map(c => (
              <div key={c.id} className={`${p.convItem} ${c.id === activeId ? p.active : ""}`} onClick={() => setActiveId(c.id)}>
                <div className={p.convAvatar}>
                  {c.name.slice(0, 2).toUpperCase()}
                  {c.online && <span className={p.onlineDot} />}
                </div>
                <div className={p.convInfo}>
                  <p className={p.convName}>{c.name}</p>
                  <p className={p.convSnippet}>{c.snippet}</p>
                </div>
                <div className={p.convMeta}>
                  <span className={p.convTime}>{c.time}</span>
                  {c.unread > 0 && <span className={p.convUnread}>{c.unread}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat main */}
        <div className={p.chatMain}>
          {conv ? (
            <>
              {/* Chat header */}
              <div className={p.chatHeader}>
                <div className={p.chatHeaderInfo}>
                  <div className={p.convAvatar} style={{ fontSize: 14 }}>
                    {conv.name.slice(0, 2).toUpperCase()}
                    {conv.online && <span className={p.onlineDot} />}
                  </div>
                  <div>
                    <p className={p.chatHeaderName}>{conv.name}</p>
                    <span className={p.chatHeaderSub}>{conv.role} · {conv.online ? "🟢 Online" : "⚫ Offline"}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className={`${p.btn} ${p.btnOutline} ${p.btnSm}`} onClick={handleTransfer}><PhoneForwarded size={13} /> Transfer</button>
                  <button className={`${p.btn} ${p.btnDanger} ${p.btnSm}`} onClick={handleEndChat}><XCircle size={13} /> End Chat</button>
                </div>
              </div>

              {/* Messages */}
              <div className={p.chatBody}>
                <div style={{ textAlign: "center", margin: "8px 0" }}>
                  <span style={{ fontSize: 11, color: "var(--sup-text-subtle)", background: "var(--sup-border)", padding: "3px 10px", borderRadius: 20 }}>Today</span>
                </div>
                {msgs.map((m, i) => (
                  <div key={i} className={`${p.msgRow} ${m.from === "agent" ? p.mine : ""}`}>
                    <div className={p.msgAvat}>{m.from === "agent" ? "JS" : conv.name.slice(0, 2).toUpperCase()}</div>
                    <div>
                      <div className={p.msgBubble}>{m.text}</div>
                      <span className={p.msgTime}>{m.time}</span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Input */}
            <div className={p.chatFooter}>
              <button className={`${p.btn} ${p.btnGhost} ${p.btnIcon}`}><Paperclip size={16} /></button>
              <textarea
                className={p.chatInput}
                rows={1}
                placeholder={`Reply to ${conv.name}...`}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              />
              <button className={`${p.btn} ${p.btnPrimary}`} onClick={send} disabled={!input.trim()}>
                <Send size={15} />
              </button>
            </div>
            </>
          ) : (
            <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", color: "var(--sup-text-muted)" }}>
              No active chat selected
            </div>
          )}
        </div>
      </div>
    </SupportLayout>
  );
}
