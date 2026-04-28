import { useState } from "react";
import { Mail, Send, Clock, CheckCircle, XCircle, AlertTriangle, Search, Plus, X, Check, Trash2 } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import t from "../../styles/AdminTable.module.css";

const SEED = [
  { id:1, email:"vendor2@example.com", role:"Vendor",            status:"Pending",  sent:"Apr 22, 2026", expires:"Apr 29, 2026" },
  { id:2, email:"support1@ainai.com",  role:"Technical Support", status:"Accepted", sent:"Apr 18, 2026", expires:"Apr 25, 2026" },
  { id:3, email:"admin2@ainai.com",    role:"Admin",             status:"Expired",  sent:"Apr 10, 2026", expires:"Apr 17, 2026" },
  { id:4, email:"shop@brand.eg",       role:"Vendor",            status:"Cancelled",sent:"Apr 8, 2026",  expires:"Apr 15, 2026" },
];
const STATUS_CFG = {
  Pending:   {bg:"#fef9c3",color:"#ca8a04",icon:Clock},
  Accepted:  {bg:"#dcfce7",color:"#16a34a",icon:CheckCircle},
  Expired:   {bg:"#fee2e2",color:"#dc2626",icon:XCircle},
  Cancelled: {bg:"#f1f5f9",color:"#64748b",icon:XCircle},
};

function InviteModal({onSave,onClose}) {
  const [f,setF]=useState({email:"",role:"Vendor",message:""});
  return (
    <div className={t.modalBackdrop} onClick={onClose}>
      <div className={t.modal} onClick={e=>e.stopPropagation()}>
        <div className={t.modalHead}><h2 className={t.modalTitle}>Send Invitation</h2><button className={t.modalClose} onClick={onClose}><X size={17}/></button></div>
        <div className={t.modalBody}>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <label style={{fontSize:12.5,fontWeight:700,color:"var(--adm-text)"}}>Email Address *</label>
            <input className={t.searchInput} type="email" style={{width:"100%",borderRadius:8,paddingLeft:12}} value={f.email} onChange={e=>setF({...f,email:e.target.value})} placeholder="user@example.com"/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <label style={{fontSize:12.5,fontWeight:700,color:"var(--adm-text)"}}>Invite As *</label>
            <select className={t.filterSelect} style={{width:"100%",borderRadius:8}} value={f.role} onChange={e=>setF({...f,role:e.target.value})}>
              <option>Admin</option><option>Vendor</option><option>Technical Support</option>
            </select>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <label style={{fontSize:12.5,fontWeight:700,color:"var(--adm-text)"}}>Personal Message (optional)</label>
            <textarea value={f.message} onChange={e=>setF({...f,message:e.target.value})} rows={3}
              style={{width:"100%",padding:"10px 12px",border:"1px solid var(--adm-border)",borderRadius:8,fontFamily:"inherit",fontSize:13.5,color:"var(--adm-text)",background:"var(--adm-surface)",resize:"vertical"}}
              placeholder="Hi! We'd love to have you join the AINAI platform as a vendor…"/>
          </div>
          <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"12px 14px"}}>
            <p style={{margin:0,fontSize:12.5,color:"#1d4ed8",fontWeight:600}}>📧 An invitation email will be sent with a 7-day expiry link. The user must sign up using this email address.</p>
          </div>
        </div>
        <div className={t.modalFoot}>
          <button className={`${t.btn} ${t.btnOutline}`} onClick={onClose}>Cancel</button>
          <button className={`${t.btn} ${t.btnPrimary}`} disabled={!f.email.trim()} onClick={()=>onSave({...f,id:Date.now(),status:"Pending",sent:"Today",expires:"7 days from now"})}>
            <Send size={14}/> Send Invitation
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminInvitationsPage() {
  const [invites,setInvites]=useState(SEED);
  const [search,setSearch]=useState("");
  const [rf,setRf]=useState("All");
  const [sf,setSf]=useState("All");
  const [showInvite,setShowInvite]=useState(false);

  const filtered=invites.filter(i=>(i.email.toLowerCase().includes(search.toLowerCase()))&&(rf==="All"||i.role===rf)&&(sf==="All"||i.status===sf));
  const addInvite=d=>{setInvites(p=>[d,...p]);setShowInvite(false);};
  const cancel=id=>setInvites(p=>p.map(i=>i.id===id?{...i,status:"Cancelled"}:i));

  const stats={
    total:invites.length,
    pending:invites.filter(i=>i.status==="Pending").length,
    accepted:invites.filter(i=>i.status==="Accepted").length,
    expired:invites.filter(i=>i.status==="Expired"||i.status==="Cancelled").length,
  };

  return (
    <AdminLayout pageTitle="Email Invitations" pageSubtitle="Invite admins, vendors, and support staff to join AINAI." breadcrumb="Invitations">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        {[{label:"Total Sent",val:stats.total,color:"#3a302b",bg:"#f7f3ed"},{label:"Pending",val:stats.pending,color:"#ca8a04",bg:"#fef9c3"},{label:"Accepted",val:stats.accepted,color:"#16a34a",bg:"#dcfce7"},{label:"Expired/Cancelled",val:stats.expired,color:"#dc2626",bg:"#fee2e2"}].map(s=>(
          <div key={s.label} style={{background:s.bg,border:`1.5px solid ${s.color}22`,borderRadius:12,padding:"14px 16px"}}>
            <p style={{margin:"0 0 4px",fontSize:22,fontWeight:800,color:s.color,lineHeight:1}}>{s.val}</p>
            <p style={{margin:0,fontSize:11.5,fontWeight:600,color:s.color,opacity:.75}}>{s.label}</p>
          </div>
        ))}
      </div>
      <div className={t.toolbar}>
        <div className={t.toolbarLeft}>
          <div className={t.searchBox}><Search size={14} className={t.searchIcon}/><input className={t.searchInput} placeholder="Search by email…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <select className={t.filterSelect} value={rf} onChange={e=>setRf(e.target.value)}><option>All</option><option>Admin</option><option>Vendor</option><option>Technical Support</option></select>
          <select className={t.filterSelect} value={sf} onChange={e=>setSf(e.target.value)}><option>All</option><option>Pending</option><option>Accepted</option><option>Expired</option><option>Cancelled</option></select>
        </div>
        <button className={`${t.btn} ${t.btnPrimary}`} onClick={()=>setShowInvite(true)}><Send size={14}/> Send Invitation</button>
      </div>
      <div className={t.tableCard}>
        <div className={t.tableWrap}>
          <table className={t.table}>
            <thead><tr><th>Email</th><th>Invited As</th><th>Status</th><th>Sent</th><th>Expires</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length===0?(<tr><td colSpan={6}><div className={t.emptyState}><div className={t.emptyIcon}><Mail size={24}/></div><h3 className={t.emptyTitle}>No invitations found</h3></div></td></tr>)
              :filtered.map(inv=>{
                const cfg=STATUS_CFG[inv.status]||{bg:"#f1f5f9",color:"#64748b",icon:Clock};
                const Icon=cfg.icon;
                return (
                  <tr key={inv.id}>
                    <td style={{fontWeight:600}}>{inv.email}</td>
                    <td><span style={{fontSize:12.5,fontWeight:700,color:"var(--adm-text-muted)"}}>{inv.role}</span></td>
                    <td><span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:700,background:cfg.bg,color:cfg.color}}><Icon size={11}/>{inv.status}</span></td>
                    <td style={{fontSize:12,color:"var(--adm-text-muted)"}}>{inv.sent}</td>
                    <td style={{fontSize:12,color:"var(--adm-text-muted)"}}>{inv.expires}</td>
                    <td><div className={t.actions}>
                      {inv.status==="Pending"&&<button className={`${t.actionBtn} ${t.reject}`} title="Cancel invitation" onClick={()=>cancel(inv.id)}><XCircle size={14}/></button>}
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className={t.pagination}><span className={t.pageInfo}>{filtered.length} invitation{filtered.length!==1?"s":""}</span></div>
      </div>
      {showInvite&&<InviteModal onSave={addInvite} onClose={()=>setShowInvite(false)}/>}
    </AdminLayout>
  );
}
