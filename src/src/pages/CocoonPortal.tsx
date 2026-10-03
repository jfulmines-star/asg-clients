import React, { useState, useRef, useEffect, useCallback } from 'react'

/* ────────────────────────────────────────────────
   Cocoon, Inc. — Kit portal
   Hendrix design ported from chardan-portal.vercel.app
   PIN gate → per-user chat (4 users)
──────────────────────────────────────────────── */

const API_BASE = 'https://api.by-kit.com'

type CocoonUser = { pin: string; name: string; initials: string; slug: string }

const USERS: Record<string, CocoonUser> = {
  '1007': { pin: '1007', name: 'Cocoon', initials: 'CO', slug: 'cocoon' },
}

const FONT_SIZES: Record<string, { bubble: number; input: number }> = {
  default: { bubble: 14.5, input: 14.5 },
  medium: { bubble: 16.5, input: 16.5 },
  large: { bubble: 18.5, input: 18.5 },
}
const SIZE_CYCLE = ['default', 'medium', 'large']

const CSS = `
.cocoon-root, .cocoon-root *, .cocoon-root *::before, .cocoon-root *::after {
  box-sizing: border-box; margin: 0; padding: 0;
}
.cocoon-root {
  --navy:        #1B2A4A;
  --navy-light:  #223260;
  --navy-dark:   #111d36;
  --navy-card:   #1a2540;
  --gold:        #00B8D4;
  --gold-muted:  #9e7330;
  --gold-subtle: rgba(0, 184, 212, 0.12);
  --white:       #FFFFFF;
  --off-white:   #e8ecf4;
  --muted:       #6b7a99;
  --border:      rgba(0, 184, 212, 0.15);
  --bubble-user: #1B2A4A;
  --bubble-kit:  #1a2540;
  --shadow:      0 2px 12px rgba(0,0,0,0.45);
  height: 100vh; height: 100dvh;
  background: var(--navy-dark);
  color: var(--off-white);
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  line-height: 1.55;
  overflow: hidden;
}
.cocoon-root[data-theme="light"] {
  --navy:        #f0f3fa;
  --navy-light:  #dde3f0;
  --navy-dark:   #ffffff;
  --navy-card:   #e8edf7;
  --white:       #1B2A4A;
  --off-white:   #1e2c48;
  --muted:       #7a8aaa;
  --border:      rgba(0, 184, 212, 0.22);
  --bubble-user: #dde3f0;
  --bubble-kit:  #edf0f8;
  --shadow:      0 2px 12px rgba(0,0,0,0.10);
}
.cocoon-root #ch-header, .cocoon-root #ch-chat, .cocoon-root #ch-input-area,
.cocoon-root #ch-file-preview, .cocoon-root #ch-drop-error,
.cocoon-root .msg-bubble, .cocoon-root .typing-bubble, .cocoon-root .input-row,
.cocoon-root .date-divider, .cocoon-root .user-pill, .cocoon-root .wordmark-text,
.cocoon-root .header-center, .cocoon-root .msg-timestamp,
.cocoon-root .input-footer, .cocoon-root #ch-msg-input, .cocoon-root .file-chip {
  transition: background 0.2s ease, background-color 0.2s ease,
              color 0.2s ease, border-color 0.2s ease;
}
.cocoon-root #ch-app {
  display: flex; flex-direction: column;
  height: 100vh; height: 100dvh;
  max-width: 900px; margin: 0 auto; position: relative;
}
.cocoon-root #ch-header {
  flex: 0 0 auto; display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px; height: 56px; background: var(--navy);
  border-bottom: 1px solid var(--border); position: relative; z-index: 10;
  box-shadow: 0 1px 10px rgba(0,0,0,0.4);
}
.cocoon-root .wordmark { display: flex; flex-direction: column; gap: 2px; line-height: 1; }
.cocoon-root .wordmark-text {
  font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 700;
  letter-spacing: 0.22em; color: var(--white);
}
.cocoon-root .wordmark-underline { height: 2px; background: var(--gold); border-radius: 1px; }
.cocoon-root .header-center {
  position: absolute; left: 50%; transform: translateX(-50%);
  font-size: 10px; font-weight: 400; color: var(--muted);
  letter-spacing: 0.08em; text-transform: uppercase; pointer-events: none;
}
.cocoon-root .user-pill {
  display: flex; align-items: center; gap: 8px;
  background: rgba(0, 184, 212, 0.1); border: 1px solid rgba(0, 184, 212, 0.25);
  border-radius: 100px; padding: 5px 12px 5px 8px;
}
.cocoon-root .user-avatar {
  width: 26px; height: 26px; border-radius: 50%;
  background: linear-gradient(135deg, var(--gold-muted), var(--gold));
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: var(--navy); flex-shrink: 0;
  letter-spacing: 0.02em;
}
.cocoon-root .user-name { font-size: 13px; font-weight: 500; color: var(--off-white); letter-spacing: 0.01em; }
.cocoon-root .online-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #3ecf8e;
  box-shadow: 0 0 6px rgba(62, 207, 142, 0.6); flex-shrink: 0;
}
.cocoon-root #ch-chat {
  flex: 1 1 0; overflow-y: auto; padding: 24px 20px;
  display: flex; flex-direction: column; gap: 14px; scroll-behavior: smooth;
}
.cocoon-root #ch-chat::-webkit-scrollbar { width: 4px; }
.cocoon-root #ch-chat::-webkit-scrollbar-track { background: transparent; }
.cocoon-root #ch-chat::-webkit-scrollbar-thumb { background: rgba(0, 184, 212, 0.25); border-radius: 2px; }
.cocoon-root .msg-row { display: flex; align-items: flex-end; gap: 10px; animation: chFadeUp 0.2s ease; }
@keyframes chFadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.cocoon-root .msg-row.user { flex-direction: row-reverse; }
.cocoon-root .msg-avatar {
  width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; letter-spacing: 0.02em;
}
.cocoon-root .msg-avatar.kit-av {
  background: linear-gradient(135deg, var(--navy-light), #2a3f72);
  border: 1px solid var(--gold); color: var(--gold);
  font-size: 10px; letter-spacing: 0.04em;
}
.cocoon-root .msg-avatar.user-av {
  background: linear-gradient(135deg, var(--gold-muted), var(--gold)); color: var(--navy);
}
.cocoon-root .msg-body { max-width: 72%; display: flex; flex-direction: column; gap: 3px; }
.cocoon-root .msg-bubble {
  padding: 11px 15px; border-radius: 14px; font-size: 14.5px; line-height: 1.6; position: relative;
}
.cocoon-root .msg-row.user .msg-bubble {
  background: var(--navy-light); border: 1px solid rgba(0, 184, 212, 0.18);
  border-radius: 14px 14px 3px 14px; color: var(--off-white);
}
.cocoon-root .msg-row.kit .msg-bubble {
  background: var(--bubble-kit); border: 1px solid var(--border);
  border-left: 3px solid var(--gold); border-radius: 3px 14px 14px 14px; color: var(--off-white);
}
.cocoon-root .msg-timestamp {
  font-size: 10.5px; color: var(--muted); opacity: 0; transition: opacity 0.2s; padding: 0 4px;
}
.cocoon-root .msg-row.user .msg-timestamp { text-align: right; }
.cocoon-root .msg-row.kit  .msg-timestamp { text-align: left; }
.cocoon-root .msg-row:hover .msg-timestamp { opacity: 1; }
.cocoon-root .typing-row { display: flex; align-items: flex-end; gap: 10px; animation: chFadeUp 0.2s ease; }
.cocoon-root .typing-bubble {
  background: var(--bubble-kit); border: 1px solid var(--border);
  border-left: 3px solid var(--gold); border-radius: 3px 14px 14px 14px;
  padding: 12px 18px; display: flex; align-items: center; gap: 5px;
}
.cocoon-root .typing-dot {
  width: 7px; height: 7px; border-radius: 50%; background: var(--gold);
  animation: chBounce 1.2s infinite ease-in-out;
}
.cocoon-root .typing-dot:nth-child(2) { animation-delay: 0.2s; }
.cocoon-root .typing-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes chBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30%            { transform: translateY(-6px); opacity: 1; }
}
.cocoon-root #ch-file-preview {
  display: flex; align-items: center; gap: 8px; padding: 8px 20px 0; background: var(--navy-dark);
}
.cocoon-root .file-chip {
  display: flex; align-items: center; gap: 7px;
  background: rgba(0, 184, 212, 0.1); border: 1px solid rgba(0, 184, 212, 0.3);
  border-radius: 100px; padding: 4px 10px; font-size: 12.5px; color: var(--gold);
}
.cocoon-root .file-chip-icon { font-size: 13px; opacity: 0.8; }
.cocoon-root .file-chip-remove {
  cursor: pointer; color: var(--muted); font-size: 14px; line-height: 1;
  padding: 0 2px; border-radius: 50%; transition: color 0.15s;
}
.cocoon-root .file-chip-remove:hover { color: var(--off-white); }
.cocoon-root #ch-input-area {
  flex: 0 0 auto; background: var(--navy-dark); padding: 12px 20px 10px;
  border-top: 1px solid var(--border);
}
.cocoon-root .input-row {
  display: flex; align-items: flex-end; gap: 10px;
  background: rgba(27, 42, 74, 0.7); border: 1px solid rgba(0, 184, 212, 0.2);
  border-radius: 14px; padding: 8px 10px; transition: border-color 0.2s;
}
.cocoon-root .input-row:focus-within { border-color: rgba(0, 184, 212, 0.5); }
.cocoon-root .upload-btn {
  background: none; border: none; cursor: pointer; color: var(--muted);
  font-size: 19px; padding: 4px; border-radius: 7px;
  transition: color 0.2s, background 0.2s; display: flex; align-items: center;
  flex-shrink: 0; line-height: 1;
}
.cocoon-root .upload-btn:hover { color: var(--gold); background: rgba(0, 184, 212, 0.1); }
.cocoon-root #ch-msg-input {
  flex: 1; background: none; border: none; outline: none; color: var(--off-white);
  font-family: 'Outfit', sans-serif; font-size: 14.5px; line-height: 1.5;
  resize: none; min-height: 24px; max-height: 140px; padding: 4px; overflow-y: auto;
}
.cocoon-root #ch-msg-input::placeholder { color: var(--muted); }
.cocoon-root #ch-msg-input::-webkit-scrollbar { width: 3px; }
.cocoon-root #ch-msg-input::-webkit-scrollbar-thumb { background: rgba(200,150,62,0.2); }
.cocoon-root .send-btn {
  background: var(--gold); border: none; cursor: pointer; border-radius: 9px;
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: background 0.2s, transform 0.1s;
}
.cocoon-root .send-btn:hover  { background: #d9a84a; }
.cocoon-root .send-btn:active { transform: scale(0.94); }
.cocoon-root .send-btn svg { width: 16px; height: 16px; fill: var(--navy-dark); }
.cocoon-root .input-footer {
  text-align: center; font-size: 10.5px; color: var(--muted); margin-top: 7px;
  letter-spacing: 0.01em;
}
.cocoon-root .date-divider {
  display: flex; align-items: center; gap: 12px; color: var(--muted);
  font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; margin: 4px 0;
}
.cocoon-root .date-divider::before, .cocoon-root .date-divider::after {
  content: ''; flex: 1; height: 1px; background: var(--border);
}
.cocoon-root .theme-btn {
  background: none; border: none; cursor: pointer; font-size: 17px; line-height: 1;
  padding: 4px 6px; border-radius: 7px; color: var(--muted);
  transition: color 0.15s, background 0.15s; display: flex; align-items: center;
  margin-right: 6px;
}
.cocoon-root .theme-btn:hover { color: var(--gold); background: rgba(0, 184, 212, 0.1); }
.cocoon-root[data-theme="light"] .msg-row.user .msg-bubble {
  background: var(--navy-light); color: var(--off-white); border-color: rgba(0, 184, 212, 0.25);
}
.cocoon-root[data-theme="light"] .msg-row.kit .msg-bubble { background: var(--bubble-kit); color: var(--off-white); }
.cocoon-root[data-theme="light"] .typing-bubble { background: var(--bubble-kit); }
.cocoon-root[data-theme="light"] .input-row { background: rgba(220, 228, 245, 0.8); }
.cocoon-root[data-theme="light"] #ch-msg-input { color: var(--off-white); }
.cocoon-root[data-theme="light"] #ch-drop-overlay { background: rgba(220, 228, 245, 0.92); }
.cocoon-root[data-theme="light"] .msg-avatar.kit-av {
  background: linear-gradient(135deg, #c8d0e8, #a8b4d4); border-color: var(--gold); color: var(--gold);
}
.cocoon-root[data-theme="light"] .header-center { color: var(--muted); }
.cocoon-root .font-toggle { display: flex; align-items: center; gap: 4px; margin-right: 10px; }
.cocoon-root .font-btn {
  background: none; border: none; cursor: pointer; color: var(--muted);
  font-family: 'Outfit', sans-serif; font-weight: 600; line-height: 1;
  padding: 3px 5px 4px; border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s; letter-spacing: 0.01em;
}
.cocoon-root .font-btn:hover { color: var(--off-white); }
.cocoon-root .font-btn.active { color: var(--gold); border-bottom-color: var(--gold); }
.cocoon-root .font-btn.small { font-size: 13px; }
.cocoon-root .font-btn.large { font-size: 18px; }
.cocoon-root #ch-drop-overlay {
  display: none; position: absolute; inset: 0; z-index: 50;
  background: rgba(17, 29, 54, 0.88); align-items: center; justify-content: center;
  pointer-events: none;
}
.cocoon-root #ch-drop-overlay.active { display: flex; pointer-events: all; }
.cocoon-root .drop-zone-inner {
  border: 2.5px dashed var(--gold); border-radius: 18px; padding: 48px 72px;
  display: flex; flex-direction: column; align-items: center; gap: 14px;
  text-align: center; animation: chDropPulse 1.8s ease-in-out infinite;
}
@keyframes chDropPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(200,150,62,0.0); }
  50%      { box-shadow: 0 0 24px 4px rgba(200,150,62,0.22); }
}
.cocoon-root .drop-zone-icon { font-size: 42px; opacity: 0.85; }
.cocoon-root .drop-zone-label { font-size: 20px; font-weight: 600; color: var(--gold); letter-spacing: 0.03em; }
.cocoon-root .drop-zone-sub { font-size: 12px; color: var(--muted); letter-spacing: 0.04em; }
.cocoon-root #ch-drop-error {
  font-size: 12.5px; color: #e05a5a; padding: 4px 20px 0; background: var(--navy-dark);
}
/* ─── PIN GATE ─── */
.cocoon-root .pin-screen {
  height: 100vh; height: 100dvh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 22px; padding: 24px;
  background: var(--navy-dark);
}
.cocoon-root .pin-wordmark { display: flex; flex-direction: column; gap: 4px; align-items: center; }
.cocoon-root .pin-wordmark-text {
  font-size: 28px; font-weight: 700; letter-spacing: 0.28em; color: var(--white);
  padding-left: 0.28em;
}
.cocoon-root .pin-wordmark-underline { height: 3px; width: 100%; background: var(--gold); border-radius: 2px; }
.cocoon-root .pin-sub {
  font-size: 11px; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase;
}
.cocoon-root .pin-input {
  width: 190px; text-align: center; font-family: 'Outfit', sans-serif;
  font-size: 26px; font-weight: 600; letter-spacing: 0.5em; padding: 12px 0 12px 0.5em;
  background: rgba(27, 42, 74, 0.7); color: var(--off-white);
  border: 1px solid rgba(0, 184, 212, 0.3); border-radius: 12px; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.cocoon-root .pin-input:focus {
  border-color: var(--gold); box-shadow: 0 0 0 3px rgba(0, 184, 212, 0.18);
}
.cocoon-root .pin-btn {
  background: var(--gold); color: var(--navy-dark); border: none; cursor: pointer;
  font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase; padding: 12px 44px;
  border-radius: 10px; transition: background 0.2s, transform 0.1s;
}
.cocoon-root .pin-btn:hover { background: #d9a84a; }
.cocoon-root .pin-btn:active { transform: scale(0.97); }
.cocoon-root .pin-error { font-size: 13px; color: #e05a5a; min-height: 18px; }
/* ─── RESPONSIVE ─── */
@media (max-width: 600px) {
  .cocoon-root #ch-app { max-width: 100%; overflow-x: hidden; }
  .cocoon-root #ch-header { padding: 0 12px; height: 52px; }
  .cocoon-root .header-center { display: none; }
  .cocoon-root .font-toggle { display: none; }
  .cocoon-root .wordmark-text { font-size: 16px; letter-spacing: 0.18em; }
  .cocoon-root .user-name { font-size: 12px; font-weight: 500; }
  .cocoon-root .user-pill { padding: 5px 10px 5px 6px; gap: 6px; }
  .cocoon-root .user-avatar { width: 22px; height: 22px; font-size: 9px; }
  .cocoon-root .online-dot { width: 6px; height: 6px; }
  .cocoon-root .theme-btn { min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: center; margin-right: 2px; font-size: 18px; }
  .cocoon-root #ch-chat { padding: 14px 12px; gap: 12px; }
  .cocoon-root .msg-body { max-width: 88%; }
  .cocoon-root #ch-input-area { padding: 8px 12px 16px; }
  .cocoon-root .input-row { padding: 6px 8px; gap: 8px; border-radius: 12px; }
  .cocoon-root #ch-msg-input { font-size: 16px; min-height: 28px; }
  .cocoon-root .upload-btn { min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .cocoon-root .send-btn { width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0; }
  .cocoon-root .send-btn svg { width: 17px; height: 17px; }
  .cocoon-root .input-footer { font-size: 10px; margin-top: 5px; }
  .cocoon-root #ch-file-preview { padding: 6px 12px 0; }
  .cocoon-root .drop-zone-inner { padding: 32px 28px; border-radius: 14px; }
  .cocoon-root .drop-zone-label { font-size: 17px; }
  .cocoon-root .drop-zone-icon { font-size: 34px; }
}
@media (max-width: 360px) {
  .cocoon-root .wordmark-text { font-size: 14px; letter-spacing: 0.14em; }
  .cocoon-root .user-name { font-size: 11px; }
  .cocoon-root #ch-header { padding: 0 8px; }
  .cocoon-root #ch-chat { padding: 12px 10px; }
  .cocoon-root #ch-input-area { padding: 8px 10px 14px; }
  .cocoon-root .drop-zone-inner { padding: 24px 20px; }
}
`

type Msg = { role: 'kit' | 'user'; html: string; ts: string }

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
function fileIcon(name: string) {
  const ext = (name.split('.').pop() || '').toLowerCase()
  if (ext === 'pdf') return '📄'
  if (['docx', 'doc'].includes(ext)) return '📝'
  if (['xlsx', 'xls'].includes(ext)) return '📊'
  if (['png', 'jpg', 'jpeg'].includes(ext)) return '🖼️'
  return '📎'
}
function isAllowedType(name: string) {
  const ext = (name.split('.').pop() || '').toLowerCase()
  return ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'png', 'jpg', 'jpeg'].includes(ext)
}
function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default function ChardanPortal() {
  const [user, setUser] = useState<CocoonUser | null>(() => {
    const saved = sessionStorage.getItem('chardan_pin')
    return saved && USERS[saved] ? USERS[saved] : null
  })
  const [pinValue, setPinValue] = useState('')
  const [pinError, setPinError] = useState('')

  const [messages, setMessages] = useState<Msg[]>([])
  const [typing, setTyping] = useState(false)
  const [locked, setLocked] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [dropError, setDropError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('chardan_theme') || 'dark')
  const [fontSize, setFontSize] = useState(() => {
    const s = localStorage.getItem('chardan_font_size') || 'default'
    return FONT_SIZES[s] ? s : 'default'
  })

  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const historyRef = useRef<{ role: string; content: string }[]>([])
  const dragDepthRef = useRef(0)
  const dropErrTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Outfit font
  useEffect(() => {
    const id = 'chardan-outfit-font'
    if (!document.getElementById(id)) {
      const link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      link.href =
        'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
      document.head.appendChild(link)
    }
    document.title = 'Cocoon, Inc. — Kit'
  }, [])

  // Opening message after login
  useEffect(() => {
    if (!user) return
    historyRef.current = []
    setMessages([])
    const firstName = user.name.split(' ')[0]
    const t = setTimeout(() => {
      const opener = `${greeting()}, ${firstName}. Kit here — I build context every session, so the more you use this, the sharper it gets.

A few things you can do right now:
• Drop in a document (PDF, Word, Excel) and ask me to analyze, summarize, or extract data
• Ask me to draft a deal memo, one-pager, pitch, or email
• Research a company, sector, or counterparty
• Run SPAC comps, screen targets, or pull market context
• Handle anything personal — travel, scheduling, research, writing

No topic is outside my lane. What are you working on?`
      const openerHtml = opener.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')
      setMessages([{ role: 'kit', html: openerHtml, ts: now() }])
      historyRef.current.push({ role: 'assistant', content: opener })
    }, 400)
    return () => clearTimeout(t)
  }, [user])

  // Autoscroll
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, typing])

  useEffect(() => {
    localStorage.setItem('chardan_theme', theme)
  }, [theme])
  useEffect(() => {
    localStorage.setItem('chardan_font_size', fontSize)
  }, [fontSize])

  const submitPin = (e?: React.FormEvent) => {
    e?.preventDefault()
    const u = USERS[pinValue.trim()]
    if (u) {
      sessionStorage.setItem('chardan_pin', u.pin)
      setPinError('')
      setUser(u)
    } else {
      setPinError('Invalid PIN. Please try again.')
      setPinValue('')
    }
  }

  const addMessage = useCallback((role: 'kit' | 'user', html: string) => {
    setMessages(m => [...m, { role, html, ts: now() }])
  }, [])

  const showDropError = (msg: string) => {
    setDropError(msg)
    if (dropErrTimer.current) clearTimeout(dropErrTimer.current)
    dropErrTimer.current = setTimeout(() => setDropError(''), 3500)
  }

  const autoResize = () => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }

  const send = () => {
    if (!user || locked) return
    const text = inputValue.trim()
    const hasFile = !!pendingFile
    if (!text && !hasFile) return

    const fname = hasFile ? pendingFile!.name : null
    const userText = hasFile ? (text ? `${text}\n\n📎 ${fname}` : `📎 ${fname}`) : text

    addMessage('user', escapeHtml(userText).replace(/\n/g, '<br>'))
    setInputValue('')
    setPendingFile(null)
    setLocked(true)
    setTyping(true)
    if (inputRef.current) inputRef.current.style.height = 'auto'

    historyRef.current.push({ role: 'user', content: userText })

    if (fname) {
      setTimeout(() => {
        setTyping(false)
        addMessage('kit', `Got it — I'm reviewing <strong>${escapeHtml(fname)}</strong> now. Give me a moment.`)
        historyRef.current.push({ role: 'assistant', content: `Got it — I'm reviewing ${fname} now. Give me a moment.` })
        setTyping(true)
        setTimeout(() => {
          setTyping(false)
          addMessage('kit', `I've read through <strong>${escapeHtml(fname)}</strong>. What would you like to know about it?`)
          historyRef.current.push({ role: 'assistant', content: `I've read through ${fname}. What would you like to know about it?` })
          setLocked(false)
          inputRef.current?.focus()
        }, 1500)
      }, 1200)
    } else {
      fetch(`${API_BASE}/chardan/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: user.pin, message: userText, history: historyRef.current.slice(-20) }),
      })
        .then(r => r.json())
        .then(data => {
          setTyping(false)
          const reply = data.reply || 'Ready when you are.'
          addMessage('kit', escapeHtml(reply).replace(/\n/g, '<br>'))
          historyRef.current.push({ role: 'assistant', content: reply })
          setLocked(false)
          inputRef.current?.focus()
        })
        .catch(() => {
          setTyping(false)
          addMessage('kit', 'Connection issue — please try again.')
          setLocked(false)
          inputRef.current?.focus()
        })
    }
  }

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragDepthRef.current++
    if (dragDepthRef.current === 1) setDragActive(true)
  }
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }
  const onDragLeave = () => {
    dragDepthRef.current--
    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0
      setDragActive(false)
    }
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragDepthRef.current = 0
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (!isAllowedType(file.name)) {
      showDropError('Only PDF, Word, Excel, and image files are supported')
      return
    }
    setPendingFile(file)
    inputRef.current?.focus()
  }

  const cycleFontSize = () => {
    const idx = SIZE_CYCLE.indexOf(fontSize)
    setFontSize(SIZE_CYCLE[(idx + 1) % SIZE_CYCLE.length])
  }

  const fs = FONT_SIZES[fontSize]

  /* ─── PIN GATE SCREEN ─── */
  if (!user) {
    return (
      <div className="cocoon-root" data-theme="">
        <style>{CSS}</style>
        <form className="pin-screen" onSubmit={submitPin}>
          <div className="pin-wordmark">
            <span className="pin-wordmark-text">CHARDAN</span>
            <div className="pin-wordmark-underline"></div>
          </div>
          <span className="pin-sub">Powered by Kit</span>
          <input
            className="pin-input"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            autoFocus
            placeholder="••••"
            value={pinValue}
            onChange={e => {
              setPinValue(e.target.value.replace(/\D/g, '').slice(0, 4))
              setPinError('')
            }}
            aria-label="Enter PIN"
          />
          <button className="pin-btn" type="submit">Enter</button>
          <div className="pin-error">{pinError}</div>
        </form>
      </div>
    )
  }

  /* ─── CHAT SCREEN ─── */
  return (
    <div className="cocoon-root" data-theme={theme === 'light' ? 'light' : ''}>
      <style>{CSS}</style>
      <div
        id="ch-app"
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {/* HEADER */}
        <header id="ch-header">
          <div className="wordmark">
            <span className="wordmark-text">CHARDAN</span>
            <div className="wordmark-underline"></div>
          </div>

          <span className="header-center">Powered by Kit</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <button
              className="theme-btn"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <div className="font-toggle">
              <button
                className={`font-btn small ${fontSize === 'default' ? 'active' : ''}`}
                title="Small text"
                onClick={cycleFontSize}
              >
                A
              </button>
              <button
                className={`font-btn large ${fontSize !== 'default' ? 'active' : ''}`}
                title="Large text"
                onClick={cycleFontSize}
              >
                A
              </button>
            </div>

            <div className="user-pill">
              <div className="user-avatar">{user.initials}</div>
              <span className="user-name">{user.name}</span>
              <div className="online-dot"></div>
            </div>
          </div>
        </header>

        {/* DRAG/DROP OVERLAY */}
        <div id="ch-drop-overlay" className={dragActive ? 'active' : ''}>
          <div className="drop-zone-inner">
            <div className="drop-zone-icon">📂</div>
            <div className="drop-zone-label">Drop to upload</div>
            <div className="drop-zone-sub">PDF · Word · Excel · Images</div>
          </div>
        </div>

        {/* FILE PREVIEW STRIP */}
        {pendingFile && (
          <div id="ch-file-preview">
            <div className="file-chip">
              <span className="file-chip-icon">{fileIcon(pendingFile.name)}</span>
              <span>{pendingFile.name}</span>
              <span className="file-chip-remove" onClick={() => setPendingFile(null)}>
                ✕
              </span>
            </div>
          </div>
        )}
        {dropError && <div id="ch-drop-error">{dropError}</div>}

        {/* CHAT */}
        <div id="ch-chat" ref={chatRef}>
          <div className="date-divider">Today</div>
          {messages.map((m, i) => (
            <div key={i} className={`msg-row ${m.role}`}>
              <div className={`msg-avatar ${m.role === 'kit' ? 'kit-av' : 'user-av'}`}>
                {m.role === 'kit' ? 'KIT' : user.initials}
              </div>
              <div className="msg-body">
                <div
                  className="msg-bubble"
                  style={{ fontSize: fs.bubble + 'px' }}
                  dangerouslySetInnerHTML={{ __html: m.html }}
                />
                <div className="msg-timestamp">{m.ts}</div>
              </div>
            </div>
          ))}
          {typing && (
            <div className="typing-row">
              <div className="msg-avatar kit-av">KIT</div>
              <div className="typing-bubble">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
        </div>

        {/* INPUT */}
        <div id="ch-input-area">
          <div className="input-row">
            <button
              className="upload-btn"
              title="Attach document"
              onClick={() => fileInputRef.current?.click()}
            >
              📎
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
              style={{ display: 'none' }}
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) setPendingFile(f)
                e.target.value = ''
              }}
            />
            <textarea
              id="ch-msg-input"
              ref={inputRef}
              rows={1}
              placeholder="Ask anything — research, deal analysis, document review..."
              value={inputValue}
              disabled={locked}
              style={{ fontSize: fs.input + 'px' }}
              onChange={e => {
                setInputValue(e.target.value)
                autoResize()
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
            />
            <button
              className="send-btn"
              title="Send"
              disabled={locked}
              style={{ opacity: locked ? 0.5 : 1 }}
              onClick={send}
            >
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.4 20.4l17.45-7.48a1 1 0 0 0 0-1.84L3.4 3.6a.993.993 0 0 0-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.51c0 .71.73 1.2 1.39.91z" />
              </svg>
            </button>
          </div>
          <p className="input-footer">Documents are analyzed privately. Nothing shared externally.</p>
        </div>
      </div>
    </div>
  )
}
