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
  denial_reason?: string
}

const IcoLogout = (): React.ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const IcoPlus = (): React.ReactElement => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IcoClose = (): React.ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IcoAlert = (): React.ReactElement => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const IcoBox = (): React.ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
)
const IcoActivity = (): React.ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)
const IcoDollar = (): React.ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
)
const IcoCheck = (): React.ReactElement => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IcoSun = (): React.ReactElement => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)
const IcoMoon = (): React.ReactElement => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)
const Spinner = (): React.ReactElement => (
  <span style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.15)", borderTopColor: "currentColor", borderRadius: "50%", animation: "emp-spin 0.65s linear infinite", display: "inline-block", flexShrink: 0 }} />
)

function validateForm(f: { tool_name: string; monthly_cost: string; justification: string }) {
  const e: Record<string, string> = {}
  if (!f.tool_name.trim())     e.tool_name    = "Tool name is required."
  if (!f.monthly_cost)         e.monthly_cost = "Monthly cost is required."
  else if (isNaN(Number(f.monthly_cost)) || Number(f.monthly_cost) <= 0)
                               e.monthly_cost = "Enter a valid positive number."
  if (!f.justification.trim()) e.justification = "Business justification is required."
  return e
}

export default function DashboardPage() {
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [requests, setRequests]           = useState<Request[]>([])
  const [userEmail, setUserEmail]         = useState<string>("")
  const [userId, setUserId]               = useState<string>("")
  const [loading, setLoading]             = useState<boolean>(true)
  const [visible, setVisible]             = useState<boolean>(false)
  const [modalOpen, setModalOpen]         = useState<boolean>(false)
  const [form, setForm]                   = useState({ tool_name: "", monthly_cost: "", justification: "" })
  const [formErrs, setFormErrs]           = useState<Record<string, string>>({})
  const [submitting, setSubmitting]       = useState<boolean>(false)
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)
  const [serverErr, setServerErr]         = useState<string>("")
  const [activeTab, setActiveTab]         = useState<"tools" | "requests">("tools")
  const [showLogoutModal, setShowLogoutModal] = useState(false)
const [unreadCount, setUnreadCount]     = useState<number>(0)
const [darkMode, setDarkMode]           = useState<boolean>(() => {
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

  const loadData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push("/login"); return }
    const se = session.user.email
    if (!se) { router.push("/login"); return }
    const { data: u } = await supabase
      .from("users").select("role,email").eq("email", se)
      .single<{ role: string; email: string }>()
    if (!u) { router.push("/login"); return }
    if (u.role === "admin") { router.push("/admin"); return }
    setUserEmail(u.email)
    setUserId(session.user.id)
    const { data: s } = await supabase
      .from("subscriptions").select("*").eq("user_id", session.user.id).returns<Subscription[]>()
    setSubscriptions(s ?? [])
    const { data: r } = await supabase
      .from("requests").select("*").eq("requested_by", session.user.id)
      .order("id", { ascending: false }).returns<Request[]>()
    const fetchedRequests = r ?? []
    setRequests(fetchedRequests)

    // Calculate unread notifications
    const seenIds: string[] = JSON.parse(localStorage.getItem("sg-seen-requests") || "[]")
    const unread = fetchedRequests.filter(
      req => (req.status === "approved" || req.status === "denied") && !seenIds.includes(req.id)
    ).length
    setUnreadCount(unread)

    setLoading(false)
    setTimeout(() => setVisible(true), 80)
  }, [router])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    const channel = supabase
      .channel("employee-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "requests" }, () => { loadData() })
      .on("postgres_changes", { event: "*", schema: "public", table: "subscriptions" }, () => { loadData() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [loadData])

  const openModal = () => {
    setForm({ tool_name: "", monthly_cost: "", justification: "" })
    setFormErrs({})
    setSubmitSuccess(false)
    setServerErr("")
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const errs = validateForm(form)
    if (Object.keys(errs).length) { setFormErrs(errs); return }

    const alreadyOwned = subscriptions.some(
      s => s.tool_name.toLowerCase().trim() === form.tool_name.toLowerCase().trim()
    )
    if (alreadyOwned) {
      setFormErrs({ tool_name: "You already have an active license for this tool." })
      return
    }

    const alreadyRequested = requests.some(
      r => r.tool_name.toLowerCase().trim() === form.tool_name.toLowerCase().trim()
        && r.status === "approved"
    )
    if (alreadyRequested) {
      setFormErrs({ tool_name: "This tool has already been approved for you." })
      return
    }
    setSubmitting(true)
    setServerErr("")
    const { error } = await supabase.from("requests").insert({
      tool_name:     form.tool_name.trim(),
      monthly_cost:  Number(form.monthly_cost),
      justification: form.justification.trim(),
      status:        "pending",
      requested_by:  userId,
    })
    setSubmitting(false)
    if (error) { setServerErr(error.message); return }
    setSubmitSuccess(true)
    await loadData()
    setTimeout(() => setModalOpen(false), 800)
  }

  const cancelRequest = async (id: string) => {
    const { error } = await supabase.from("requests").delete().eq("id", id)
    if (!error) await loadData()
  }
  const logout = () => setShowLogoutModal(true)
  const confirmLogout = async () => { await supabase.auth.signOut(); router.push("/login") }
  const initials = (e: string) => e.split("@")[0].slice(0, 2).toUpperCase()
  const mySpend  = subscriptions.reduce((s, r) => s + r.monthly_cost, 0)
  const pendingCount = requests.filter(r => r.status === "pending").length

  if (loading) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#07070b", flexDirection:"column", gap:14, fontFamily:"'Inter', sans-serif" }}>
        <div style={{ width:22, height:22, border:"2px solid rgba(255,255,255,0.07)", borderTopColor:"#4f8ef7", borderRadius:"50%", animation:"emp-spin 0.7s linear infinite" }} />
        <span style={{ fontSize:12, color:"#6068a0", fontWeight:500 }}>Loading your workspace…</span>
        <style>{`@keyframes emp-spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

        /* ── DARK THEME (default) ── */
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

        /* ── LIGHT THEME ── */
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

        html,body { height:100%; background:var(--bg); }

        @keyframes emp-spin  { to { transform:rotate(360deg); } }
        @keyframes emp-modal { from{opacity:0;transform:scale(0.97) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes emp-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }

        .root { font-family:var(--f); -webkit-font-smoothing:antialiased; min-height:100vh; background:var(--bg); color:var(--t1); display:flex; }
        .root::before { content:''; position:fixed; inset:0; z-index:0; pointer-events:none;
          background-image:linear-gradient(var(--b0) 1px,transparent 1px),linear-gradient(90deg,var(--b0) 1px,transparent 1px);
          background-size:44px 44px; }
        .root::after { content:''; position:fixed; top:-80px; left:50%; transform:translateX(-50%);
          width:700px; height:220px; z-index:0; pointer-events:none;
          background:radial-gradient(ellipse at 50% 0%,rgba(79,142,247,0.07) 0%,transparent 60%); }

        /* ── SIDEBAR ── */
        .sidebar { position:fixed; left:0; top:0; bottom:0; width:220px; z-index:60;
          background:var(--s0); border-right:1px solid var(--b1); display:flex; flex-direction:column; }
        .sb-brand { display:flex; align-items:center; gap:9px; padding:16px 18px 14px; border-bottom:1px solid var(--b1); }
        .sb-logo { width:32px; height:32px; border-radius:8px;
          background:linear-gradient(135deg,var(--blue),var(--violet));
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 0 18px var(--blue-g); flex-shrink:0; overflow:hidden; }
        .sb-name { font-size:14px; font-weight:700; letter-spacing:-0.4px; color:var(--t1); font-family:var(--f); }
        .sb-badge { font-size:8.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;
          background:var(--green-d); color:var(--green); border:1px solid var(--green-b);
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
          background:var(--blue-d); color:var(--blue); border:1px solid var(--blue-b);
          border-radius:10px; padding:1px 6px; min-width:18px; text-align:center; }
        .sb-footer { padding:12px 10px; border-top:1px solid var(--b1); display:flex; align-items:center; gap:8px; }
        .sb-avatar { width:30px; height:30px; border-radius:8px;
          background:var(--green-d); border:1px solid var(--green-b);
          display:flex; align-items:center; justify-content:center;
          font-size:10px; font-weight:700; color:var(--green); font-family:var(--f); flex-shrink:0; }
        .sb-user { flex:1; min-width:0; }
        .sb-email { font-size:10.5px; color:var(--t2); font-family:var(--f); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:500; }
        .sb-role  { font-size:9px; color:var(--t3); text-transform:uppercase; letter-spacing:0.3px; margin-top:1px; font-family:var(--f); font-weight:600; }
        .sb-logout { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center;
          color:var(--t3); border:1px solid var(--b1); background:none; cursor:pointer; transition:all 0.12s; flex-shrink:0; }
        .sb-logout:hover { color:var(--red); border-color:var(--red-b); background:var(--red-d); }

        /* ── TOPBAR ── */
        .topbar { position:fixed; top:0; left:220px; right:0; height:52px; z-index:50;
          background:var(--s0); border-bottom:1px solid var(--b1);
          display:flex; align-items:center; justify-content:space-between; padding:0 24px; }
        .breadcrumb { display:flex; align-items:center; gap:6px; font-size:12px; font-family:var(--f); color:var(--t3); font-weight:500; }
        .bc-sep { color:var(--t4); }
        .bc-active { color:var(--t1); font-weight:600; }
        .topbar-r { display:flex; align-items:center; gap:10px; }

        /* ── THEME TOGGLE ── */
        .theme-toggle { display:flex; align-items:center; gap:5px;
          background:var(--s2); border:1px solid var(--b2);
          border-radius:20px; padding:5px 12px;
          cursor:pointer; transition:all 0.15s;
          font-size:11px; font-weight:600; color:var(--t2);
          font-family:var(--f); white-space:nowrap; }
        .theme-toggle:hover { border-color:var(--blue-b); color:var(--t1); }

        /* ── REQUEST BUTTON ── */
        .req-btn { display:inline-flex; align-items:center; gap:6px;
          font-size:12px; font-weight:700; font-family:var(--f);
          background:var(--blue); color:#fff; border:none;
          border-radius:var(--r); padding:8px 16px;
          cursor:pointer; transition:opacity 0.12s, box-shadow 0.12s, transform 0.1s;
          position:relative; overflow:hidden; }
        .req-btn::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.12) 0%,transparent 50%); pointer-events:none; }
        .req-btn:hover { opacity:0.9; box-shadow:0 4px 18px var(--blue-g); transform:translateY(-1px); }
        .req-btn:active { transform:translateY(0); }

        /* ── MAIN ── */
        .main { margin-left:220px; padding-top:52px; flex:1; position:relative; z-index:1; }
        .content { padding:24px 24px 80px; max-width:1000px; }

        .page-h { margin-bottom:22px; }
        .page-title { font-size:20px; font-weight:800; letter-spacing:-0.7px; color:var(--t1); line-height:1; margin-bottom:5px; font-family:var(--f); }
        .page-sub { font-size:12px; color:var(--t3); font-family:var(--f); font-weight:400; }

        /* ── STAT CARDS ── */
        .stats { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:22px; }
        @media(max-width:800px){ .stats { grid-template-columns:repeat(2,1fr); } }

        .stat { background:var(--s0); border:1px solid var(--b1); border-radius:var(--r2);
          padding:16px 18px; position:relative; overflow:hidden;
          opacity:0; transform:translateY(8px);
          transition:opacity 0.36s ease,transform 0.36s ease,border-color 0.15s; }
        .stat::before { content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,var(--b2),transparent); }
        .stat:hover { border-color:var(--b2); }
        .stat.show { opacity:1; transform:translateY(0); }
        .stat-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
        .stat-lbl { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; color:var(--t3); font-family:var(--f); }
        .stat-ico { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; }
        .si-green { background:var(--green-d); color:var(--green); border:1px solid var(--green-b); }
        .si-blue  { background:var(--blue-d);  color:var(--blue);  border:1px solid var(--blue-b); }
        .si-amber { background:var(--amber-d); color:var(--amber); border:1px solid var(--amber-b); }
        .stat-val { font-size:26px; font-weight:800; letter-spacing:-1px; color:var(--t1); line-height:1; margin-bottom:5px; font-variant-numeric:tabular-nums; font-family:var(--f); }
        .stat-hint { font-size:11px; color:var(--t3); font-family:var(--f); font-weight:400; }

        /* ── PANEL ── */
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
          font-size:9px; font-weight:700; padding:0 4px; margin-left:5px;
          background:var(--blue-d); color:var(--blue); border:1px solid var(--blue-b); font-family:var(--f); }

        /* ── TOOL CARDS ── */
        .cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:12px; padding:18px; }
        .card { background:var(--s1); border:1px solid var(--b1); border-radius:var(--r2);
          padding:18px; position:relative; overflow:hidden;
          opacity:0; transform:translateY(6px);
          transition:opacity 0.28s ease,transform 0.28s ease,border-color 0.12s; }
        .card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--b2),transparent); }
        .card:hover { border-color:var(--b2); }
        .card.show { opacity:1; transform:translateY(0); }
        .card-pulse { width:7px; height:7px; border-radius:50%; background:var(--green); margin-bottom:12px;
          box-shadow:0 0 8px var(--green); animation:emp-pulse 2.5s ease-in-out infinite; }
        .card-name { font-size:13px; font-weight:600; color:var(--t1); margin-bottom:5px; font-family:var(--f); }
        .card-cost { font-size:12px; font-family:var(--fm); color:var(--green); font-weight:500; }

        /* ── TABLE ── */
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
        .tool-name { font-weight:600; font-family:var(--f); color:var(--t1); }
        .cost-val { font-family:var(--fm); font-size:12.5px; color:var(--green); font-weight:500; }
        .just-val { font-size:12px; color:var(--t2); max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block; font-family:var(--f); }
        .badge { display:inline-flex; align-items:center; gap:4px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.4px; padding:3px 8px; border-radius:20px; font-family:var(--f); }
        .bdot { width:4px; height:4px; border-radius:50%; background:currentColor; }
        .badge.pending  { background:var(--amber-d); color:var(--amber); border:1px solid var(--amber-b); }
        .badge.approved { background:var(--green-d); color:var(--green); border:1px solid var(--green-b); }
        .badge.denied   { background:var(--red-d);   color:var(--red);   border:1px solid var(--red-b); }

        .empty { padding:48px 18px; text-align:center; font-size:12px; color:var(--t3); font-family:var(--f); display:flex; flex-direction:column; align-items:center; gap:8px; font-weight:500; }
        .empty-icon { width:36px; height:36px; border-radius:9px; background:var(--s2); border:1px solid var(--b1); display:flex; align-items:center; justify-content:center; color:var(--t3); margin-bottom:2px; }

        /* ── MODAL ── */
        .overlay { position:fixed; inset:0; z-index:200; background:rgba(0,0,0,0.6); backdrop-filter:blur(8px);
          display:flex; align-items:center; justify-content:center; padding:20px; }
        .modal { width:100%; max-width:440px; background:var(--s1); border:1px solid var(--b2);
          border-radius:var(--r2); padding:26px; animation:emp-modal 0.18s ease; }
        .modal-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; }
        .modal-title { font-size:16px; font-weight:800; letter-spacing:-0.4px; color:var(--t1); font-family:var(--f); }
        .modal-close { background:none; border:none; cursor:pointer; color:var(--t3);
          display:flex; align-items:center; padding:4px; border-radius:6px; transition:color 0.12s,background 0.12s; }
        .modal-close:hover { color:var(--t1); background:var(--b1); }

        .mfield { margin-bottom:14px; }
        .mlabel { display:block; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; color:var(--t2); margin-bottom:6px; font-family:var(--f); }
        .minput { width:100%; background:var(--s2); border:1px solid var(--b2); border-radius:var(--r);
          padding:11px 13px; font-family:var(--f); font-size:13px; font-weight:400; color:var(--t1);
          outline:none; transition:border-color 0.12s,box-shadow 0.12s,background 0.12s; resize:vertical; }
        .minput::placeholder { color:var(--t3); font-family:var(--f); }
        .minput:hover:not(:focus) { border-color:var(--b2); }
        .minput:focus { border-color:var(--blue); box-shadow:0 0 0 3px var(--blue-r); background:var(--s3); }
        .minput.err { border-color:var(--red); box-shadow:0 0 0 3px rgba(251,79,114,0.1); }
        .mferr { margin-top:5px; font-size:11px; color:var(--red); display:flex; align-items:center; gap:4px; font-family:var(--f); }

        .merr { background:var(--red-d); border:1px solid var(--red-b); border-radius:var(--r);
          padding:10px 13px; font-size:12px; color:var(--red); font-family:var(--f);
          display:flex; align-items:flex-start; gap:7px; margin-bottom:14px; line-height:1.5; }
        .msuccess { background:var(--green-d); border:1px solid var(--green-b); border-radius:var(--r);
          padding:12px 14px; font-size:13px; color:var(--green); font-weight:600; font-family:var(--f);
          text-align:center; display:flex; align-items:center; justify-content:center; gap:7px; margin-bottom:10px; }

        .modal-actions { display:flex; gap:8px; margin-top:8px; }
        .btn-cancel { flex:1; background:var(--s2); color:var(--t2); border:1px solid var(--b2);
          border-radius:var(--r); padding:11px; font-family:var(--f); font-size:13px; font-weight:600;
          cursor:pointer; transition:color 0.12s,border-color 0.12s; }
        .btn-cancel:hover { color:var(--t1); border-color:var(--b2); }
        .btn-submit { flex:2; background:var(--blue); color:#fff; border:none; border-radius:var(--r); padding:11px;
          font-family:var(--f); font-size:13px; font-weight:700; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:6px;
          transition:opacity 0.12s, box-shadow 0.12s; position:relative; overflow:hidden; }
        .btn-submit::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.12) 0%,transparent 50%); pointer-events:none; }
        .btn-submit:hover:not(:disabled) { opacity:0.9; box-shadow:0 4px 18px var(--blue-g); }
        .btn-submit:disabled { opacity:0.45; cursor:not-allowed; }
      `}</style>

      <div className="root">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sb-brand">
            <div className="sb-logo">
              <img src="/logo.png" alt="SubGuard" width="22" height="22" style={{ objectFit: "contain" }} />
            </div>
            <span className="sb-name">SubGuard</span>
            <span className="sb-badge">Employee</span>
          </div>
          <nav className="sb-nav">
            <span className="sb-section">My Workspace</span>
            <button className={`sb-item${activeTab === "tools" ? " active" : ""}`} onClick={() => setActiveTab("tools")}>
              <span className="sb-ico"><IcoBox /></span>My Tools
              {subscriptions.length > 0 && <span className="sb-count">{subscriptions.length}</span>}
            </button>
            <button className={`sb-item${activeTab === "requests" ? " active" : ""}`} onClick={() => {
              setActiveTab("requests")
              const seenIds = requests.map(r => r.id)
              localStorage.setItem("sg-seen-requests", JSON.stringify(seenIds))
              setUnreadCount(0)
            }}>
              <span className="sb-ico"><IcoActivity /></span>My Requests
              {unreadCount > 0
                ? <span className="sb-count" style={{ background:"var(--red)", color:"#fff", border:"none" }}>{unreadCount}</span>
                : requests.length > 0 && <span className="sb-count">{requests.length}</span>
              }
            </button>
          </nav>
          <div className="sb-footer">
            <div className="sb-avatar">{initials(userEmail)}</div>
            <div className="sb-user">
              <div className="sb-email">{userEmail}</div>
              <div className="sb-role">Employee</div>
            </div>
            <button className="sb-logout" onClick={logout} data-test="logout-btn" title="Sign out">
              <IcoLogout />
            </button>
          </div>
        </aside>

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

        {/* ── TOPBAR ── */}
        <header className="topbar">
          <div className="breadcrumb">
            <span>subguard</span><span className="bc-sep">/</span>
            <span>dashboard</span><span className="bc-sep">/</span>
            <span className="bc-active">{activeTab === "tools" ? "my tools" : "my requests"}</span>
          </div>
          <div className="topbar-r">
            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle light/dark mode"
            >
              {darkMode ? <><IcoSun /> Light</> : <><IcoMoon /> Dark</>}
            </button>
            <button className="req-btn" onClick={openModal} data-test="request-software-btn">
              <IcoPlus /> Request New Software
            </button>
          </div>
        </header>

        {/* ── MAIN ── */}
        <main className="main">
          <div className="content">
            <div className="page-h">
              <h1 className="page-title">Welcome back, {userEmail.split("@")[0]}.</h1>
              <p className="page-sub">Your active software licenses and request history.</p>
            </div>

            <div className="stats">
              <div className={`stat${visible ? " show" : ""}`} style={{ transitionDelay: "0ms" }}>
                <div className="stat-top"><span className="stat-lbl">Active Tools</span><span className="stat-ico si-green"><IcoBox /></span></div>
                <div className="stat-val">{subscriptions.length}</div>
                <div className="stat-hint">licensed to you</div>
              </div>
              <div className={`stat${visible ? " show" : ""}`} style={{ transitionDelay: "55ms" }}>
                <div className="stat-top"><span className="stat-lbl">My Monthly Cost</span><span className="stat-ico si-blue"><IcoDollar /></span></div>
                <div className="stat-val">${mySpend.toLocaleString()}</div>
                <div className="stat-hint">allocated spend</div>
              </div>
              <div className={`stat${visible ? " show" : ""}`} style={{ transitionDelay: "110ms" }}>
                <div className="stat-top"><span className="stat-lbl">Pending Requests</span><span className="stat-ico si-amber"><IcoActivity /></span></div>
                <div className="stat-val">{pendingCount}</div>
                <div className="stat-hint">awaiting approval</div>
              </div>
            </div>

            <div className="panel">
              <div className="tabs">
                <button className={`tab-btn${activeTab === "tools" ? " on" : ""}`} onClick={() => setActiveTab("tools")}>
                  My Active Tools <span className="tab-n">{subscriptions.length}</span>
                </button>
                <button className={`tab-btn${activeTab === "requests" ? " on" : ""}`} onClick={() => setActiveTab("requests")}>
                  My Requests <span className="tab-n">{pendingCount || requests.length}</span>
                </button>
              </div>

              {activeTab === "tools" && (
                subscriptions.length === 0 ? (
                  <div className="empty">
                    <div className="empty-icon"><IcoBox /></div>
                    No active licenses yet. Use the &quot;Request New Software&quot; button to get started.
                  </div>
                ) : (
                  <div className="cards">
                    {subscriptions.map((sub, i) => (
                      <div key={sub.id} className={`card${visible ? " show" : ""}`} style={{ transitionDelay: `${i * 45}ms` }} data-test="subscription-card">
                        <div className="card-pulse" />
                        <div className="card-name">{sub.tool_name}</div>
                        <div className="card-cost">${sub.monthly_cost}/mo</div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab === "requests" && (
                <div className="tbl-wrap">
                  {requests.length === 0 ? (
                    <div className="empty">
                      <div className="empty-icon"><IcoActivity /></div>
                      No requests yet — click &quot;Request New Software&quot; to get started.
                    </div>
                  ) : (
                    <table className="tbl">
                      <thead><tr>
                        <th className="th">Tool</th>
                        <th className="th">Monthly Cost</th>
                        <th className="th">Justification</th>
                        <th className="th">Status</th>
                      </tr></thead>
                      <tbody>
                        {requests.map((req, i) => (
                          <tr
                            key={req.id}
                            className={`tr${visible ? " show" : ""}`}
                            style={{ transitionDelay: `${i * 40}ms`, opacity: req.status !== "pending" ? 0.55 : 1 }}
                            data-test="request-row"
                          >
                            <td className="td"><span className="tool-name">{req.tool_name}</span></td>
                            <td className="td"><span className="cost-val">${req.monthly_cost}/mo</span></td>
                            <td className="td"><span className="just-val" title={req.justification}>{req.justification}</span></td>
                            <td className="td">
                              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                                <span className={`badge ${req.status}`}><span className="bdot" />{req.status}</span>
                                {req.status === "pending" && (
                                  <button
                                    onClick={() => cancelRequest(req.id)}
                                    style={{ fontSize:10, fontWeight:600, fontFamily:"var(--f)", background:"var(--red-d)", color:"var(--red)", border:"1px solid var(--red-b)", borderRadius:5, padding:"2px 7px", cursor:"pointer" }}
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                              {req.status === "denied" && req.denial_reason && (
                                <div style={{ fontSize:11, color:"var(--red)", marginTop:4, fontFamily:"var(--f)", fontWeight:400, maxWidth:200 }}>
                                  {req.denial_reason}
                                </div>
                              )}
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

        {/* ── REQUEST MODAL ── */}
        {modalOpen && (
          <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}>
            <div className="modal" data-test="request-modal">
              <div className="modal-head">
                <span className="modal-title">Request New Software</span>
                <button className="modal-close" onClick={() => setModalOpen(false)} aria-label="Close"><IcoClose /></button>
              </div>
              {serverErr && <div className="merr"><IcoAlert />{serverErr}</div>}
              {submitSuccess ? (
                <div className="msuccess"><IcoCheck /> Request submitted successfully!</div>
              ) : (
                <>
                  <div className="mfield">
                    <label className="mlabel" htmlFor="m-tool">Tool Name</label>
                    <input id="m-tool" data-test="request-tool-name" type="text"
                      placeholder="e.g. Notion, Zoom, Loom…" value={form.tool_name}
                      className={`minput${formErrs.tool_name ? " err" : ""}`}
                      onChange={(e) => { setForm(f => ({ ...f, tool_name: e.target.value })); if (formErrs.tool_name) setFormErrs(fe => ({ ...fe, tool_name: "" })) }}
                    />
                    {formErrs.tool_name && <div className="mferr"><IcoAlert />{formErrs.tool_name}</div>}
                  </div>
                  <div className="mfield">
                    <label className="mlabel" htmlFor="m-cost">Monthly Cost (USD)</label>
                    <input id="m-cost" data-test="request-monthly-cost" type="number" min="0"
                      placeholder="e.g. 50" value={form.monthly_cost}
                      className={`minput${formErrs.monthly_cost ? " err" : ""}`}
                      onChange={(e) => { setForm(f => ({ ...f, monthly_cost: e.target.value })); if (formErrs.monthly_cost) setFormErrs(fe => ({ ...fe, monthly_cost: "" })) }}
                    />
                    {Number(form.monthly_cost) > 500 && !formErrs.monthly_cost && (
  <div style={{ marginTop:4, fontSize:11, color:"var(--amber)", display:"flex", alignItems:"center", gap:4, fontFamily:"var(--f)", fontWeight:500 }}>
    <IcoAlert /> High cost request — this will require additional justification from your manager.
  </div>
)}
                  </div>
                  <div className="mfield">
                    <label className="mlabel" htmlFor="m-just">Business Justification</label>
                    <textarea id="m-just" data-test="request-justification" rows={3}
                      placeholder="Why does your team need this tool?" value={form.justification}
                      className={`minput${formErrs.justification ? " err" : ""}`}
                      onChange={(e) => { setForm(f => ({ ...f, justification: e.target.value })); if (formErrs.justification) setFormErrs(fe => ({ ...fe, justification: "" })) }}
                    />
                    {formErrs.justification && <div className="mferr"><IcoAlert />{formErrs.justification}</div>}
                  </div>
                  <div className="modal-actions">
                    <button className="btn-cancel" onClick={() => setModalOpen(false)}>Cancel</button>
                    <button className="btn-submit" disabled={submitting} data-test="request-submit-btn" onClick={handleSubmit}>
                      {submitting ? <><Spinner /> Submitting…</> : "Submit Request"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}