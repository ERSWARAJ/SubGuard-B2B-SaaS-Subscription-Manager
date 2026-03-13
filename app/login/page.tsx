"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"

const ACTIVE_SUBSCRIPTIONS = [
  {
    name: "Figma",
    color: "#F24E1E",
    icon: (
      <svg width="11" height="11" viewBox="0 0 38 57" fill="none">
        <path d="M19 28.5A9.5 9.5 0 1 1 28.5 19 9.5 9.5 0 0 1 19 28.5z" fill="#1ABCFE"/>
        <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 0 1-19 0z" fill="#0ACF83"/>
        <path d="M19 0v19h9.5a9.5 9.5 0 0 0 0-19z" fill="#FF7262"/>
        <path d="M0 9.5a9.5 9.5 0 0 0 9.5 9.5H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E"/>
        <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#FF637E" opacity=".9"/>
      </svg>
    ),
  },
  {
    name: "GitHub",
    color: "#aaa",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    ),
  },
  {
    name: "Slack",
    color: "#36C5F0",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#E01E5A"/>
        <path d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
        <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" fill="#36C5F0"/>
        <path d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
        <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z" fill="#2EB67D"/>
        <path d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/>
        <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z" fill="#ECB22E"/>
        <path d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E"/>
      </svg>
    ),
  },
  {
    name: "Notion",
    color: "#888",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.081.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.448-1.632z"/>
      </svg>
    ),
  },
  {
    name: "Linear",
    color: "#5E6AD2",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#5E6AD2" }}>
        <path d="M0 14.121L9.88 24l-1.519-1.519C4.93 19.05 2.863 16.7 1.367 14.12L0 14.121zm.613-4.045l13.312 13.312-.936.52a11.977 11.977 0 0 1-1.738.72L.41 11.255a12.048 12.048 0 0 1 .203-1.179zM2.36 6.81l14.83 14.83a12.1 12.1 0 0 1-1.418.804L1.556 8.228c.22-.493.51-.972.804-1.418zm2.718-2.718c.451-.293.928-.535 1.414-.755L20.663 17.508c-.22.486-.462.963-.755 1.414L5.078 4.092zM8.228 1.556l14.216 14.216c-.22.486-.512.963-.804 1.414L7.81 3.36c.45-.294.928-.584 1.418-.804zm4.045-.946L23.39 11.727c-.204.613-.42 1.182-.72 1.738l-.52.936L9.838.876a12.1 12.1 0 0 1 1.179-.203l1.256-.063zm3.389.207C17.896 2.177 20.25 4.253 22.68 7.686l-1.519 1.519L9.88 0l1.438-.367a12.02 12.02 0 0 1 1.179-.203l1.165 1.387z"/>
      </svg>
    ),
  },
  {
    name: "Vercel",
    color: "#aaa",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L24 22H0L12 1z"/>
      </svg>
    ),
  },
  {
    name: "Datadog",
    color: "#9b59b6",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#632CA6" opacity=".2"/>
        <circle cx="12" cy="12" r="5" fill="#632CA6" opacity=".5"/>
        <circle cx="12" cy="12" r="2.5" fill="#632CA6"/>
      </svg>
    ),
  },
  {
    name: "AWS",
    color: "#FF9900",
    icon: (
      <svg width="13" height="8" viewBox="0 0 80 50" fill="none">
        <path d="M22.9 20.1c0 1 .1 1.8.3 2.4.2.6.5 1.2.9 1.9.1.2.2.4.2.6 0 .3-.2.5-.5.8l-1.7 1.1c-.2.2-.5.2-.7.2-.3 0-.5-.1-.8-.4-.4-.4-.7-.8-1-1.3-.3-.5-.6-1-.8-1.6-2.1 2.5-4.7 3.7-7.9 3.7-2.3 0-4.1-.6-5.4-1.9C4 24.3 3.2 22.5 3.2 20.3c0-2.3.8-4.2 2.5-5.6 1.7-1.4 3.9-2.1 6.6-2.1.9 0 1.9.1 2.9.2 1 .1 2 .3 3.1.6V12c0-2-.4-3.5-1.3-4.3-.9-.8-2.3-1.2-4.4-1.2-.9 0-1.9.1-2.9.4-1 .2-2 .5-2.9.9-.4.2-.8.3-.9.4-.2 0-.3.1-.4.1-.4 0-.6-.3-.6-.8V6.2c0-.4.1-.7.2-.9.1-.2.4-.4.7-.6.9-.5 2.1-.9 3.4-1.2 1.4-.4 2.8-.5 4.3-.5 3.2 0 5.5.7 7 2.2 1.4 1.4 2.2 3.7 2.2 6.6v8.3zm-11 4.1c.9 0 1.8-.2 2.8-.5 1-.3 1.8-.9 2.6-1.8.4-.5.8-1.1.9-1.7.2-.6.3-1.4.3-2.4v-1.1c-.8-.2-1.6-.3-2.5-.4-.9-.1-1.7-.2-2.5-.2-1.8 0-3.1.4-4 1.1-.9.7-1.3 1.8-1.3 3.1 0 1.3.3 2.2 1 2.9.6.6 1.5 1 2.7 1zm21.7 2.9c-.5 0-.8-.1-1-.3-.2-.2-.4-.5-.6-1.1L27.4 7.5c-.2-.5-.2-.9-.2-1.1 0-.4.2-.7.6-.7h2.6c.5 0 .9.1 1 .3.2.2.4.5.5 1.1l4.2 16.7 3.9-16.7c.1-.5.3-.9.5-1.1.2-.2.6-.3 1.1-.3h2.2c.5 0 .9.1 1.1.3.2.2.4.5.5 1.1l4 16.9 4.3-16.9c.2-.5.4-.9.5-1.1.2-.2.6-.3 1-.3h2.5c.4 0 .7.2.7.7 0 .1 0 .3-.1.4 0 .2-.1.4-.2.7L53.5 25.7c-.2.5-.4.9-.6 1.1-.2.2-.5.3-1 .3h-2.3c-.5 0-.9-.1-1.1-.3-.2-.2-.4-.5-.5-1.1L44 10.2l-3.9 15.5c-.1.5-.3.9-.5 1.1-.2.2-.6.3-1.1.3h-2.4zm32.3.6c-1.4 0-2.8-.2-4.1-.5-1.4-.3-2.4-.7-3.1-1.1-.4-.2-.7-.5-.8-.8-.1-.2-.2-.5-.2-.7v-1.4c0-.6.2-.8.6-.8.2 0 .3 0 .5.1.2 0 .4.2.7.3.9.4 1.9.7 3 1 1.1.2 2.1.3 3.2.3 1.7 0 3-.3 3.9-.9.9-.6 1.4-1.5 1.4-2.6 0-.8-.2-1.4-.7-1.9-.5-.5-1.4-1-2.7-1.4l-3.9-1.2c-1.9-.6-3.4-1.5-4.3-2.8-.9-1.2-1.4-2.5-1.4-3.9 0-1.1.2-2.1.7-3 .5-.9 1.1-1.6 1.9-2.2.8-.6 1.7-1.1 2.8-1.4 1.1-.3 2.2-.5 3.4-.5.6 0 1.2.1 1.8.1.6.1 1.2.2 1.8.3.5.1 1.1.3 1.5.5.5.2.9.4 1.1.6.4.2.6.5.8.7.2.2.2.5.2 1v1.3c0 .6-.2.8-.6.8-.2 0-.6-.1-1-.3-1.4-.6-2.9-.9-4.6-.9-1.5 0-2.7.3-3.6.8-.9.5-1.3 1.3-1.3 2.4 0 .8.3 1.4.8 1.9.5.5 1.5 1 2.9 1.5l3.8 1.2c1.9.6 3.3 1.5 4.2 2.6.8 1.1 1.2 2.4 1.2 3.8 0 1.2-.2 2.2-.7 3.1-.5.9-1.1 1.7-2 2.4-.9.7-1.9 1.2-3.1 1.5-1.2.3-2.5.5-4 .5z" fill="#FF9900"/>
      </svg>
    ),
  },
]

const USER_ROLES = [
  {
    label: "Workspace User",
    desc: "Get the tools you need, instantly. Track your assigned apps and request new access with zero red tape.",
    icon: "◎",
  },
  {
    label: "IT & Finance Leaders",
    desc: "Total visibility and control. One-click approvals, automated utilization tracking, and spend analytics.",
    icon: "◈",
  },
]

/* ── Icons ──────────────────────────────────────────────────────────── */
const IcoMail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/>
  </svg>
)
const IcoLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IcoEyeOn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const IcoEyeOff = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
const IcoAlert = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const IcoArrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IcoShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

function validateEmail(v: string): string {
  if (!v) return "Email is required."
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address."
  return ""
}

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail]           = useState<string>("")
  const [password, setPassword]     = useState<string>("")
  const [showPw, setShowPw]         = useState<boolean>(false)
  const [loading, setLoading]       = useState<boolean>(false)
  const [serverErr, setServerErr]   = useState<string>("")
  const [emailErr, setEmailErr]     = useState<string>("")
  const [emailDirty, setEmailDirty] = useState<boolean>(false)
  const [mounted, setMounted]       = useState<boolean>(false)

  useEffect(() => { setMounted(true) }, [])

  const handleLogin = async (): Promise<void> => {
    const eErr = validateEmail(email)
    if (eErr) { setEmailDirty(true); setEmailErr(eErr); return }
    if (!password) { setServerErr("Password is required."); return }
    setLoading(true)
    setServerErr("")

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setLoading(false)
      setServerErr(authError.message)
      return
    }

    const { data: userRow, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("email", authData.user.email)
      .single()

    setLoading(false)

    if (roleError || !userRow) {
      setServerErr("Account not found. Contact your administrator.")
      return
    }

    if (userRow.role === "admin") {
      router.push("/admin")
    } else {
      router.push("/dashboard")
    }
  }

  const onKey = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter") handleLogin()
  }

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
          --blue-g:  rgba(79,142,247,0.22);
          --blue-r:  rgba(79,142,247,0.15);
          --green:   #00d68f;
          --green-d: rgba(0,214,143,0.07);
          --green-b: rgba(0,214,143,0.18);
          --red:     #fb4f72;
          --red-d:   rgba(251,79,114,0.07);
          --red-b:   rgba(251,79,114,0.18);
          --violet:  #9b7ff4;
          --f:  'Inter', sans-serif;
          --fm: 'JetBrains Mono', monospace;
          --r: 7px;
          --r2: 11px;
        }

        html, body { height: 100%; overflow: hidden; background: var(--bg); }

        @keyframes login-spin  { to { transform: rotate(360deg); } }
        @keyframes login-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }

        .root {
          font-family: var(--f);
          -webkit-font-smoothing: antialiased;
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: var(--bg);
          color: var(--t1);
          position: relative;
        }

        .root::before {
          content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(var(--b0) 1px, transparent 1px),
            linear-gradient(90deg, var(--b0) 1px, transparent 1px);
          background-size: 44px 44px;
        }

        .left {
          display: none;
          position: relative;
          flex: 1;
          height: 100vh;
          overflow: hidden;
          background: var(--s0);
          border-right: 1px solid var(--b0);
          flex-direction: column;
          justify-content: space-between;
          padding: 36px 48px;
          z-index: 1;
        }
        @media (min-width: 1024px) { .left { display: flex; } }

        .left::before {
          content: ''; position: absolute;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(79,142,247,0.08) 0%, transparent 65%);
          bottom: -180px; left: -180px; pointer-events: none;
        }
        .left::after {
          content: ''; position: absolute;
          width: 260px; height: 260px; border-radius: 50%;
          background: radial-gradient(circle, rgba(0,214,143,0.05) 0%, transparent 70%);
          top: -60px; right: -60px; pointer-events: none;
        }

        .left-top { position: relative; z-index: 1; }

        .logo-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 36px; }
        .logo-mark {
          width: 32px; height: 32px; border-radius: 9px;
          background: linear-gradient(135deg, var(--blue) 0%, var(--violet) 100%);
          display: flex; align-items: center; justify-content: center; color: #fff;
          box-shadow: 0 0 20px var(--blue-g); flex-shrink: 0;
        }
        .logo-name { font-size: 15px; font-weight: 700; letter-spacing: -0.4px; color: var(--t1); }
        .logo-badge {
          font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
          background: var(--blue-d); color: var(--blue); border: 1px solid var(--blue-b);
          border-radius: 4px; padding: 1px 5px; margin-left: 2px;
        }

        .eyebrow {
          font-size: 9.5px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 1.2px; color: var(--blue); margin-bottom: 10px;
          display: flex; align-items: center; gap: 8px;
        }
        .eyebrow::after { content:''; flex:1; max-width:28px; height:1px; background:var(--blue); opacity:0.35; }

        .headline {
          font-size: clamp(18px, 1.8vw, 24px);
          font-weight: 300; line-height: 1.45; letter-spacing: -0.4px;
          color: var(--t1); margin-bottom: 10px;
        }
        .headline strong {
          font-weight: 700; color: #fff;
          background: linear-gradient(135deg, #fff 0%, #a5c0ff 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .desc { font-size: 12px; color: var(--t2); line-height: 1.75; max-width: 360px; }

        .left-mid { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 24px; }

        .section-head {
          font-size: 9px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.7px; color: var(--t3); margin-bottom: 9px;
        }

        .roles { display: flex; flex-direction: column; gap: 7px; }
        .role-card {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 12px 15px;
          background: var(--s1); border: 1px solid var(--b0); border-radius: var(--r2);
          opacity: 0; transform: translateX(-8px);
          transition: opacity 0.38s ease, transform 0.38s ease, border-color 0.15s;
        }
        .role-card:hover { border-color: var(--b1); }
        .role-card.show { opacity: 1; transform: translateX(0); }
        .role-icon {
          width: 30px; height: 30px; border-radius: 7px;
          background: var(--green-d); border: 1px solid var(--green-b);
          display: flex; align-items: center; justify-content: center;
          color: var(--green); font-size: 12px; flex-shrink: 0;
          margin-top: 1px;
        }
        .role-name { font-size: 12px; font-weight: 600; color: var(--t1); margin-bottom: 3px; }
        .role-desc { font-size: 10px; color: var(--t3); font-family: var(--fm); line-height: 1.6; }

        .pills { display: flex; flex-wrap: wrap; gap: 5px; }
        .pill {
          display: flex; align-items: center; gap: 5px;
          padding: 4px 10px 4px 7px;
          background: var(--s1); border: 1px solid var(--b0);
          border-radius: 20px; font-size: 10.5px; font-weight: 500; color: var(--t2);
          opacity: 0; transform: translateY(4px);
          transition: opacity 0.22s ease, transform 0.22s ease, border-color 0.13s, color 0.13s;
        }
        .pill:hover { border-color: var(--b1); color: var(--t1); }
        .pill.show { opacity: 1; transform: translateY(0); }
        .pill-ico { display: flex; align-items: center; flex-shrink: 0; }

        .left-foot {
          position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: space-between;
        }
        .foot-copy { font-size: 10.5px; color: var(--t3); font-family: var(--fm); }
        .foot-status {
          display: flex; align-items: center; gap: 5px;
          font-size: 10px; font-family: var(--fm); color: var(--t3);
          background: var(--s1); border: 1px solid var(--b0);
          border-radius: 20px; padding: 3px 9px;
        }
        .status-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--green); box-shadow: 0 0 6px var(--green);
          animation: login-pulse 2.5s infinite;
        }

        .right {
          flex: none; width: 100%; height: 100vh; overflow-y: auto;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 28px;
          background: var(--bg);
          position: relative; z-index: 1;
        }
        @media (min-width: 1024px) { .right { width: 440px; flex-shrink: 0; } }

        .right::before {
          content: ''; position: absolute;
          width: 380px; height: 380px; border-radius: 50%;
          background: radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 70%);
          top: 50%; left: 50%; transform: translate(-50%,-50%);
          pointer-events: none;
        }

        .card { width: 100%; max-width: 350px; position: relative; z-index: 1; }

        .mobile-logo { display: flex; align-items: center; gap: 9px; margin-bottom: 28px; }
        @media (min-width: 1024px) { .mobile-logo { display: none; } }
        .ml-mark {
          width: 28px; height: 28px; border-radius: 7px;
          background: linear-gradient(135deg, var(--blue), var(--violet));
          display: flex; align-items: center; justify-content: center; color: #fff;
          box-shadow: 0 0 14px var(--blue-g);
        }
        .ml-name { font-size: 14px; font-weight: 700; letter-spacing: -0.3px; }

        .form-title    { font-size: 21px; font-weight: 700; letter-spacing: -0.6px; color: #fff; margin-bottom: 4px; line-height: 1.2; }
        .form-subtitle { font-size: 12.5px; color: var(--t2); line-height: 1.55; margin-bottom: 26px; }

        .err-banner {
          background: var(--red-d); border: 1px solid var(--red-b);
          border-radius: var(--r); padding: 10px 12px;
          font-size: 12px; color: var(--red);
          display: flex; align-items: flex-start; gap: 7px;
          line-height: 1.5; margin-bottom: 14px;
        }

        .field { margin-bottom: 13px; }
        .label {
          display: block; font-size: 9.5px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.6px;
          color: var(--t2); margin-bottom: 6px;
        }
        .input-wrap { position: relative; }
        .input-ico {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: var(--t3); pointer-events: none;
          display: flex; align-items: center;
        }
        .input {
          width: 100%;
          background: var(--s2); border: 1px solid var(--b1);
          border-radius: var(--r);
          padding: 11px 12px 11px 36px;
          font-family: var(--f); font-size: 13px; color: var(--t1);
          outline: none;
          transition: border-color 0.12s, box-shadow 0.12s, background 0.12s;
          -webkit-appearance: none;
        }
        .input::placeholder { color: var(--t3); }
        .input:hover:not(:focus) { border-color: var(--b2); }
        .input:focus {
          border-color: var(--blue);
          box-shadow: 0 0 0 3px var(--blue-r);
          background: var(--s3);
        }
        .input.err { border-color: var(--red); box-shadow: 0 0 0 3px rgba(251,79,114,0.1); }
        .input-pr  { padding-right: 38px; }
        .eye-btn {
          position: absolute; right: 11px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--t3); display: flex; align-items: center;
          padding: 3px; transition: color 0.12s;
        }
        .eye-btn:hover { color: var(--t2); }
        .field-err { margin-top: 4px; font-size: 10.5px; color: var(--red); display: flex; align-items: center; gap: 4px; }

        .meta { display: flex; justify-content: flex-end; margin: 3px 0 20px; }
        .forgot { font-size: 11.5px; font-weight: 500; color: var(--blue); text-decoration: none; transition: color 0.12s; }
        .forgot:hover { color: #fff; }

        .submit {
          width: 100%;
          background: var(--blue); color: #fff;
          border: none; border-radius: var(--r);
          padding: 11px 20px;
          font-family: var(--f); font-size: 13.5px; font-weight: 600;
          letter-spacing: -0.1px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: background 0.12s, box-shadow 0.12s, transform 0.1s;
          position: relative; overflow: hidden;
        }
        .submit::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        .submit:hover:not(:disabled) {
          background: #6ba3ff;
          box-shadow: 0 6px 24px var(--blue-g);
          transform: translateY(-1px);
        }
        .submit:active:not(:disabled) { transform: translateY(0); }
        .submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .spinner {
          width: 13px; height: 13px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #fff; border-radius: 50%;
          animation: login-spin 0.65s linear infinite; flex-shrink: 0;
        }

        .form-footer {
          margin-top: 18px; padding-top: 18px;
          border-top: 1px solid var(--b0);
          display: flex; align-items: center; justify-content: center;
          gap: 6px; font-size: 10.5px; color: var(--t3); font-family: var(--fm);
        }
        .ff-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--t3); }
      `}</style>

      <div className="root">

        {/* ── LEFT PANEL ── */}
        <aside className="left">
          <div className="left-top">
            <div className="logo-wrap">
              <div className="logo-mark"><IcoShield /></div>
              <span className="logo-name">SubGuard</span>
              <span className="logo-badge">B2B</span>
            </div>

            <p className="eyebrow">SubGuard</p>

            <h1 className="headline">
              Bring order to your<br />
              <strong>software stack.</strong>
            </h1>

            <p className="desc">
              Automate access requests, eradicate shadow IT, and optimize your SaaS spend—all from one unified workspace.
            </p>
          </div>

          <div className="left-mid">
            <div>
              <p className="section-head">User Roles</p>
              <div className="roles">
                {USER_ROLES.map((r, i) => (
                  <div
                    key={r.label}
                    className={`role-card${mounted ? " show" : ""}`}
                    style={{ transitionDelay: `${i * 75 + 50}ms` }}
                  >
                    <div className="role-icon">{r.icon}</div>
                    <div>
                      <div className="role-name">{r.label}</div>
                      <div className="role-desc">{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="section-head">Active Subscriptions</p>
              <div className="pills">
                {ACTIVE_SUBSCRIPTIONS.map((s, i) => (
                  <div
                    key={s.name}
                    className={`pill${mounted ? " show" : ""}`}
                    style={{ transitionDelay: `${i * 38 + 280}ms` }}
                  >
                    <span className="pill-ico">{s.icon}</span>
                    {s.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="left-foot">
            <span className="foot-copy">© {new Date().getFullYear()} SubGuard</span>
            <span className="foot-status">
              <span className="status-dot" />
              All systems operational
            </span>
          </div>
        </aside>

        {/* ── RIGHT / FORM ── */}
        <div className="right">
          <div className="card">

            <div className="mobile-logo">
              <div className="ml-mark"><IcoShield /></div>
              <span className="ml-name">SubGuard</span>
            </div>

            <h2 className="form-title">Sign in to SubGuard</h2>
            <p className="form-subtitle">Access your subscription dashboard.</p>

            {serverErr && (
              <div className="err-banner" role="alert" data-test="login-error">
                <IcoAlert />{serverErr}
              </div>
            )}

            {/* Email */}
            <div className="field">
              <label className="label" htmlFor="sg-email">Email</label>
              <div className="input-wrap">
                <span className="input-ico"><IcoMail /></span>
                <input
                  id="sg-email"
                  name="email"
                  data-test="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  className={`input${emailDirty && emailErr ? " err" : ""}`}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setEmail(e.target.value)
                    if (emailDirty) setEmailErr(validateEmail(e.target.value))
                  }}
                  onBlur={() => { setEmailDirty(true); setEmailErr(validateEmail(email)) }}
                  onKeyDown={onKey}
                />
              </div>
              {emailDirty && emailErr && (
                <div className="field-err"><IcoAlert />{emailErr}</div>
              )}
            </div>

            {/* Password */}
            <div className="field">
              <label className="label" htmlFor="sg-pw">Password</label>
              <div className="input-wrap">
                <span className="input-ico"><IcoLock /></span>
                <input
                  id="sg-pw"
                  name="password"
                  data-test="login-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  className="input input-pr"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  onKeyDown={onKey}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <IcoEyeOff /> : <IcoEyeOn />}
                </button>
              </div>
            </div>

            <div className="meta">
              <a className="forgot" href="#" tabIndex={0}>Forgot password?</a>
            </div>

            <button
              type="button"
              data-test="login-submit"
              className="submit"
              onClick={handleLogin}
              disabled={loading}
              aria-busy={loading}
            >
              {loading
                ? <><span className="spinner" />Signing in…</>
                : <>Sign in <IcoArrow /></>
              }
            </button>

            <div className="form-footer">
              <span>Secure login</span>
              <span className="ff-dot" />
              <span>Powered by Supabase</span>
              <span className="ff-dot" />
              <span>B2B SaaS</span>
            </div>

          </div>
        </div>

      </div>
    </>
  )
}
