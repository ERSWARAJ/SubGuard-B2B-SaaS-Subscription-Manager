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
  requester_email?: string
  denial_reason?: string
  reviewed_by?: string
  reviewed_at?: string
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
const IcoSun = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)
const IcoMoon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
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
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [userMap, setUserMap]   = useState<Record<string, string>>({})
  const [denyModalReq, setDenyModalReq] = useState<Request | null>(null)
  const [denialReason, setDenialReason] = useState<string>("")
  const [adminId, setAdminId]   = useState<string>("")
  const [addSubModal, setAddSubModal] = useState<boolean>(false)
  const [addSubForm, setAddSubForm] = useState({ tool_name: "", monthly_cost: "", user_id: "" })
  const [addSubErr, setAddSubErr] = useState<Record<string, string>>({})
  const [addSubLoading, setAddSubLoading] = useState<boolean>(false)
  const [users, setUsers] = useState<{ id: string; email: string }[]>([])
  const [search, setSearch] = useState<string>("")
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sg-theme") !== "light"
    }
    return true
  })

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light")
  }, [darkMode])
  
  // ── IDLE TIMEOUT: 30 minutes ──
  useEffect(() => {
    const TIMEOUT = 30 * 60 * 1000
    let timer: ReturnType<typeof setTimeout>
    const reset = () => {
      clearTimeout(timer)
      timer = setTimeout(async () => {
        await supabase.auth.signOut()
        router.push("/login")
      }, TIMEOUT)
    }
    const events = ["mousedown", "keydown", "touchstart", "scroll"]
    events.forEach(e => window.addEventListener(e, reset))
    reset()
    return () => {
      clearTimeout(timer)
      events.forEach(e => window.removeEventListener(e, reset))
    }
  }, [router])

  const totalSpend = subs.reduce((s, r) => s + Number(r.monthly_cost), 0)
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
    setAdminId(session.user.id)
    const { data: s } = await supabase.from("subscriptions").select("*").returns<Subscription[]>()
    setSubs(s ?? [])
    const { data: r } = await supabase.from("requests").select("*").order("id", { ascending: false }).returns<Request[]>()
    const { data: allUsers } = await supabase.from("users").select("id, email")
    const map = Object.fromEntries((allUsers ?? []).map((u: { id: string; email: string }) => [u.id, u.email]))
    setUserMap(map)
    const enriched = (r ?? []).map(req => ({ ...req, requester_email: map[req.requested_by] ?? req.requested_by }))
    setReqs(enriched)
    const { data: empList } = await supabase.from("users").select("id, email").eq("role", "employee")
    setUsers(empList ?? [])
    setLoading(false)
    setTimeout(() => setVisible(true), 80)
  }, [router])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const channel = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "requests" }, () => { load() })
      .on("postgres_changes", { event: "*", schema: "public", table: "subscriptions" }, () => { load() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [load])

  const handleAddSub = async () => {
    const errs: Record<string, string> = {}
    if (!addSubForm.tool_name.trim()) errs.tool_name = "Tool name is required."
    if (!addSubForm.monthly_cost) errs.monthly_cost = "Monthly cost is required."
    else if (isNaN(Number(addSubForm.monthly_cost)) || Number(addSubForm.monthly_cost) <= 0)
      errs.monthly_cost = "Enter a valid positive number."
    if (!addSubForm.user_id) errs.user_id = "Please assign to a user."
    if (Object.keys(errs).length) { setAddSubErr(errs); return }
    setAddSubLoading(true)
    const { error } = await supabase.from("subscriptions").insert({
      tool_name: addSubForm.tool_name.trim(),
      monthly_cost: Number(addSubForm.monthly_cost),
      user_id: addSubForm.user_id,
    })
    setAddSubLoading(false)
    if (error) { setAddSubErr({ tool_name: error.message }); return }
    setAddSubModal(false)
    setAddSubForm({ tool_name: "", monthly_cost: "", user_id: "" })
    setAddSubErr({})
    await load()
  }

  const decide = async (req: Request, dec: "approved" | "denied", reason?: string) => {
    setActionId(req.id)
    const updateData: Record<string, string> = {
      status: dec,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    }
    if (dec === "denied" && reason) updateData.denial_reason = reason
    const { error } = await supabase.from("requests").update(updateData).eq("id", req.id)
    if (!error && dec === "approved") {
      await supabase.from("subscriptions").insert({
        tool_name: req.tool_name,
        monthly_cost: req.monthly_cost,
        user_id: req.requested_by,
      })
    }
    await load()
    setActionId(null)
    setDenyModalReq(null)
    setDenialReason("")
  }

  const logout = () => setShowLogoutModal(true)
  const confirmLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const initials = (e: string) => e.split("@")[0].slice(0, 2).toUpperCase()

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#07070b", flexDirection: "column", gap: 14, fontFamily: "'Inter', sans-serif" }}>
        <div style={{ width: 24, height: 24, border: "2px solid rgba(255,255,255,0.08)", borderTopColor: "#4f8ef7", borderRadius: "50%", animation: "admin-spin 0.7s linear infinite" }} />
        <span style={{ fontSize: 12, color: "#6068a0", fontWeight: 500 }}>Loading dashboard…</span>
        <style>{`@keyframes admin-spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  const navItems = [
    { label: "Overview",      icon: <IcoHome />,    key: "pending",  count: pending.length > 0 ? pending.length : null, countType: "warn" },
    { label: "Subscriptions", icon: <IcoBox />,      key: "active",   count: subs.length,  countType: "blue" },
    { label: "History",       icon: <IcoActivity />, key: "history",  count: reqs.length,  countType: "blue" },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:      #07070b;
          --s0:      #0b0b10;
          --s1:      #0e0e15;
          --s2:      #12121b;
          --s3:      #171723;
          --b0:      rgba(255,255,255,0.05);
          --b1:      rgba(255,255,255,0.09);
          --b2:      rgba(255,255,255,0.14);
          --t1:      #f0f0ff;
          --t2:      #a0a8cc;
          --t3:      #6068a0;
          --t4:      #383c60;
          --blue:    #4f8ef7;
          --blue-d:  rgba(79,142,247,0.1);
          --blue-b:  rgba(79,142,247,0.22);
          --blue-g:  rgba(79,142,247,0.22);
          --blue-r:  rgba(79,142,247,0.15);
          --green:   #00d68f;
          --green-d: rgba(0,214,143,0.08);
          --green-b: rgba(0,214,143,0.2);
          --amber:   #f5a623;
          --amber-d: rgba(245,166,35,0.08);
          --amber-b: rgba(245,166,35,0.2);
          --red:     #fb4f72;
          --red-d:   rgba(251,79,114,0.08);
          --red-b:   rgba(251,79,114,0.2);
          --violet:  #9b7ff4;
          --violet-d:rgba(155,127,244,0.08);
          --violet-b:rgba(155,127,244,0.22);
          --f:  'Inter', sans-serif;
          --fm: 'JetBrains Mono', monospace;
          --r: 8px;
          --r2: 11px;
        }

        :root[data-theme="light"] {
          --bg:      #eef0f7;
          --s0:      #f5f6fb;
          --s1:      #eceef7;
          --s2:      #e2e5f0;
          --s3:      #d8dcea;
          --b0:      rgba(0,0,0,0.06);
          --b1:      rgba(0,0,0,0.11);
          --b2:      rgba(0,0,0,0.17);
          --t1:      #0a0b18;
          --t2:      #2e3350;
          --t3:      #555c8a;
          --t4:      #8088b8;
          --blue:    #3d7ef5;
          --blue-d:  rgba(61,126,245,0.1);
          --blue-b:  rgba(61,126,245,0.25);
          --blue-g:  rgba(61,126,245,0.2);
          --blue-r:  rgba(61,126,245,0.15);
          --green:   #00a86b;
          --green-d: rgba(0,168,107,0.1);
          --green-b: rgba(0,168,107,0.25);
          --amber:   #c87800;
          --amber-d: rgba(200,120,0,0.1);
          --amber-b: rgba(200,120,0,0.25);
          --red:     #dc2850;
          --red-d:   rgba(220,40,80,0.08);
          --red-b:   rgba(220,40,80,0.22);
          --violet:  #7c5ce4;
          --violet-d:rgba(124,92,228,0.1);
          --violet-b:rgba(124,92,228,0.25);
        }

        html, body { height: 100%; background: var(--bg); overflow-x: hidden; }
        @keyframes admin-spin  { to { transform: rotate(360deg); } }
        @keyframes admin-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .root { font-family:var(--f); -webkit-font-smoothing:antialiased; min-height:100vh; background:var(--bg); color:var(--t1); display:flex; }
        .root::before { content:''; position:fixed; inset:0; z-index:0; pointer-events:none;
          background-image:linear-gradient(var(--b0) 1px,transparent 1px),linear-gradient(90deg,var(--b0) 1px,transparent 1px);
          background-size:44px 44px; }
        .root::after { content:''; position:fixed; top:-80px; left:50%; transform:translateX(-50%);
          width:700px; height:220px; z-index:0; pointer-events:none;
          background:radial-gradient(ellipse at 50% 0%,rgba(79,142,247,0.08) 0%,transparent 60%); }

        .sidebar { position:fixed; left:0; top:0; bottom:0; width:220px; z-index:60;
          background:var(--s0); border-right:1px solid var(--b1); display:flex; flex-direction:column; }
        .sb-brand { display:flex; align-items:center; gap:9px; padding:16px 18px 14px; border-bottom:1px solid var(--b1); }
        .sb-logo { width:32px; height:32px; border-radius:8px;
          background:linear-gradient(135deg,#4f8ef7,#9b7ff4);
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 0 18px rgba(79,142,247,0.28); flex-shrink:0; overflow:hidden; }
        .sb-name { font-size:14px; font-weight:700; letter-spacing:-0.4px; color:var(--t1); font-family:var(--f); }
        .sb-badge { font-size:8.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;
          background:var(--blue-d); color:var(--blue); border:1px solid var(--blue-b);
          border-radius:4px; padding:1px 5px; margin-left:2px; }
        .sb-nav { padding:12px 10px; flex:1; display:flex; flex-direction:column; gap:1px; }
        .sb-section { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.7px;
          color:var(--t4); padding:8px 8px 4px; margin-top:4px; font-family:var(--f); }
        .sb-item { display:flex; align-items:center; gap:8px; padding:8px 10px;
          border-radius:var(--r); cursor:pointer; transition:all 0.12s;
          font-size:13px; font-weight:500; color:var(--t3);
          border:none; background:none; font-family:var(--f); width:100%; text-align:left; }
        .sb-item:hover { color:var(--t1); background:var(--b1); }
        .sb-item.active { color:var(--t1); background:var(--s2); font-weight:600; }
        .sb-item.active .sb-ico { color:var(--blue); }
        .sb-ico { flex-shrink:0; transition:color 0.1s; color:var(--t3); }
        .sb-count { margin-left:auto; font-size:9px; font-weight:700; font-family:var(--f);
          border-radius:10px; padding:1px 6px; min-width:18px; text-align:center; }
        .sc-warn { background:var(--amber); color:#000; }
        .sc-blue { background:var(--blue-d); color:var(--blue); border:1px solid var(--blue-b); }
        .sb-footer { padding:12px 10px; border-top:1px solid var(--b1); display:flex; align-items:center; gap:8px; }
        .sb-avatar { width:30px; height:30px; border-radius:8px;
          background:var(--blue-d); border:1px solid var(--blue-b);
          display:flex; align-items:center; justify-content:center;
          font-size:10px; font-weight:700; color:var(--blue); font-family:var(--f); flex-shrink:0; }
        .sb-user { flex:1; min-width:0; }
        .sb-email { font-size:10.5px; color:var(--t2); font-family:var(--f); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:500; }
        .sb-role  { font-size:9px; color:var(--t3); text-transform:uppercase; letter-spacing:0.3px; margin-top:1px; font-family:var(--f); font-weight:600; }
        .sb-logout { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center;
          color:var(--t3); border:1px solid var(--b1); background:none; cursor:pointer; transition:all 0.12s; flex-shrink:0; }
        .sb-logout:hover { color:var(--red); border-color:var(--red-b); background:var(--red-d); }

        .topbar { position:fixed; top:0; left:220px; right:0; height:52px; z-index:50;
          background:var(--s0); border-bottom:1px solid var(--b1);
          display:flex; align-items:center; justify-content:space-between; padding:0 24px; }
        .breadcrumb { display:flex; align-items:center; gap:6px; font-size:12px; font-family:var(--f); color:var(--t3); font-weight:500; }
        .bc-sep { color:var(--t4); }
        .bc-active { color:var(--t1); font-weight:600; }
        .topbar-right { display:flex; align-items:center; gap:10px; }
        .status-pill { display:flex; align-items:center; gap:5px;
          font-size:11px; font-family:var(--f); color:var(--t3); font-weight:500;
          background:var(--s1); border:1px solid var(--b1); border-radius:20px; padding:4px 10px; }
        .status-dot { width:6px; height:6px; border-radius:50%; background:#00d68f; box-shadow:0 0 7px #00d68f; animation:admin-pulse 2.5s infinite; flex-shrink:0; }
        .theme-toggle { display:flex; align-items:center; gap:5px;
          background:var(--s2); border:1px solid var(--b2); border-radius:20px; padding:5px 12px;
          cursor:pointer; transition:all 0.15s; font-size:11px; font-weight:600; color:var(--t2); font-family:var(--f); }
        .theme-toggle:hover { border-color:var(--blue-b); color:var(--t1); }

        .main { margin-left:220px; padding-top:52px; flex:1; position:relative; z-index:1; }
        .content { padding:24px 24px 80px; max-width:1100px; }
        .page-h { margin-bottom:22px; }
        .page-title { font-size:20px; font-weight:800; letter-spacing:-0.7px; color:var(--t1); line-height:1; margin-bottom:5px; font-family:var(--f); }
        .page-sub { font-size:12px; color:var(--t3); font-family:var(--f); font-weight:400; }

        .stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:22px; }
        @media(max-width:1000px){ .stats{grid-template-columns:repeat(2,1fr);} }
        .stat { background:var(--s0); border:1px solid var(--b1); border-radius:var(--r2);
          padding:16px 18px; position:relative; overflow:hidden;
          opacity:0; transform:translateY(8px);
          transition:opacity 0.38s ease,transform 0.38s ease,border-color 0.15s; }
        .stat::before { content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,var(--b2),transparent); }
        .stat:hover { border-color:var(--b2); }
        .stat.show { opacity:1; transform:translateY(0); }
        .stat-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .stat-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; color:var(--t3); font-family:var(--f); }
        .stat-icon { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; }
        .si-green { background:var(--green-d); color:var(--green); border:1px solid var(--green-b); }
        .si-blue  { background:var(--blue-d);  color:var(--blue);  border:1px solid var(--blue-b); }
        .si-amber { background:var(--amber-d); color:var(--amber); border:1px solid var(--amber-b); }
        .si-violet{ background:var(--violet-d);color:var(--violet);border:1px solid var(--violet-b); }
        .stat-val { font-size:28px; font-weight:800; letter-spacing:-1.2px; color:var(--t1); line-height:1; margin-bottom:9px; font-variant-numeric:tabular-nums; font-family:var(--f); }
        .stat-foot { display:flex; align-items:center; gap:6px; }
        .chip { display:inline-flex; align-items:center; gap:3px; font-size:10px; font-weight:600; font-family:var(--f); padding:2px 7px; border-radius:5px; }
        .chip-green { background:var(--green-d); color:var(--green); }
        .chip-flat  { background:var(--s2); color:var(--t3); }
        .chip-amber { background:var(--amber-d); color:var(--amber); }
        .stat-hint { font-size:10.5px; color:var(--t3); font-family:var(--f); }
        .bar-track { height:2px; background:var(--s3); border-radius:2px; overflow:hidden; margin-top:9px; }
        .bar-fill { height:100%; background:linear-gradient(90deg,var(--green),var(--blue)); border-radius:2px; transition:width 1.2s ease; }

        .chart-panel { background:var(--s0); border:1px solid var(--b1); border-radius:var(--r2); padding:20px 24px; margin-bottom:22px; }
        .chart-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
        .chart-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; color:var(--t3); font-family:var(--f); }
        .chart-total { font-size:11px; font-weight:600; color:var(--green); font-family:var(--fm); }
        .chart-bars { display:flex; flex-direction:column; gap:10px; }
        .chart-row { display:flex; align-items:center; gap:12px; }
        .chart-label { font-size:12px; font-weight:500; color:var(--t2); font-family:var(--f); width:120px; flex-shrink:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .chart-bar-wrap { flex:1; background:var(--s2); border-radius:4px; height:8px; overflow:hidden; }
        .chart-bar { height:100%; border-radius:4px; background:linear-gradient(90deg,var(--blue),var(--violet)); transition:width 1s ease; }
        .chart-val { font-size:11px; font-weight:600; color:var(--t2); font-family:var(--fm); width:60px; text-align:right; flex-shrink:0; }

        .panel { background:var(--s0); border:1px solid var(--b1); border-radius:var(--r2); overflow:hidden; }
        .tabs { display:flex; border-bottom:1px solid var(--b1); background:var(--s1); padding:0 18px; }
        .tab-btn { font-size:12.5px; font-weight:500; font-family:var(--f);
          padding:11px 14px; border:none; background:none; cursor:pointer;
          color:var(--t3); position:relative; transition:color 0.12s; white-space:nowrap; }
        .tab-btn:hover { color:var(--t2); }
        .tab-btn.on { color:var(--t1); font-weight:600; }
        .tab-btn.on::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:var(--blue); border-radius:2px 2px 0 0; }
        .tab-n { display:inline-flex; align-items:center; justify-content:center;
          min-width:16px; height:16px; border-radius:4px;
          font-size:9px; font-weight:700; padding:0 4px; margin-left:5px; font-family:var(--f); }
        .tn-warn { background:var(--amber); color:#000; }
        .tn-blue { background:var(--blue-d); color:var(--blue); border:1px solid var(--blue-b); }
        .strip { display:flex; align-items:center; gap:16px;
          padding:8px 18px; background:var(--s1); border-bottom:1px solid var(--b1);
          font-size:11px; font-family:var(--f); color:var(--t3); font-weight:500; }
        .strip-item { display:flex; align-items:center; gap:5px; }
        .strip-dot { width:5px; height:5px; border-radius:50%; background:currentColor; }
        .tbl-wrap { overflow-x:auto; }
        .tbl { width:100%; border-collapse:collapse; }
        .th { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.6px;
          color:var(--t3); text-align:left; padding:10px 18px;
          background:var(--s1); border-bottom:1px solid var(--b1); white-space:nowrap; font-family:var(--f); }
        .td { padding:13px 18px; font-size:13px; color:var(--t1); border-bottom:1px solid var(--b1); vertical-align:middle; font-family:var(--f); }
        .tr:last-child .td { border-bottom:none; }
        .tr { opacity:0; transform:translateY(3px); transition:opacity 0.22s ease,transform 0.22s ease,background 0.1s; }
        .tr.show { opacity:1; transform:translateY(0); }
        .tr:hover { background:var(--b0); }
        .cell-tool { display:flex; align-items:center; gap:9px; }
        .cdot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
        .tool-name { font-weight:600; font-size:13px; color:var(--t1); font-family:var(--f); }
        .tool-id { font-size:10px; font-family:var(--fm); color:var(--t3); margin-top:1px; }
        .cost-val { font-family:var(--fm); font-size:12.5px; color:var(--green); font-weight:500; }
        .email-val { font-family:var(--f); font-size:12px; color:var(--t2); font-weight:400; }
        .just-val { font-size:12px; color:var(--t2); max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block; font-family:var(--f); }
        .badge { display:inline-flex; align-items:center; gap:4px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.4px; padding:3px 8px; border-radius:20px; font-family:var(--f); }
        .bdot { width:4px; height:4px; border-radius:50%; background:currentColor; }
        .badge.pending  { background:var(--amber-d); color:var(--amber); border:1px solid var(--amber-b); }
        .badge.approved { background:var(--green-d); color:var(--green); border:1px solid var(--green-b); }
        .badge.denied   { background:var(--red-d);   color:var(--red);   border:1px solid var(--red-b); }
        .actions { display:flex; gap:6px; }
        .btn { display:inline-flex; align-items:center; gap:4px;
          font-size:11.5px; font-weight:600; font-family:var(--f);
          padding:6px 12px; border-radius:var(--r); border:1px solid;
          cursor:pointer; transition:all 0.12s; white-space:nowrap; }
        .btn:disabled { opacity:0.35; cursor:not-allowed; }
        .btn-approve { background:var(--green-d); color:var(--green); border-color:var(--green-b); }
        .btn-approve:hover:not(:disabled) { background:rgba(0,214,143,0.15); }
        .btn-deny { background:var(--red-d); color:var(--red); border-color:var(--red-b); }
        .btn-deny:hover:not(:disabled) { background:rgba(251,79,114,0.15); }
        .empty { padding:48px 18px; text-align:center; font-size:12px; color:var(--t3); font-family:var(--f); display:flex; flex-direction:column; align-items:center; gap:8px; font-weight:500; }
        .empty-icon { width:36px; height:36px; border-radius:9px; background:var(--s2); border:1px solid var(--b1); display:flex; align-items:center; justify-content:center; color:var(--t3); margin-bottom:2px; }
      `}</style>

      <div className="root">
        {/* ─── SIDEBAR ─── */}
        <aside className="sidebar">
          <div className="sb-brand">
            <div className="sb-logo">
              <img src="/logo.png" alt="SubGuard" width="22" height="22" style={{ objectFit: "contain" }} />
            </div>
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
            <button className="sb-logout" onClick={logout} data-test="logout-btn" title="Sign out">
              <IcoLogout />
            </button>
          </div>
        </aside>

        {/* ─── MODALS ─── */}
        {addSubModal && (
          <div style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ background:"var(--s1)", border:"1px solid var(--b2)", borderRadius:12, padding:"28px", width:400, fontFamily:"var(--f)" }}>
              <div style={{ fontSize:15, fontWeight:800, color:"var(--t1)", marginBottom:6 }}>Add Subscription</div>
              <div style={{ fontSize:13, color:"var(--t3)", marginBottom:20, fontWeight:400 }}>Manually add an existing company tool to track spend.</div>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.6px", color:"var(--t2)", marginBottom:6, fontFamily:"var(--f)" }}>Tool Name</label>
                <input type="text" placeholder="e.g. Figma, GitHub, Slack…" value={addSubForm.tool_name}
                  onChange={(e) => { setAddSubForm(f => ({ ...f, tool_name: e.target.value })); setAddSubErr(er => ({ ...er, tool_name: "" })) }}
                  style={{ width:"100%", background:"var(--s2)", border:`1px solid ${addSubErr.tool_name ? "var(--red)" : "var(--b2)"}`, borderRadius:8, padding:"10px 12px", fontFamily:"var(--f)", fontSize:13, color:"var(--t1)", outline:"none" }}
                />
                {addSubErr.tool_name && <div style={{ fontSize:11, color:"var(--red)", marginTop:4 }}>{addSubErr.tool_name}</div>}
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.6px", color:"var(--t2)", marginBottom:6, fontFamily:"var(--f)" }}>Monthly Cost (USD)</label>
                <input type="number" min="0" placeholder="e.g. 99" value={addSubForm.monthly_cost}
                  onChange={(e) => { setAddSubForm(f => ({ ...f, monthly_cost: e.target.value })); setAddSubErr(er => ({ ...er, monthly_cost: "" })) }}
                  style={{ width:"100%", background:"var(--s2)", border:`1px solid ${addSubErr.monthly_cost ? "var(--red)" : "var(--b2)"}`, borderRadius:8, padding:"10px 12px", fontFamily:"var(--f)", fontSize:13, color:"var(--t1)", outline:"none" }}
                />
                {addSubErr.monthly_cost && <div style={{ fontSize:11, color:"var(--red)", marginTop:4 }}>{addSubErr.monthly_cost}</div>}
              </div>
              <div style={{ marginBottom:22 }}>
                <label style={{ display:"block", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.6px", color:"var(--t2)", marginBottom:6, fontFamily:"var(--f)" }}>Assign To</label>
                <select value={addSubForm.user_id}
                  onChange={(e) => { setAddSubForm(f => ({ ...f, user_id: e.target.value })); setAddSubErr(er => ({ ...er, user_id: "" })) }}
                  style={{ width:"100%", background:"var(--s2)", border:`1px solid ${addSubErr.user_id ? "var(--red)" : "var(--b2)"}`, borderRadius:8, padding:"10px 12px", fontFamily:"var(--f)", fontSize:13, color:"var(--t1)", outline:"none", cursor:"pointer" }}
                >
                  <option value="">Select an employee…</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
                </select>
                {addSubErr.user_id && <div style={{ fontSize:11, color:"var(--red)", marginTop:4 }}>{addSubErr.user_id}</div>}
              </div>
              <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
                <button onClick={() => { setAddSubModal(false); setAddSubErr({}) }}
                  style={{ padding:"8px 18px", borderRadius:8, border:"1px solid var(--b2)", background:"none", color:"var(--t2)", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"var(--f)" }}>Cancel</button>
                <button onClick={handleAddSub} disabled={addSubLoading}
                  style={{ padding:"8px 18px", borderRadius:8, border:"1px solid var(--blue-b)", background:"var(--blue)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"var(--f)", opacity: addSubLoading ? 0.5 : 1 }}>
                  {addSubLoading ? "Adding…" : "Add Subscription"}
                </button>
              </div>
            </div>
          </div>
        )}

        {denyModalReq && (
          <div style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ background:"var(--s1)", border:"1px solid var(--b2)", borderRadius:12, padding:"28px", width:380, fontFamily:"var(--f)" }}>
              <div style={{ fontSize:15, fontWeight:800, color:"var(--t1)", marginBottom:6 }}>Deny Request</div>
              <div style={{ fontSize:13, color:"var(--t3)", marginBottom:18, fontWeight:400 }}>
                Denying <strong style={{ color:"var(--t1)" }}>{denyModalReq.tool_name}</strong> — please provide a reason for the employee.
              </div>
              <textarea value={denialReason} onChange={(e) => setDenialReason(e.target.value)}
                placeholder="e.g. Budget constraints, duplicate tool already exists, needs manager approval first…"
                rows={3}
                style={{ width:"100%", background:"var(--s2)", border:"1px solid var(--b2)", borderRadius:8, padding:"10px 12px", fontFamily:"var(--f)", fontSize:13, color:"var(--t1)", outline:"none", resize:"vertical", marginBottom:18 }}
              />
              <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
                <button onClick={() => { setDenyModalReq(null); setDenialReason("") }}
                  style={{ padding:"8px 18px", borderRadius:8, border:"1px solid var(--b2)", background:"none", color:"var(--t2)", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"var(--f)" }}>Cancel</button>
                <button onClick={() => decide(denyModalReq, "denied", denialReason)} disabled={!denialReason.trim()}
                  style={{ padding:"8px 18px", borderRadius:8, border:"1px solid var(--red-b)", background:"var(--red-d)", color:"var(--red)", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"var(--f)", opacity: denialReason.trim() ? 1 : 0.45 }}>
                  Confirm Deny
                </button>
              </div>
            </div>
          </div>
        )}

        {showLogoutModal && (
          <div style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ background:"var(--s1)", border:"1px solid var(--b2)", borderRadius:12, padding:"28px 28px 22px", width:320, fontFamily:"var(--f)" }}>
              <div style={{ fontSize:15, fontWeight:800, color:"var(--t1)", marginBottom:8 }}>Sign out of SubGuard?</div>
              <div style={{ fontSize:13, color:"var(--t3)", marginBottom:22, fontWeight:400 }}>You will be returned to the login screen.</div>
              <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
                <button onClick={() => setShowLogoutModal(false)} style={{ padding:"8px 18px", borderRadius:8, border:"1px solid var(--b2)", background:"none", color:"var(--t2)", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"var(--f)" }}>Cancel</button>
                <button onClick={confirmLogout} style={{ padding:"8px 18px", borderRadius:8, border:"1px solid var(--red-b)", background:"var(--red-d)", color:"var(--red)", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"var(--f)" }}>Sign out</button>
              </div>
            </div>
          </div>
        )}

        {/* ─── TOPBAR ─── */}
        <header className="topbar">
          <div className="breadcrumb">
            <span>subguard</span>
            <span className="bc-sep">/</span>
            <span>admin</span>
            <span className="bc-sep">/</span>
            <span className="bc-active">
              {tab === "pending" ? "Overview" : tab === "active" ? "Subscriptions" : "History"}
            </span>
          </div>
          <div className="topbar-right">
            <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <><IcoSun /> Light</> : <><IcoMoon /> Dark</>}
            </button>
            <div className="status-pill">
              <div className="status-dot" />
              <span>All systems operational</span>
            </div>
          </div>
        </header>

        {/* ─── MAIN ─── */}
        <main className="main">
          <div className="content">
            <div className="page-h">
              <h1 className="page-title">Welcome back, {adminEmail.split("@")[0]}.</h1>
              <p className="page-sub">Company-wide subscription overview and request management.</p>
            </div>

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

            {/* ── SPEND ANALYTICS CHART ── */}
            {subs.length > 0 && (
              <div className="chart-panel">
                <div className="chart-header">
                  <span className="chart-title">Spend Breakdown by Tool</span>
                  <span className="chart-total">${totalSpend.toLocaleString()}/mo total</span>
                </div>
                <div className="chart-bars">
                  {subs.slice().sort((a, b) => b.monthly_cost - a.monthly_cost).map((sub) => (
                    <div key={sub.id} className="chart-row">
                      <span className="chart-label" title={sub.tool_name}>{sub.tool_name}</span>
                      <div className="chart-bar-wrap">
                        <div className="chart-bar" style={{ width: `${Math.round((sub.monthly_cost / totalSpend) * 100)}%` }} />
                      </div>
                      <span className="chart-val">${sub.monthly_cost}/mo</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── PANEL ── */}
            <div className="panel">
              <div style={{ padding:"12px 18px", borderBottom:"1px solid var(--b1)", background:"var(--s1)", display:"flex", alignItems:"center", gap:10 }}>
                <input
                  type="text"
                  placeholder="Search by tool name or user…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ flex:1, background:"var(--s2)", border:"1px solid var(--b2)", borderRadius:"var(--r)", padding:"7px 12px", fontFamily:"var(--f)", fontSize:12, color:"var(--t1)", outline:"none" }}
                />
                {search && (
                  <button onClick={() => setSearch("")}
                    style={{ background:"none", border:"none", color:"var(--t3)", cursor:"pointer", fontSize:13, fontFamily:"var(--f)", padding:"4px 8px" }}>
                    ✕ Clear
                  </button>
                )}
              </div>
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

              {tab === "pending" && (
                <>
                  <div className="strip">
                    <span className="strip-item" style={{ color:"var(--amber)" }}><span className="strip-dot" />{pending.length} pending</span>
                    <span className="strip-item" style={{ color:"var(--green)" }}><span className="strip-dot" />{approved.length} approved</span>
                    <span className="strip-item" style={{ color:"var(--red)" }}><span className="strip-dot" />{denied.length} denied</span>
                  </div>
                  <div className="tbl-wrap">
                    {pending.length === 0 ? (
                      <div className="empty">
                        <div className="empty-icon"><IcoCheck /></div>
                        No pending requests — inbox zero.
                      </div>
                    ) : (
                      <table className="tbl">
                        <thead><tr>
                          <th className="th">Tool</th>
                          <th className="th">Monthly Cost</th>
                          <th className="th">Requested By</th>
                          <th className="th">Justification</th>
                          <th className="th">Actions</th>
                        </tr></thead>
                        <tbody>
                          {pending.filter(req =>
                          req.tool_name.toLowerCase().includes(search.toLowerCase()) ||
                          (req.requester_email ?? "").toLowerCase().includes(search.toLowerCase())
                        ).map((req, i) => (
                            <tr key={req.id} className={`tr${visible ? " show" : ""}`} style={{ transitionDelay:`${i*40}ms` }} data-test="pending-request-row">
                              <td className="td">
                                <div className="cell-tool">
                                  <span className="cdot" style={{ background:"var(--amber)", boxShadow:"0 0 6px var(--amber)" }} />
                                  <div>
                                    <div className="tool-name">{req.tool_name}</div>
                                    <div className="tool-id">#{String(req.id).slice(0,8)}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="td"><span className="cost-val">${req.monthly_cost}/mo</span></td>
                              <td className="td"><span className="email-val">{req.requester_email ?? req.requested_by}</span></td>
                              <td className="td"><span className="just-val" title={req.justification}>{req.justification}</span></td>
                              <td className="td">
                                <div className="actions">
                                  <button className="btn btn-approve" disabled={actionId === req.id} data-test="approve-btn" onClick={() => decide(req, "approved")}>
                                    {actionId === req.id ? <Spinner /> : <IcoCheck />} Approve
                                  </button>
                                  <button className="btn btn-deny" disabled={actionId === req.id} data-test="deny-btn" onClick={() => { setDenyModalReq(req); setDenialReason("") }}>
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

              {tab === "active" && (
                <div>
                  <div style={{ display:"flex", justifyContent:"flex-end", padding:"12px 18px 0", borderBottom:"1px solid var(--b1)" }}>
                    <button
                      onClick={() => { setAddSubModal(true); setAddSubForm({ tool_name:"", monthly_cost:"", user_id:"" }); setAddSubErr({}) }}
                      style={{ display:"inline-flex", alignItems:"center", gap:6, background:"var(--blue)", color:"#fff", border:"none", borderRadius:"var(--r)", padding:"7px 14px", fontSize:12, fontWeight:700, fontFamily:"var(--f)", cursor:"pointer" }}
                    >
                      + Add Subscription
                    </button>
                  </div>
                  <div className="tbl-wrap">
                    {subs.length === 0 ? (
                      <div className="empty">
                        <div className="empty-icon"><IcoLayers /></div>
                        No active subscriptions yet. Use &quot;+ Add Subscription&quot; to add existing tools.
                      </div>
                    ) : (
                      <table className="tbl">
                        <thead><tr>
                          <th className="th">Tool</th>
                          <th className="th">Monthly Cost</th>
                          <th className="th">User</th>
                        </tr></thead>
                        <tbody>
                          {subs.filter(sub =>
                          sub.tool_name.toLowerCase().includes(search.toLowerCase()) ||
                          (userMap[sub.user_id] ?? "").toLowerCase().includes(search.toLowerCase())
                        ).map((sub, i) => (
                            <tr key={sub.id} className={`tr${visible ? " show" : ""}`} style={{ transitionDelay:`${i*35}ms` }}>
                              <td className="td">
                                <div className="cell-tool">
                                  <span className="cdot" style={{ background:"var(--blue)", boxShadow:"0 0 6px var(--blue)" }} />
                                  <div className="tool-name">{sub.tool_name}</div>
                                </div>
                              </td>
                              <td className="td"><span className="cost-val">${sub.monthly_cost}/mo</span></td>
                              <td className="td"><span className="email-val">{userMap[sub.user_id] ?? sub.user_id}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {tab === "history" && (
                <div className="tbl-wrap">
                  {reqs.length === 0 ? (
                    <div className="empty">
                      <div className="empty-icon"><IcoClock /></div>
                      No requests submitted yet.
                    </div>
                  ) : (
                    <table className="tbl">
                      <thead><tr>
                        <th className="th">Tool</th>
                        <th className="th">Cost</th>
                        <th className="th">Requested By</th>
                        <th className="th">Status</th>
                        <th className="th">Reviewed At</th>
                      </tr></thead>
                      <tbody>
                        {reqs.filter(req =>
                          req.tool_name.toLowerCase().includes(search.toLowerCase()) ||
                          (req.requester_email ?? "").toLowerCase().includes(search.toLowerCase())
                        ).map((req, i) => (
                          <tr key={req.id} className={`tr${visible ? " show" : ""}`} style={{ transitionDelay:`${i*35}ms` }}>
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
                            <td className="td"><span className="email-val">{req.requester_email ?? req.requested_by}</span></td>
                            <td className="td">
                              <span className={`badge ${req.status}`}><span className="bdot" />{req.status}</span>
                              {req.denial_reason && (
                                <div style={{ fontSize:10, color:"var(--red)", marginTop:3, fontFamily:"var(--f)" }}>{req.denial_reason}</div>
                              )}
                            </td>
                            <td className="td">
                              <span style={{ fontSize:11, color:"var(--t3)", fontFamily:"var(--f)" }}>
                                {req.reviewed_at ? new Date(req.reviewed_at).toLocaleDateString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" }) : "—"}
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