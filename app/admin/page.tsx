"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"

interface Subscription {
  id: string
  tool_name: string
  monthly_cost: number
  user_id: string
}

interface Request {
  id: string
  tool_name: string
  monthly_cost: number
  justification: string
  status: "pending" | "approved" | "denied"
  requested_by: string
}

const IcoDollar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
)
const IcoLayers = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
)
const IcoClock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IcoCheck = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IcoX = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IcoShield = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const IcoLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const IcoActivity = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)
const IcoHome = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const IcoBox = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
)
const Spinner = () => (
  <span style={{ width: 11, height: 11, border: "2px solid rgba(255,255,255,0.15)", borderTopColor: "currentColor", borderRadius: "50%", animation: "admin-spin 0.65s linear infinite", display: "inline-block", flexShrink: 0 }} />
)

export default function AdminPage() {
  const router = useRouter()
  const [subs, setSubs]         = useState<Subscription[]>([])
  const [reqs, setReqs]         = useState<Request[]>([])
  const [adminEmail, setEmail]  = useState("")
  const [loading, setLoading]   = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [visible, setVisible]   = useState(false)
  const [tab, setTab]           = useState<"pending" | "active" | "history">("pending")

  const totalSpend = subs.reduce((s, r) => s + r.monthly_cost, 0)
  const pending    = reqs.filter(r => r.status === "pending")
  const approved   = reqs.filter(r => r.status === "approved")
  const denied     = reqs.filter(r => r.status === "denied")

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push("/login"); return }
    const se = session.user.email
    if (!se) { router.push("/login"); return }
    const { data: u } = await supabase
      .from("users").select("role,email").eq("email", se)
      .single<{ role: string; email: string }>()
    if (!u || u.role !== "admin") { router.push("/dashboard"); return }
    setEmail(u.email)
    const { data: s } = await supabase.from("subscriptions").select("*").returns<Subscription[]>()
    setSubs(s ?? [])
    const { data: r } = await supabase.from("requests").select("*").order("id", { ascending: false }).returns<Request[]>()
    setReqs(r ?? [])
    setLoading(false)
    setTimeout(() => setVisible(true), 80)
  }, [router])

  useEffect(() => { load() }, [load])

  const decide = async (req: Request, dec: "approved" | "denied") => {
    setActionId(req.id)
    const { error } = await supabase.from("requests").update({ status: dec }).eq("id", req.id)
    if (!error && dec === "approved") {
      await supabase.from("subscriptions").insert({
        tool_name: req.tool_name,
        monthly_cost: req.monthly_cost,
        user_id: req.requested_by,
      })
    }
    await load()
    setActionId(null)
  }

  const logout = async () => { await supabase.auth.signOut(); router.push("/login") }
  const initials = (e: string) => e.split("@")[0].slice(0, 2).toUpperCase()

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#07070b", flexDirection: "column", gap: 14, fontFamily: "'GeistMono', monospace" }}>
        <div style={{ width: 24, height: 24, border: "2px solid rgba(255,255,255,0.08)", borderTopColor: "#4f8ef7", borderRadius: "50%", animation: "admin-spin 0.7s linear infinite" }} />
        <span style={{ fontSize: 11, color: "#3e4260" }}>Loading dashboard…</span>
        <style>{`@keyframes admin-spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  const navItems = [
    { label: "Overview",      icon: <IcoHome />,     key: "pending",  count: pending.length > 0 ? pending.length : null, countType: "warn" },
    { label: "Subscriptions", icon: <IcoBox />,       key: "active",   count: subs.length,  countType: "blue" },
    { label: "History",       icon: <IcoActivity />,  key: "history",  count: reqs.length,  countType: "blue" },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg:      #07070b;
          --s0:      #0b0b10;
          --s1:      #0e0e15;
          --s2:      #12121b;
          --s3:      #171723;
          --b0:      rgba(255,255,255,0.04);
          --b1:      rgba(255,255,255,0.08);
          --b2:      rgba(255,255,255,0.13);
          --t1:      #ededff;
          --t2:      #8890b4;
          --t3:      #404468;
          --t4:      #21233a;
          --blue:    #4f8ef7;
          --blue-d:  rgba(79,142,247,0.08);
          --blue-b:  rgba(79,142,247,0.18);
          --green:   #00d68f;
          --green-d: rgba(0,214,143,0.07);
          --green-b: rgba(0,214,143,0.18);
          --amber:   #f5a623;
          --amber-d: rgba(245,166,35,0.07);
          --amber-b: rgba(245,166,35,0.2);
          --red:     #fb4f72;
          --red-d:   rgba(251,79,114,0.07);
          --red-b:   rgba(251,79,114,0.18);
          --violet:  #9b7ff4;
          --violet-d:rgba(155,127,244,0.07);
          --violet-b:rgba(155,127,244,0.18);
          --f:  'Inter', sans-serif;
          --fm: 'JetBrains Mono', monospace;
          --r: 7px;
          --r2: 11px;
        }
        html, body { height: 100%; background: var(--bg); overflow-x: hidden; }
        @keyframes admin-spin  { to { transform: rotate(360deg); } }
        @keyframes admin-in    { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes admin-row   { from { opacity:0; transform:translateX(-5px); } to { opacity:1; transform:translateX(0); } }
        @keyframes admin-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .root { font-family:var(--f); -webkit-font-smoothing:antialiased; min-height:100vh; background:var(--bg); color:var(--t1); display:flex; }

        /* grid background */
        .root::before {
          content:''; position:fixed; inset:0; z-index:0; pointer-events:none;
          background-image: linear-gradient(var(--b0) 1px,transparent 1px), linear-gradient(90deg,var(--b0) 1px,transparent 1px);
          background-size: 44px 44px;
        }
        /* top glow */
        .root::after {
          content:''; position:fixed; top:-80px; left:50%; transform:translateX(-50%);
          width:700px; height:220px; z-index:0; pointer-events:none;
          background: radial-gradient(ellipse at 50% 0%, rgba(79,142,247,0.1) 0%, transparent 60%);
        }

        /* ── SIDEBAR ── */
        .sidebar {
          position: fixed; left:0; top:0; bottom:0; width:212px; z-index:60;
          background: rgba(7,7,11,0.92); backdrop-filter: blur(24px);
          border-right: 1px solid var(--b0);
          display: flex; flex-direction: column;
        }
        .sb-brand {
          display:flex; align-items:center; gap:9px;
          padding:16px 18px 14px;
          border-bottom: 1px solid var(--b0);
        }
        .sb-logo {
          width:30px; height:30px; border-radius:8px;
          background: linear-gradient(135deg, #4f8ef7, #9b7ff4);
          display:flex; align-items:center; justify-content:center; color:#fff;
          box-shadow: 0 0 18px rgba(79,142,247,0.28); flex-shrink:0;
        }
        .sb-name { font-size:13.5px; font-weight:700; letter-spacing:-0.4px; color:var(--t1); }
        .sb-badge {
          font-size:8.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;
          background:var(--blue-d); color:var(--blue); border:1px solid var(--blue-b);
          border-radius:4px; padding:1px 5px; margin-left:2px;
        }
        .sb-nav { padding:12px 10px; flex:1; display:flex; flex-direction:column; gap:1px; }
        .sb-section { font-size:9px; font-weight:600; text-transform:uppercase; letter-spacing:0.7px; color:var(--t4); padding:8px 8px 4px; margin-top:4px; }
        .sb-item {
          display:flex; align-items:center; gap:8px; padding:7px 9px;
          border-radius:var(--r); cursor:pointer; transition:all 0.1s;
          font-size:12.5px; font-weight:500; color:var(--t3);
          border:none; background:none; font-family:var(--f); width:100%; text-align:left;
        }
        .sb-item:hover { color:var(--t2); background:var(--b0); }
        .sb-item.active { color:var(--t1); background:var(--s2); }
        .sb-item.active .sb-ico { color:var(--blue); }
        .sb-ico { flex-shrink:0; transition:color 0.1s; color:var(--t4); }
        .sb-count {
          margin-left:auto; font-size:9px; font-weight:700; font-family:var(--fm);
          border-radius:10px; padding:1px 5px; min-width:16px; text-align:center;
        }
        .sc-warn { background:var(--amber); color:#000; }
        .sc-blue { background:var(--blue-d); color:var(--blue); border:1px solid var(--blue-b); }
        .sb-footer {
          padding:12px 10px; border-top:1px solid var(--b0);
          display:flex; align-items:center; gap:8px;
        }
        .sb-avatar {
          width:28px; height:28px; border-radius:8px;
          background:var(--blue-d); border:1px solid var(--blue-b);
          display:flex; align-items:center; justify-content:center;
          font-size:9.5px; font-weight:700; color:var(--blue); font-family:var(--fm); flex-shrink:0;
        }
        .sb-user { flex:1; min-width:0; }
        .sb-email { font-size:10px; color:var(--t2); font-family:var(--fm); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .sb-role  { font-size:9px; color:var(--t3); text-transform:uppercase; letter-spacing:0.3px; margin-top:1px; }
        .sb-logout {
          width:26px; height:26px; border-radius:6px; display:flex; align-items:center; justify-content:center;
          color:var(--t3); border:1px solid var(--b0); background:none; cursor:pointer; transition:all 0.12s; flex-shrink:0;
        }
        .sb-logout:hover { color:var(--red); border-color:var(--red-b); background:var(--red-d); }

        /* ── TOPBAR ── */
        .topbar {
          position:fixed; top:0; left:212px; right:0; height:50px; z-index:50;
          background:rgba(7,7,11,0.88); backdrop-filter:blur(24px);
          border-bottom:1px solid var(--b0);
          display:flex; align-items:center; justify-content:space-between;
          padding:0 24px;
        }
        .breadcrumb { display:flex; align-items:center; gap:6px; font-size:11.5px; font-family:var(--fm); color:var(--t3); }
        .bc-sep { color:var(--t4); }
        .bc-active { color:var(--t1); }
        .topbar-right { display:flex; align-items:center; gap:10px; }
        .status-dot { width:6px; height:6px; border-radius:50%; background:var(--green); box-shadow:0 0 7px var(--green); animation:admin-pulse 2.5s infinite; }
        .status-text { font-size:10.5px; font-family:var(--fm); color:var(--t3); }

        /* ── MAIN ── */
        .main { margin-left:212px; padding-top:50px; flex:1; position:relative; z-index:1; }
        .content { padding:24px 24px 80px; max-width:1100px; }

        /* ── PAGE HEADER ── */
        .page-h { margin-bottom:22px; }
        .page-title { font-size:19px; font-weight:700; letter-spacing:-0.6px; color:var(--t1); line-height:1; margin-bottom:4px; }
        .page-sub   { font-size:11px; color:var(--t3); font-family:var(--fm); }

        /* ── STAT CARDS ── */
        .stats { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:22px; }
        @media(max-width:1000px){ .stats{grid-template-columns:repeat(2,1fr);} }

        .stat {
          background:var(--s0); border:1px solid var(--b0); border-radius:var(--r2);
          padding:16px 18px; position:relative; overflow:hidden;
          opacity:0; transform:translateY(8px);
          transition:opacity 0.38s ease,transform 0.38s ease,border-color 0.15s;
        }
        .stat::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent);
        }
        .stat:hover { border-color:var(--b1); }
        .stat.show { opacity:1; transform:translateY(0); }

        .stat-top   { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .stat-label { font-size:9.5px; font-weight:600; text-transform:uppercase; letter-spacing:0.6px; color:var(--t3); }
        .stat-icon  { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; }
        .si-green  { background:var(--green-d);  color:var(--green);  border:1px solid var(--green-b); }
        .si-blue   { background:var(--blue-d);   color:var(--blue);   border:1px solid var(--blue-b); }
        .si-amber  { background:var(--amber-d);  color:var(--amber);  border:1px solid var(--amber-b); }
        .si-violet { background:var(--violet-d); color:var(--violet); border:1px solid var(--violet-b); }

        .stat-val   { font-size:27px; font-weight:700; letter-spacing:-1.2px; color:#fff; line-height:1; margin-bottom:9px; font-variant-numeric:tabular-nums; }
        .stat-foot  { display:flex; align-items:center; gap:6px; }
        .chip       { display:inline-flex; align-items:center; gap:3px; font-size:9.5px; font-weight:600; font-family:var(--fm); padding:2px 6px; border-radius:5px; }
        .chip-green { background:var(--green-d); color:var(--green); }
        .chip-flat  { background:var(--s3);      color:var(--t3); }
        .chip-amber { background:var(--amber-d); color:var(--amber); }
        .stat-hint  { font-size:10px; color:var(--t3); font-family:var(--fm); }
        .bar-track  { height:2px; background:var(--s3); border-radius:2px; overflow:hidden; margin-top:9px; }
        .bar-fill   { height:100%; background:linear-gradient(90deg,var(--green),var(--blue)); border-radius:2px; transition:width 1.2s ease; }

        /* ── PANEL ── */
        .panel { background:var(--s0); border:1px solid var(--b0); border-radius:var(--r2); overflow:hidden; }

        .tabs { display:flex; border-bottom:1px solid var(--b0); background:var(--s1); padding:0 18px; }
        .tab-btn {
          font-size:12px; font-weight:500; font-family:var(--f);
          padding:10px 14px; border:none; background:none; cursor:pointer;
          color:var(--t3); position:relative; transition:color 0.12s; white-space:nowrap;
        }
        .tab-btn:hover { color:var(--t2); }
        .tab-btn.on    { color:var(--t1); }
        .tab-btn.on::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:var(--blue); border-radius:2px 2px 0 0; }
        .tab-n {
          display:inline-flex; align-items:center; justify-content:center;
          min-width:16px; height:16px; border-radius:4px;
          font-size:9px; font-weight:700; padding:0 4px; margin-left:5px;
        }
        .tn-warn { background:var(--amber); color:#000; }
        .tn-blue { background:var(--blue-d); color:var(--blue); border:1px solid var(--blue-b); }

        .strip {
          display:flex; align-items:center; gap:16px;
          padding:8px 18px; background:var(--s1); border-bottom:1px solid var(--b0);
          font-size:10.5px; font-family:var(--fm); color:var(--t3);
        }
        .strip-item { display:flex; align-items:center; gap:5px; }
        .strip-dot  { width:5px; height:5px; border-radius:50%; background:currentColor; }

        /* ── TABLE ── */
        .tbl-wrap  { overflow-x:auto; }
        .tbl       { width:100%; border-collapse:collapse; }
        .th {
          font-size:9px; font-weight:600; text-transform:uppercase; letter-spacing:0.6px;
          color:var(--t3); text-align:left; padding:9px 18px;
          background:var(--s1); border-bottom:1px solid var(--b0); white-space:nowrap;
        }
        .td { padding:12px 18px; font-size:12.5px; color:var(--t1); border-bottom:1px solid var(--b0); vertical-align:middle; }
        .tr:last-child .td { border-bottom:none; }
        .tr { opacity:0; transform:translateY(3px); transition:opacity 0.22s ease,transform 0.22s ease,background 0.1s; }
        .tr.show { opacity:1; transform:translateY(0); }
        .tr:hover { background:rgba(255,255,255,0.012); }

        .cell-tool { display:flex; align-items:center; gap:9px; }
        .cdot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
        .tool-name { font-weight:600; font-size:12.5px; }
        .tool-id   { font-size:9.5px; font-family:var(--fm); color:var(--t3); margin-top:1px; }
        .cost-val  { font-family:var(--fm); font-size:12px; color:var(--green); font-weight:500; }
        .email-val { font-family:var(--fm); font-size:10.5px; color:var(--t2); }
        .just-val  { font-size:11.5px; color:var(--t2); max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block; }

        .badge { display:inline-flex; align-items:center; gap:4px; font-size:9px; font-weight:600; text-transform:uppercase; letter-spacing:0.4px; padding:2px 7px; border-radius:20px; }
        .bdot  { width:4px; height:4px; border-radius:50%; background:currentColor; }
        .badge.pending  { background:var(--amber-d); color:var(--amber); border:1px solid var(--amber-b); }
        .badge.approved { background:var(--green-d); color:var(--green); border:1px solid var(--green-b); }
        .badge.denied   { background:var(--red-d);   color:var(--red);   border:1px solid var(--red-b); }

        .actions { display:flex; gap:5px; }
        .btn {
          display:inline-flex; align-items:center; gap:4px;
          font-size:11px; font-weight:600; font-family:var(--f);
          padding:5px 10px; border-radius:var(--r); border:1px solid;
          cursor:pointer; transition:all 0.12s; white-space:nowrap;
        }
        .btn:disabled { opacity:0.35; cursor:not-allowed; }
        .btn-approve { background:var(--green-d); color:var(--green); border-color:var(--green-b); }
        .btn-approve:hover:not(:disabled) { background:rgba(0,214,143,0.12); box-shadow:0 0 10px rgba(0,214,143,0.12); }
        .btn-deny    { background:var(--red-d);   color:var(--red);   border-color:var(--red-b); }
        .btn-deny:hover:not(:disabled)    { background:rgba(251,79,114,0.12); }

        .empty { padding:44px 18px; text-align:center; font-size:11.5px; color:var(--t3); font-family:var(--fm); display:flex; flex-direction:column; align-items:center; gap:8px; }
        .empty-icon { width:34px; height:34px; border-radius:9px; background:var(--s2); border:1px solid var(--b0); display:flex; align-items:center; justify-content:center; color:var(--t3); margin-bottom:2px; }
      `}</style>

      <div className="root">
        {/* ─── SIDEBAR ─── */}
        <aside className="sidebar">
          <div className="sb-brand">
            <div className="sb-logo"><IcoShield /></div>
            <span className="sb-name">SubGuard</span>
            <span className="sb-badge">Admin</span>
          </div>

          <nav className="sb-nav">
            <span className="sb-section">Management</span>
            {navItems.map(item => (
              <button
                key={item.key}
                className={`sb-item${tab === item.key ? " active" : ""}`}
                onClick={() => setTab(item.key as typeof tab)}
              >
                <span className="sb-ico">{item.icon}</span>
                {item.label}
                {item.count !== null && item.count! > 0 && (
                  <span className={`sb-count ${item.countType === "warn" ? "sc-warn" : "sc-blue"}`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="sb-footer">
            <div className="sb-avatar">{initials(adminEmail)}</div>
            <div className="sb-user">
              <div className="sb-email">{adminEmail}</div>
              <div className="sb-role">Administrator</div>
            </div>
            <button className="sb-logout" onClick={logout} title="Sign out"><IcoLogout /></button>
          </div>
        </aside>

        {/* ─── TOPBAR ─── */}
        <header className="topbar">
          <div className="breadcrumb">
            <span>subguard</span>
            <span className="bc-sep">/</span>
            <span>admin</span>
            <span className="bc-sep">/</span>
            <span className="bc-active">
              {tab === "pending" ? "overview" : tab === "active" ? "subscriptions" : "history"}
            </span>
          </div>
          <div className="topbar-right">
            <div className="status-dot" />
            <span className="status-text">All systems operational</span>
          </div>
        </header>

        {/* ─── MAIN ─── */}
        <main className="main">
          <div className="content">
            <div className="page-h">
              <h1 className="page-title">Admin Dashboard</h1>
              <p className="page-sub">Company-wide subscription overview and request management.</p>
            </div>

            {/* ── STAT CARDS ── */}
            <div className="stats">
              <div className={`stat${visible ? " show" : ""}`} style={{ transitionDelay: "0ms" }} data-test="total-spend">
                <div className="stat-top">
                  <span className="stat-label">Total Monthly Spend</span>
                  <span className="stat-icon si-green"><IcoDollar /></span>
                </div>
                <div className="stat-val">${totalSpend.toLocaleString()}</div>
                <div className="stat-foot">
                  <span className={`chip ${totalSpend > 0 ? "chip-green" : "chip-flat"}`}>
                    {totalSpend > 0 ? "↑ Active" : "— Empty"}
                  </span>
                  <span className="stat-hint">across {subs.length} tools</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: subs.length > 0 ? "72%" : "0%" }} />
                </div>
              </div>

              <div className={`stat${visible ? " show" : ""}`} style={{ transitionDelay: "55ms" }}>
                <div className="stat-top">
                  <span className="stat-label">Active Subscriptions</span>
                  <span className="stat-icon si-blue"><IcoLayers /></span>
                </div>
                <div className="stat-val">{subs.length}</div>
                <div className="stat-foot">
                  <span className="chip chip-flat">— Stable</span>
                  <span className="stat-hint">company-wide</span>
                </div>
              </div>

              <div className={`stat${visible ? " show" : ""}`} style={{ transitionDelay: "110ms" }}>
                <div className="stat-top">
                  <span className="stat-label">Pending Requests</span>
                  <span className="stat-icon si-amber"><IcoClock /></span>
                </div>
                <div className="stat-val">{pending.length}</div>
                <div className="stat-foot">
                  <span className={`chip ${pending.length > 0 ? "chip-amber" : "chip-flat"}`}>
                    {pending.length > 0 ? "⚠ Review needed" : "— Clear"}
                  </span>
                </div>
              </div>

              <div className={`stat${visible ? " show" : ""}`} style={{ transitionDelay: "165ms" }}>
                <div className="stat-top">
                  <span className="stat-label">Approved This Cycle</span>
                  <span className="stat-icon si-violet"><IcoActivity /></span>
                </div>
                <div className="stat-val">{approved.length}</div>
                <div className="stat-foot">
                  <span className="chip chip-flat">— {denied.length} denied</span>
                  <span className="stat-hint">total reviewed</span>
                </div>
              </div>
            </div>

            {/* ── PANEL ── */}
            <div className="panel">
              <div className="tabs">
                <button className={`tab-btn${tab === "pending" ? " on" : ""}`} onClick={() => setTab("pending")}>
                  Pending Requests
                  {pending.length > 0 && <span className="tab-n tn-warn">{pending.length}</span>}
                </button>
                <button className={`tab-btn${tab === "active" ? " on" : ""}`} onClick={() => setTab("active")}>
                  All Subscriptions
                  <span className="tab-n tn-blue">{subs.length}</span>
                </button>
                <button className={`tab-btn${tab === "history" ? " on" : ""}`} onClick={() => setTab("history")}>
                  Request History
                  <span className="tab-n tn-blue">{reqs.length}</span>
                </button>
              </div>

              {/* ── PENDING TAB ── */}
              {tab === "pending" && (
                <>
                  <div className="strip">
                    <span className="strip-item" style={{ color: "var(--amber)" }}><span className="strip-dot" />{pending.length} pending</span>
                    <span className="strip-item" style={{ color: "var(--green)" }}><span className="strip-dot" />{approved.length} approved</span>
                    <span className="strip-item" style={{ color: "var(--red)" }}><span className="strip-dot" />{denied.length} denied</span>
                  </div>
                  <div className="tbl-wrap">
                    {pending.length === 0 ? (
                      <div className="empty">
                        <div className="empty-icon"><IcoCheck /></div>
                        No pending requests — inbox zero.
                      </div>
                    ) : (
                      <table className="tbl">
                        <thead>
                          <tr>
                            <th className="th">Tool</th>
                            <th className="th">Monthly Cost</th>
                            <th className="th">Requested By</th>
                            <th className="th">Justification</th>
                            <th className="th">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pending.map((req, i) => (
                            <tr
                              key={req.id}
                              className={`tr${visible ? " show" : ""}`}
                              style={{ transitionDelay: `${i * 40}ms` }}
                              data-test="pending-request-row"
                            >
                              <td className="td">
                                <div className="cell-tool">
                                  <span className="cdot" style={{ background: "var(--amber)", boxShadow: "0 0 6px var(--amber)" }} />
                                  <div>
                                    <div className="tool-name">{req.tool_name}</div>
                                    <div className="tool-id">#{req.id.slice(0, 8)}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="td"><span className="cost-val">${req.monthly_cost}/mo</span></td>
                              <td className="td"><span className="email-val">{req.requested_by}</span></td>
                              <td className="td"><span className="just-val" title={req.justification}>{req.justification}</span></td>
                              <td className="td">
                                <div className="actions">
                                  <button
                                    className="btn btn-approve"
                                    disabled={actionId === req.id}
                                    data-test="approve-btn"
                                    onClick={() => decide(req, "approved")}
                                  >
                                    {actionId === req.id ? <Spinner /> : <IcoCheck />} Approve
                                  </button>
                                  <button
                                    className="btn btn-deny"
                                    disabled={actionId === req.id}
                                    data-test="deny-btn"
                                    onClick={() => decide(req, "denied")}
                                  >
                                    {actionId === req.id ? <Spinner /> : <IcoX />} Deny
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}

              {/* ── ACTIVE SUBSCRIPTIONS TAB ── */}
              {tab === "active" && (
                <div className="tbl-wrap">
                  {subs.length === 0 ? (
                    <div className="empty">
                      <div className="empty-icon"><IcoLayers /></div>
                      No active subscriptions yet.
                    </div>
                  ) : (
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th className="th">Tool</th>
                          <th className="th">Monthly Cost</th>
                          <th className="th">User ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subs.map((sub, i) => (
                          <tr key={sub.id} className={`tr${visible ? " show" : ""}`} style={{ transitionDelay: `${i * 35}ms` }}>
                            <td className="td">
                              <div className="cell-tool">
                                <span className="cdot" style={{ background: "var(--blue)", boxShadow: "0 0 6px var(--blue)" }} />
                                <div className="tool-name">{sub.tool_name}</div>
                              </div>
                            </td>
                            <td className="td"><span className="cost-val">${sub.monthly_cost}/mo</span></td>
                            <td className="td"><span className="email-val">{sub.user_id}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* ── HISTORY TAB ── */}
              {tab === "history" && (
                <div className="tbl-wrap">
                  {reqs.length === 0 ? (
                    <div className="empty">
                      <div className="empty-icon"><IcoClock /></div>
                      No requests submitted yet.
                    </div>
                  ) : (
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th className="th">Tool</th>
                          <th className="th">Cost</th>
                          <th className="th">Requested By</th>
                          <th className="th">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reqs.map((req, i) => (
                          <tr key={req.id} className={`tr${visible ? " show" : ""}`} style={{ transitionDelay: `${i * 35}ms` }}>
                            <td className="td">
                              <div className="cell-tool">
                                <span className="cdot" style={{
                                  background: req.status === "approved" ? "var(--green)" : req.status === "denied" ? "var(--red)" : "var(--amber)",
                                  boxShadow: req.status === "approved" ? "0 0 6px var(--green)" : "none",
                                }} />
                                <div className="tool-name">{req.tool_name}</div>
                              </div>
                            </td>
                            <td className="td"><span className="cost-val">${req.monthly_cost}/mo</span></td>
                            <td className="td"><span className="email-val">{req.requested_by}</span></td>
                            <td className="td">
                              <span className={`badge ${req.status}`}>
                                <span className="bdot" />{req.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}