/**
 * BasePortal — canonical shell for all ASG client portals.
 * Every portal inherits from this. Fix it here, fixed everywhere.
 * Do NOT add client-specific logic here. Use PortalConfig + section slots.
 */

import { useState, useRef, useEffect, ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PortalTheme {
  bg: string
  surface: string
  border: string
  gray: string
  lightGray: string
  accent: string
  accentSecondary?: string
}

export const DEFAULT_DARK_THEME: PortalTheme = {
  bg: '#0A0A0A',
  surface: '#111111',
  border: '#1F1F1F',
  gray: '#6B7280',
  lightGray: '#9CA3AF',
  accent: '#7C3AED',
}

export interface NavItem {
  id: string
  label: string
  icon: string
  tag?: string
}

export interface PortalConfig {
  // Identity
  clientName: string
  firmName: string
  agentName: string
  pin: string
  slug: string

  // Branding
  theme: PortalTheme

  // Navigation
  navItems: NavItem[]
  defaultSection: string

  // Chat
  openerMessage?: string  // static fallback if API opener fails
  apiSlug?: string        // slug sent to /api/chat (defaults to config.slug)
  disableTeamContext?: boolean

  // Feature flags
  enableChat?: boolean       // default true
  enableDocuments?: boolean  // default false (per-portal opt-in)
}

// ─── Hook: isMobile ──────────────────────────────────────────────────────────

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

// ─── PIN Gate ─────────────────────────────────────────────────────────────────

interface PinGateProps {
  pin: string
  agentName: string
  agentIcon: string
  agentTagline: string
  accent: string
  bg: string
  onUnlock: () => void
}

export function PinGate({ pin, agentName, agentIcon, agentTagline, accent, bg, onUnlock }: PinGateProps) {
  const [digits, setDigits] = useState(['', '', '', ''])
  const [pinError, setPinError] = useState(false)
  const [shaking, setShaking] = useState(false)

  function checkPin(d: string[]) {
    if (d.join('') === pin) {
      onUnlock()
    } else {
      setPinError(true)
      setShaking(true)
      setDigits(['', '', '', ''])
      setTimeout(() => {
        setShaking(false)
        document.getElementById('pin-0')?.focus()
      }, 400)
    }
  }

  function handleDigit(i: number, val: string) {
    const d = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = d
    setDigits(next)
    setPinError(false)
    if (d && i < 3) {
      const el = document.getElementById(`pin-${i + 1}`)
      if (el) (el as HTMLInputElement).focus()
    }
    if (next.every(v => v !== '') && i === 3) {
      setTimeout(() => checkPin(next), 80)
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      const el = document.getElementById(`pin-${i - 1}`)
      if (el) (el as HTMLInputElement).focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    const next = [...digits]
    for (let i = 0; i < 4; i++) next[i] = text[i] || ''
    setDigits(next)
    if (text.length === 4) setTimeout(() => checkPin(next), 80)
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: '#FAFAFA',
      // Respect notch/home bar on iOS
      paddingTop: 'max(24px, env(safe-area-inset-top))',
      paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
    } as React.CSSProperties}>
      <div style={{ textAlign: 'center', width: '100%', maxWidth: '340px' }}>
        {/* ASG wordmark */}
        <div style={{
          fontSize: '11px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: accent,
          fontWeight: 700,
          marginBottom: '24px',
        }}>
          AxiomStream Group
        </div>

        {/* Agent icon + name */}
        <div style={{ fontSize: '52px', marginBottom: '12px', lineHeight: 1 }}>{agentIcon}</div>
        <h1 style={{ fontSize: '30px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.5px' }}>
          {agentName}
        </h1>
        <p style={{ color: '#666', fontSize: '15px', marginBottom: '40px' }}>{agentTagline}</p>

        {/* PIN inputs */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            marginBottom: '20px',
            animation: shaking ? 'pin-shake 0.35s ease' : 'none',
          } as React.CSSProperties}
        >
          <style>{`
            @keyframes pin-shake {
              0%, 100% { transform: translateX(0); }
              20% { transform: translateX(-8px); }
              40% { transform: translateX(8px); }
              60% { transform: translateX(-6px); }
              80% { transform: translateX(6px); }
            }
          `}</style>
          {digits.map((d, i) => (
            <input
              key={i}
              id={`pin-${i}`}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={d}
              autoFocus={i === 0}
              autoComplete="off"
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              style={{
                width: '68px',
                height: '76px',
                textAlign: 'center',
                fontSize: '32px',
                fontWeight: 700,
                background: '#161616',
                border: `2px solid ${pinError ? '#ef4444' : d ? accent : '#333'}`,
                borderRadius: '14px',
                color: '#FAFAFA',
                fontFamily: "'Inter', sans-serif",
                outline: 'none',
                transition: 'border-color 0.15s',
                boxSizing: 'border-box',
                // Prevent zoom on iOS (must be ≥16px for iOS Safari)
                fontSize_: '32px',
              } as React.CSSProperties}
            />
          ))}
        </div>

        {pinError && (
          <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '8px' }}>
            Incorrect PIN. Try again.
          </p>
        )}
        <p style={{ color: '#555', fontSize: '14px' }}>Enter your 4-digit access code</p>
      </div>
    </div>
  )
}

// ─── Chat Message Types ───────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// ─── Copy Button ──────────────────────────────────────────────────────────────

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^[-*]\s+/gm, '• ')
    .replace(/^---+$/gm, '')
    .trim()
}

export function CopyButton({ text, label = 'Copy', accent }: { text: string; label?: string; accent: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(stripMarkdown(text))
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }}
      style={{
        background: copied ? `${accent}30` : 'transparent',
        border: `1px solid ${copied ? accent : '#333'}`,
        borderRadius: '6px',
        padding: '3px 10px',
        fontSize: '11px',
        fontWeight: 600,
        color: copied ? accent : '#666',
        cursor: 'pointer',
        fontFamily: "'Inter', sans-serif",
        transition: 'all 0.15s',
        marginTop: '6px',
        display: 'block',
      }}
    >
      {copied ? '✓ Copied' : label}
    </button>
  )
}

// ─── Chat Section ─────────────────────────────────────────────────────────────

interface ChatSectionProps {
  config: PortalConfig
  isMobile: boolean
}

export function ChatSection({ config, isMobile }: ChatSectionProps) {
  const { theme, agentName, slug, apiSlug, disableTeamContext, clientName, openerMessage } = config
  const resolvedSlug = apiSlug || slug

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [openerLoaded, setOpenerLoaded] = useState(false)
  const [apiError, setApiError] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const lastMsgRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Load opener on mount
  useEffect(() => {
    if (openerLoaded) return
    setOpenerLoaded(true)
    setLoading(true)
    setApiError(false)

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent: agentName,
        slug: resolvedSlug,
        disableTeamContext: disableTeamContext ?? true,
        message: '__opener__',
        history: [],
      }),
    })
      .then(r => r.json())
      .then(data => {
        const reply = data.reply || data.text || openerMessage || `Good to see you, ${clientName.split(' ')[0]}. What are we working on today?`
        setMessages([{ role: 'assistant', content: reply }])
        setLoading(false)
      })
      .catch(() => {
        const fallback = openerMessage || `Good to see you, ${clientName.split(' ')[0]}. What are we working on today?`
        setMessages([{ role: 'assistant', content: fallback }])
        setLoading(false)
      })
  }, [])

  // Scroll to bottom on new assistant message
  useEffect(() => {
    if (!loading && messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      lastMsgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [messages, loading])

  // Scroll down while loading
  useEffect(() => {
    if (loading) {
      const el = scrollRef.current
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }, [loading])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setApiError(false)
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: agentName,
          slug: resolvedSlug,
          disableTeamContext: disableTeamContext ?? true,
          message: userMsg,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || data.text || data.message || 'Something went wrong — try again.',
      }])
    } catch {
      setApiError(true)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection issue — check your internet and try again.',
      }])
    }
    setLoading(false)
  }

  const firstInitial = (clientName || 'U').charAt(0).toUpperCase()
  const agentInitial = (agentName || 'A').charAt(0).toUpperCase()

  const containerStyle: React.CSSProperties = isMobile
    ? { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }
    : { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', maxWidth: '680px' }

  return (
    <div style={containerStyle}>
      {/* Message list */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          padding: isMobile ? '16px 12px' : '16px',
          background: isMobile ? theme.bg : theme.surface,
          border: isMobile ? 'none' : `1px solid ${theme.border}`,
          borderRadius: isMobile ? '0' : '12px 12px 0 0',
        } as React.CSSProperties}
      >
        {messages.map((m, i) => {
          const isFirst = i === 0
          const isLast = i === messages.length - 1
          return (
            <div
              key={i}
              ref={isLast ? lastMsgRef : undefined}
              style={{
                display: 'flex',
                flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                gap: '10px',
                alignItems: 'flex-end',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                flexShrink: 0,
                background: m.role === 'user' ? '#1e3a5f' : `${theme.accent}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 800,
                color: m.role === 'user' ? '#60a5fa' : theme.accent,
              }}>
                {m.role === 'user' ? firstInitial : agentInitial}
              </div>

              {/* Bubble */}
              <div style={{
                maxWidth: isMobile ? '82%' : '78%',
                background: m.role === 'user' ? '#1a2f50' : '#1a1a1a',
                borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                padding: isMobile ? '14px 16px' : '12px 16px',
                fontSize: '17px',
                lineHeight: 1.7,
                color: '#F0F0F0',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {m.content}
                {/* Copy button: assistant messages only, never on opener (i === 0) */}
                {m.role === 'assistant' && !isFirst && (
                  <CopyButton text={m.content} accent={theme.accent} />
                )}
              </div>
            </div>
          )
        })}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: `${theme.accent}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 800, color: theme.accent,
            }}>
              {agentInitial}
            </div>
            <div style={{
              background: '#1a1a1a',
              borderRadius: '18px 18px 18px 4px',
              padding: '16px 20px',
            }}>
              <span style={{ display: 'inline-flex', gap: '6px' }}>
                {[0, 1, 2].map(j => (
                  <span key={j} style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: theme.accent, opacity: 0.5,
                    display: 'inline-block',
                    animation: `dot-pulse 1.2s ease-in-out ${j * 0.2}s infinite`,
                  }} />
                ))}
              </span>
              <style>{`
                @keyframes dot-pulse {
                  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
                  40% { opacity: 1; transform: scale(1); }
                }
              `}</style>
            </div>
          </div>
        )}

        {/* API error retry */}
        {apiError && !loading && (
          <div style={{ textAlign: 'center', padding: '8px' }}>
            <button
              onClick={() => {
                if (messages.length > 0) {
                  const lastUser = [...messages].reverse().find(m => m.role === 'user')
                  if (lastUser) {
                    setInput(lastUser.content)
                  }
                }
              }}
              style={{
                background: 'transparent',
                border: `1px solid #333`,
                borderRadius: '8px',
                padding: '6px 16px',
                fontSize: '13px',
                color: '#888',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              ↺ Retry
            </button>
          </div>
        )}

        <div style={{ height: '1px', flexShrink: 0 }} />
      </div>

      {/* Input bar */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-end',
        padding: isMobile ? '10px 12px' : '10px 0 0',
        background: isMobile ? '#0d0d0d' : 'transparent',
        borderTop: `1px solid ${theme.border}`,
        // iOS keyboard safe area
        paddingBottom: isMobile ? 'max(10px, env(safe-area-inset-bottom))' : '0',
      } as React.CSSProperties}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          placeholder={`Ask ${agentName} anything...`}
          rows={1}
          style={{
            flex: 1,
            background: '#161616',
            border: `1px solid #333`,
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '17px', // ≥17px prevents iOS zoom
            color: '#F0F0F0',
            fontFamily: "'Inter', -apple-system, sans-serif",
            outline: 'none',
            resize: 'none',
            lineHeight: 1.4,
            minHeight: '48px',
            maxHeight: '120px',
            overflowY: 'auto',
          } as React.CSSProperties}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            background: theme.accent,
            border: 'none',
            borderRadius: '12px',
            width: '48px',
            height: '48px',
            fontSize: '20px',
            color: '#fff',
            cursor: loading || !input.trim() ? 'default' : 'pointer',
            opacity: loading || !input.trim() ? 0.4 : 1,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.15s',
          }}
        >
          →
        </button>
      </div>
    </div>
  )
}

// ─── BasePortal Shell ─────────────────────────────────────────────────────────

interface BasePortalProps {
  config: PortalConfig
  agentIcon: string
  agentTagline: string
  children: (section: string, isMobile: boolean) => ReactNode
}

export default function BasePortal({ config, agentIcon, agentTagline, children }: BasePortalProps) {
  const { pin, agentName, clientName, firmName, theme, navItems, defaultSection } = config
  const [unlocked, setUnlocked] = useState(false)
  const [activeSection, setActiveSection] = useState(defaultSection)
  const isMobile = useIsMobile()

  // Browser back/forward support
  useEffect(() => {
    if (!unlocked) return
    const onPop = () => {
      const hash = window.location.hash.replace('#', '')
      const valid = navItems.map(n => n.id)
      setActiveSection(valid.includes(hash) ? hash : defaultSection)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [unlocked, navItems, defaultSection])

  function navigateTo(section: string) {
    window.history.pushState({}, '', `#${section}`)
    setActiveSection(section)
  }

  if (!unlocked) {
    return (
      <PinGate
        pin={pin}
        agentName={agentName}
        agentIcon={agentIcon}
        agentTagline={agentTagline}
        accent={theme.accent}
        bg={theme.bg}
        onUnlock={() => setUnlocked(true)}
      />
    )
  }

  const isChat = activeSection === 'chat'

  // ─── Mobile layout ───
  if (isMobile) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: theme.bg,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: '#FAFAFA',
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
      } as React.CSSProperties}>
        {/* Top bar */}
        <header style={{
          flexShrink: 0,
          padding: '14px 20px 12px',
          paddingTop: 'max(14px, env(safe-area-inset-top))',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0d0d0d',
        } as React.CSSProperties}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>
              {navItems.find(n => n.id === activeSection)?.icon}
            </span>
            <span style={{ fontSize: '19px', fontWeight: 700 }}>
              {navItems.find(n => n.id === activeSection)?.label}
            </span>
          </div>
          <span style={{
            fontSize: '12px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: theme.accent,
            fontWeight: 700,
          }}>
            {agentName}
          </span>
        </header>

        {/* Content */}
        <main style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflowY: isChat ? 'hidden' : 'auto',
          padding: isChat ? '0' : '20px 16px',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}>
          {children(activeSection, true)}
        </main>

        {/* Bottom tab bar — always visible, including chat */}
        <nav style={{
          flexShrink: 0,
          borderTop: `1px solid ${theme.border}`,
          background: '#0d0d0d',
          display: 'flex',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        } as React.CSSProperties}>
          {navItems.map(item => {
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 4px 10px',
                  background: isActive ? `${theme.accent}12` : 'none',
                  border: 'none',
                  borderTop: `2px solid ${isActive ? theme.accent : 'transparent'}`,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ fontSize: '22px', lineHeight: 1 }}>{item.icon}</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: isActive ? 700 : 500,
                  marginTop: '4px',
                  color: isActive ? theme.accent : '#555',
                  letterSpacing: '0.02em',
                }}>
                  {item.label.split(' ')[0]}
                </span>
              </button>
            )
          })}
        </nav>
      </div>
    )
  }

  // ─── Desktop layout ───
  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: '#FAFAFA',
      display: 'flex',
    }}>
      {/* Sidebar */}
      <div style={{
        width: '220px',
        flexShrink: 0,
        borderRight: `1px solid ${theme.border}`,
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: theme.bg,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Logo / agent name */}
        <div style={{
          padding: '0 20px 24px',
          borderBottom: `1px solid ${theme.border}`,
        }}>
          <div style={{
            fontSize: '10px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: theme.accent,
            fontWeight: 700,
            marginBottom: '4px',
          }}>
            AxiomStream Group
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800 }}>{agentName}</div>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{agentTagline}</div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {navItems.map(item => {
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 20px',
                  background: isActive ? `${theme.accent}10` : 'none',
                  border: 'none',
                  borderLeft: `3px solid ${isActive ? theme.accent : 'transparent'}`,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  textAlign: 'left',
                  transition: 'background 0.1s',
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  flex: 1,
                  color: isActive ? '#FAFAFA' : theme.gray,
                }}>
                  {item.label}
                </span>
                {item.tag && (
                  <span style={{
                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: theme.accent,
                    background: `${theme.accent}18`, borderRadius: '4px',
                    padding: '2px 5px',
                  }}>{item.tag}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Client info footer */}
        <div style={{ padding: '16px 20px', borderTop: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: '11px', color: '#666' }}>{clientName}</div>
          <div style={{ fontSize: '10px', color: '#444', marginTop: '2px' }}>{firmName}</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          borderBottom: `1px solid ${theme.border}`,
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          background: theme.bg,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#FAFAFA' }}>
            {navItems.find(n => n.id === activeSection)?.label}
          </div>
        </header>
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {children(activeSection, false)}
        </main>
      </div>
    </div>
  )
}
