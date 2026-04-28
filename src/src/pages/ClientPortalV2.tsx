import { useState, useRef, useEffect } from 'react'
import type { PortalConfig } from '../config/portal-configs'

// ─── Theme helpers ──────────────────────────────────────────────────────────
function getTheme(mode: string) {
  return mode === 'light'
    ? { bg: '#F8F9FA', surface: '#FFFFFF', border: '#E5E7EB', gray: '#6B7280', lightGray: '#4B5563', text: '#111827', subtext: '#6B7280' }
    : { bg: '#0A0A0A', surface: '#111111', border: '#1F1F1F', gray: '#6B7280', lightGray: '#9CA3AF', text: '#FAFAFA', subtext: '#9CA3AF' }
}

const FONT_SIZE: Record<string, number> = { sm: 13, md: 15, lg: 18 }
const DEFAULT_TV = { BG: '#0A0A0A', SURFACE: '#111111', BORDER: '#1F1F1F', GRAY: '#6B7280', LIGHT_GRAY: '#9CA3AF' }

function storageKey(slug: string) { return `asg-portal-v2-${slug}` }
function loadContext(slug: string) {
  try { const s = localStorage.getItem(storageKey(slug)); return s ? JSON.parse(s) : null } catch { return null }
}
function saveContext(slug: string, fields: Record<string, unknown>) {
  const data = { fields, savedAt: new Date().toISOString() }
  localStorage.setItem(storageKey(slug), JSON.stringify(data))
}

// ─── Message renderer ───────────────────────────────────────────────────────
function MessageContent({ content }: { content: string }) {
  // Simple markdown-ish renderer: bold, inline code, newlines
  const parts = content.split(/(\*\*[^*]+\*\*|`[^`]+`|\n)/g)
  return (
    <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.9em' }}>{part.slice(1, -1)}</code>
        }
        if (part === '\n') return <br key={i} />
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}

// ─── Welcome section ─────────────────────────────────────────────────────────
function WelcomeSection({ config, accent, intakeSaved, onNavigate, tv = DEFAULT_TV }: {
  config: PortalConfig; accent: string; intakeSaved: boolean;
  onNavigate: (s: string) => void; tv?: typeof DEFAULT_TV
}) {
  const { SURFACE, BORDER, GRAY, LIGHT_GRAY } = tv
  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: accent, fontWeight: 700, marginBottom: '16px' }}>
        Private Access · {config.company}
      </div>
      <h1 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '8px', lineHeight: '1.0' }}>
        Hey {config.clientName}.
      </h1>
      <h2 style={{ fontSize: '28px', fontWeight: 700, color: GRAY, letterSpacing: '-0.5px', marginBottom: '28px' }}>
        This is {config.agentLabel}.
      </h2>
      <p style={{ fontSize: '16px', color: LIGHT_GRAY, lineHeight: '1.75', marginBottom: '28px' }}>
        {config.tagline}
      </p>
      <div style={{ background: `${accent}08`, border: `1px solid ${accent}25`, borderRadius: '10px', padding: '20px 24px', marginBottom: '32px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: accent, marginBottom: '12px' }}>Your Context</div>
        {typeof config.whatWeKnow === 'string' ? (
          <div style={{ fontSize: '13px', color: LIGHT_GRAY, lineHeight: '1.7' }}>{config.whatWeKnow}</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {(config.whatWeKnow as Array<{ label: string; value: string }>).map(item => (
              <div key={item.label} style={{ background: SURFACE, borderRadius: '6px', padding: '10px 12px', border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: accent, fontWeight: 700, marginBottom: '3px' }}>{item.label}</div>
                <div style={{ fontSize: '12px', color: LIGHT_GRAY, lineHeight: '1.5' }}>{item.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={() => onNavigate('chat')} style={{ background: accent, color: tv.BG, border: 'none', borderRadius: '10px', padding: '16px 28px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
          Chat with {config.agentLabel} →
        </button>
        {!intakeSaved && config.intakeFields.length > 0 && (
          <button onClick={() => onNavigate('intake')} style={{ background: SURFACE, color: LIGHT_GRAY, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '16px 28px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Add Your Context
          </button>
        )}
      </div>
    </div>
  )
}

// ─── About section ────────────────────────────────────────────────────────────
function AboutSection({ config, accent, tv = DEFAULT_TV }: { config: PortalConfig; accent: string; tv?: typeof DEFAULT_TV }) {
  const { BORDER, GRAY, LIGHT_GRAY } = tv
  const points = (config as any).aboutPoints || [
    { icon: '🎯', title: 'Built for Business Development', body: `${config.agentLabel} was built to help you find opportunities, build pipeline, and close. The work that used to take days, done in minutes.` },
    { icon: '🔍', title: 'Research That Goes Deep', body: `Ask ${config.agentLabel} to find the right contacts, understand a market, or profile a target — real research, structured and ready to use.` },
    { icon: '🎙️', title: 'Configured for Your Practice', body: `The context you add about ${config.company} gets loaded into every conversation. Not generic advice — advice calibrated to how you operate.` },
    { icon: '🏗️', title: 'The ASG Model', body: 'AxiomStream Group builds purpose-specific AI for professionals. A tool built for one practice, configured for one team, that gets more useful the longer you use it.' },
  ]
  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: accent, fontWeight: 700, marginBottom: '16px' }}>The Technology</div>
      <h2 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '28px', lineHeight: '1.1' }}>
        {config.agentLabel} — How It Works
      </h2>
      {points.map((p: any, i: number) => (
        <div key={i} style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', padding: '22px 0', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: '26px', flexShrink: 0 }}>{p.icon}</div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{p.title}</div>
            <div style={{ fontSize: '14px', color: GRAY, lineHeight: '1.75' }}>{p.body}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Intake section ───────────────────────────────────────────────────────────
function IntakeSection({ config, accent, fields, setFields, onSave, tv = DEFAULT_TV }: {
  config: PortalConfig; accent: string; fields: Record<string, any>;
  setFields: (f: Record<string, any>) => void; onSave: (e: React.FormEvent) => void; tv?: typeof DEFAULT_TV
}) {
  const { BG, SURFACE, BORDER, GRAY, LIGHT_GRAY } = tv
  function toggleChip(key: string, val: string) {
    const cur: string[] = fields[key] || []
    setFields({ ...fields, [key]: cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val] })
  }
  const labelStyle = { fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: GRAY, display: 'block', marginBottom: '10px' }
  const inputStyle = { width: '100%', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '12px 16px', fontSize: '14px', color: LIGHT_GRAY, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const }
  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: '#A78BFA', fontWeight: 700, marginBottom: '16px' }}>Quick Context — 2 Minutes</div>
      <h2 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '12px', lineHeight: '1.1' }}>Tell Us About<br />Your Practice</h2>
      <p style={{ fontSize: '15px', color: LIGHT_GRAY, lineHeight: '1.7', marginBottom: '28px' }}>
        We've pre-loaded what we already know. Review it, correct anything off, and add what only you know.
      </p>
      <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {config.intakeFields.map((field: any) => (
          <div key={field.key}>
            <label style={labelStyle}>{field.label}</label>
            {field.type === 'text' && (
              <input type="text" placeholder={field.placeholder} value={fields[field.key] || ''} onChange={e => setFields({ ...fields, [field.key]: e.target.value })} style={inputStyle} />
            )}
            {field.type === 'textarea' && (
              <textarea placeholder={field.placeholder} value={fields[field.key] || ''} onChange={e => setFields({ ...fields, [field.key]: e.target.value })} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
            )}
            {field.type === 'chips' && field.options && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {field.options.map((opt: string) => {
                  const active = (fields[field.key] || []).includes(opt)
                  return (
                    <button key={opt} type="button" onClick={() => toggleChip(field.key, opt)} style={{ background: active ? `${accent}20` : SURFACE, border: `1px solid ${active ? accent : BORDER}`, borderRadius: '20px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer', color: active ? accent : GRAY, fontFamily: 'inherit', transition: 'all 0.15s' }}>
                      {opt}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
        <button type="submit" style={{ background: '#A78BFA', color: BG, border: 'none', borderRadius: '10px', padding: '15px 28px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          Save My Context →
        </button>
      </form>
    </div>
  )
}

// ─── Chat section ─────────────────────────────────────────────────────────────
function ChatSection({ config, accent, savedContext, fields, fontSize = 14, themeMode = 'dark', tv, preloadedHistory }: {
  config: PortalConfig; accent: string; savedContext: any; fields: any;
  fontSize?: number; themeMode?: string; tv?: typeof DEFAULT_TV; preloadedHistory?: { role: string; content: string }[] | null
}) {
  const th = tv || DEFAULT_TV
  const bg = themeMode === 'light' ? '#F8F9FA' : th.BG
  const surface = themeMode === 'light' ? '#FFFFFF' : th.SURFACE
  const border = themeMode === 'light' ? '#E5E7EB' : th.BORDER
  const gray = th.GRAY
  const lightGray = themeMode === 'light' ? '#4B5563' : th.LIGHT_GRAY

  const memberName = (config as any).memberName || config.clientName

  const [messages, setMessages] = useState<{ role: string; content: string; _id?: number }[]>([])
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [inputKey, setInputKey] = useState(0)
  const [ready, setReady] = useState(false)
  const [freshStart, setFreshStart] = useState(false)
  const [ragDocNames, setRagDocNames] = useState<string[]>([])

  // Fetch uploaded RAG docs for this portal so Kit knows about them in the main chat
  useEffect(() => {
    const enableDocs = !!(config as any).enableDocuments
    if (!enableDocs) return
    fetch(`/api/rag-documents?tenantId=${encodeURIComponent(config.slug)}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: any) => {
        const raw = Array.isArray(data) ? data : (data.documents || data.docs || [])
        setRagDocNames(raw.map((d: any) => d.name || d.filename).filter(Boolean))
      })
      .catch(() => {})
  }, [config.slug])
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastMsgRef = useRef<HTMLDivElement>(null)

  // Load history on mount — use preloaded data if available (avoids race condition)
  useEffect(() => {
    async function load() {
      try {
        // If parent already fetched history, use it directly — no extra network call
        if (preloadedHistory !== undefined && preloadedHistory !== null) {
          if (preloadedHistory.length > 0) {
            setMessages(preloadedHistory)
          }
          setReady(true)
          return
        }
        // Fallback: fetch directly
        const r = await fetch(`/api/history?slug=${encodeURIComponent(config.slug)}&member=${encodeURIComponent(memberName)}`)
        if (r.ok) {
          const d = await r.json()
          const msgs = d.messages || d.history || []
          if (msgs.length > 0) {
            const recent = msgs.slice(-60)
            setMessages(recent.map((m: any) => ({ role: m.role === 'agent' ? 'assistant' : m.role, content: m.content })))
          }
        }
      } catch {}
      setReady(true)
    }
    load()
  }, [preloadedHistory])

  // Greeting on first load or after fresh start
  useEffect(() => {
    if (!ready && !freshStart) return
    if (messages.length === 0) {
      const greeting = { role: 'assistant', content: config.chatGreeting(!!savedContext) }
      setMessages([greeting])
      void fetch('/api/portal-chat-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: config.slug, role: 'assistant', content: greeting.content }),
      }).catch(() => {})
    }
  }, [ready, freshStart])

  useEffect(() => {
    if (loading) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [loading])

  useEffect(() => {
    if (!loading && messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      lastMsgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [messages])

  const extraContext = [
    fields
      ? '\n\n## Practice Context\n' + config.intakeFields.map((f: any) =>
          `${f.label}: ${Array.isArray(fields[f.key]) ? fields[f.key].join(', ') : fields[f.key] || 'not specified'}`
        ).join('\n')
      : '',
    ragDocNames.length > 0
      ? `\n\n## Uploaded Documents\nThe user has uploaded the following documents to their Knowledge Base. You have access to these via the Documents tab and can reference them in any conversation.\n${ragDocNames.map((n, i) => `  ${i + 1}. ${n}`).join('\n')}`
      : '',
  ].join('')

  function handleStartFresh() {
    // Clears the visual conversation and sets a fresh-start flag.
    // Redis history is preserved — Rex's institutional memory stays intact.
    // A session break marker is written so future loads skip past this point.
    void fetch('/api/portal-chat-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: config.slug, role: 'system', content: '___SESSION_BREAK___' }),
    }).catch(() => {})
    setMessages([])
    setFreshStart(true)
    setInput('')
    setInputKey(k => k + 1)
  }

  async function send() {
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput('')
    setInputKey(k => k + 1)
    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    // User message is saved by /api/chat — no separate write needed

    const ts = Date.now()
    // Use animated dots indicator only — no static loading message bubble
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: config.agentId, message: text, history, slug: config.slug, teamMember: memberName, isLead: false, extraContext, disableTeamContext: !!(config as any).disableTeamContext }),
      })
      const data = await res.json()
      const reply = data.reply || data.text || data.message || 'Something went wrong.'
      // Assistant reply is saved by /api/chat — no separate write needed
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection issue. Try again.' }])
    }
    setLoading(false)
  }

  const agentInitial = config.agentLabel.charAt(0).toUpperCase()
  const clientInitial = config.clientName.charAt(0).toUpperCase()

  return (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 120px)', minHeight: '400px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: accent, fontWeight: 700, marginBottom: '6px' }}>Your Access</div>
          <h2 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '4px' }}>Chat with {config.agentLabel}</h2>
          <p style={{ fontSize: '13px', color: gray }}>
            {config.company} context loaded.{savedContext && <span style={{ color: accent }}> Practice context saved ✓</span>}
          </p>
        </div>
        <button
          onClick={handleStartFresh}
          title="Start a fresh conversation. Your history and context are preserved."
          style={{ flexShrink: 0, marginTop: '4px', padding: '7px 14px', borderRadius: '8px', border: `1px solid ${border}`, background: 'transparent', color: gray, fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
        >
          ↺ Start Fresh
        </button>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: surface, border: `1px solid ${border}`, borderRadius: '12px 12px 0 0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((msg, i) => (
          <div key={i} ref={i === messages.length - 1 ? lastMsgRef : undefined} style={{ display: 'flex', gap: '10px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0, background: msg.role === 'user' ? '#1e3a5f' : `${accent}20`, border: `1px solid ${msg.role === 'user' ? '#2563eb40' : accent + '40'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: msg.role === 'user' ? '#60a5fa' : accent }}>
              {msg.role === 'user' ? clientInitial : agentInitial}
            </div>
            <div style={{ maxWidth: '80%', minWidth: 0, background: msg.role === 'user' ? '#1e3a5f' : themeMode === 'light' ? '#F3F4F6' : '#161616', border: `1px solid ${msg.role === 'user' ? '#2563eb30' : border}`, borderRadius: '10px', padding: '12px 16px', fontSize: `${fontSize}px`, color: themeMode === 'light' ? (msg.role === 'user' ? '#FAFAFA' : '#111827') : '#FAFAFA', lineHeight: '1.7' }}>
              <MessageContent content={msg.content} />
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `${accent}20`, border: `1px solid ${accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: accent }}>{agentInitial}</div>
            <div style={{ background: '#161616', border: `1px solid ${border}`, borderRadius: '10px', padding: '12px 16px' }}>
              <span style={{ display: 'inline-flex', gap: '4px' }}>
                {[0, 1, 2].map(i => <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: accent, opacity: 0.5, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ background: surface, border: `1px solid ${border}`, borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '12px', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
        <textarea
          key={inputKey}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder={messages.filter(m => m.role === 'user').length > 0 ? '' : config.chatPlaceholder}
          rows={2}
          autoComplete="off"
          autoCorrect="on"
          autoCapitalize="sentences"
          spellCheck={true}
          style={{ flex: 1, background: themeMode === 'light' ? '#F9FAFB' : '#0d0d0d', border: `1px solid ${border}`, borderRadius: '8px', padding: '10px 14px', fontSize: `${fontSize}px`, color: themeMode === 'light' ? '#111827' : '#FAFAFA', fontFamily: 'inherit', outline: 'none', resize: 'none', lineHeight: '1.5' }}
        />
        <button onClick={send} disabled={!input.trim() || loading} style={{ width: '44px', height: '44px', borderRadius: '50%', background: accent, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: !input.trim() || loading ? 0.4 : 1, transition: 'opacity 0.15s' }}>
          <span style={{ fontSize: '18px', color: '#fff', fontWeight: 900 }}>↑</span>
        </button>
      </div>

      <div style={{ marginTop: '8px', fontSize: '11px', color: '#333', textAlign: 'center' }}>
        {(config as any).poweredBy || 'Powered by AxiomStream Group'}
      </div>

      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.8);opacity:0.4}40%{transform:scale(1.1);opacity:1}}`}</style>
    </div>
  )
}

// ─── Document upload section ──────────────────────────────────────────────────
interface DocFile { name: string; size: number; content: string; mimeType: string; uploadedAt: string }

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

const ACCEPTED_TYPES = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.md,.png,.jpg,.jpeg,.pptx,.ppt'

function DocumentsSection({ config, accent, themeMode, fontSize, tv }: {
  config: PortalConfig; accent: string; themeMode: string; fontSize: number; tv: typeof DEFAULT_TV
}) {
  const bg = themeMode === 'light' ? '#F8F9FA' : tv.BG
  const surface = themeMode === 'light' ? '#FFFFFF' : tv.SURFACE
  const border = themeMode === 'light' ? '#E5E7EB' : tv.BORDER
  const gray = tv.GRAY
  const text = themeMode === 'light' ? '#111827' : '#FAFAFA'
  const muted = themeMode === 'light' ? '#6B7280' : tv.LIGHT_GRAY

  const [files, setFiles] = useState<DocFile[]>([])
  const [selected, setSelected] = useState<DocFile | null>(null)
  const [docMsgs, setDocMsgs] = useState<{ role: string; content: string; _id?: number }[]>([])
  const [docInput, setDocInput] = useState('')
  const [docLoading, setDocLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastRef = useRef<HTMLDivElement>(null)
  const memberName = (config as any).memberName || config.clientName

  useEffect(() => {
    if (lastRef.current) lastRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [docMsgs])

  async function readFile(file: File): Promise<DocFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      const isText = /text\/|\.txt|\.csv|\.md/.test(file.type + file.name)
      reader.onload = () => {
        resolve({
          name: file.name,
          size: file.size,
          content: reader.result as string,
          mimeType: file.type || 'application/octet-stream',
          uploadedAt: new Date().toISOString(),
        })
      }
      reader.onerror = reject
      if (isText) reader.readAsText(file)
      else reader.readAsDataURL(file)
    })
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return
    const newDocs: DocFile[] = []
    for (const f of Array.from(fileList)) {
      try { newDocs.push(await readFile(f)) } catch { /* skip */ }
    }
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      return [...prev, ...newDocs.filter(d => !existing.has(d.name))]
    })
    if (newDocs.length > 0 && !selected) setSelected(newDocs[0])
  }

  function buildDocContext(doc: DocFile): string {
    // For images and PDFs, we use the vision/document API path instead — this is only for other file types
    const preview = typeof doc.content === 'string' && !doc.content.startsWith('data:')
      ? doc.content.slice(0, 8000)
      : `[Binary file: ${doc.name}]`
    return `## Document: ${doc.name}\nSize: ${formatBytes(doc.size)}\n\n${preview}`
  }

  async function sendDocMsg() {
    if (!docInput.trim() || !selected || docLoading) return
    const text = docInput.trim()
    setDocInput('')
    setDocMsgs(prev => [...prev, { role: 'user', content: text }])
    setDocLoading(true)
    try {
      const history = docMsgs.map(m => ({ role: m.role, content: m.content }))
      const isImage = selected.mimeType.startsWith('image/')
      const isPDF = selected.mimeType === 'application/pdf' || selected.name.toLowerCase().endsWith('.pdf')

      // For images and PDFs, extract the raw base64 data and use the vision/document API path
      let bodyPayload: Record<string, unknown> = {
        agent: config.agentId,
        message: text,
        history,
        slug: config.slug,
        teamMember: memberName,
        isLead: false,
        disableTeamContext: true,
        extraContext: `\n\n## Document Analysis Mode\nUser has shared a document and is asking questions about it.`,
      }

      if ((isImage || isPDF) && typeof selected.content === 'string' && selected.content.startsWith('data:')) {
        // Strip the data URL prefix to get raw base64
        const base64Data = selected.content.split(',')[1] || ''
        bodyPayload = {
          ...bodyPayload,
          documentBase64: base64Data,
          documentType: selected.mimeType,
          documentName: selected.name,
        }
      } else if (!isImage && !isPDF) {
        // Text/other files: include content in extraContext
        bodyPayload.extraContext = `\n\n## Document Analysis Mode\nUser has uploaded a document and is asking questions about it.\n\n${buildDocContext(selected)}`
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      })
      const data = await res.json()
      setDocMsgs(prev => [...prev, { role: 'assistant', content: data.reply || data.text || data.message || 'Something went wrong.' }])
    } catch {
      setDocMsgs(prev => [...prev, { role: 'assistant', content: 'Connection issue. Try again.' }])
    }
    setDocLoading(false)
  }

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 140px)', minHeight: '500px' }}>
      {/* Left: file list + upload */}
      <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? accent : border}`,
            borderRadius: '10px',
            padding: '20px 12px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? `${accent}08` : surface,
            transition: 'all 0.15s',
          }}
        >
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>📎</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: accent, marginBottom: '4px' }}>Drop files or click</div>
          <div style={{ fontSize: '11px', color: muted, lineHeight: '1.5' }}>PDF · DOCX · XLS · CSV · TXT · PNG · JPG</div>
          <input ref={fileInputRef} type="file" multiple accept={ACCEPTED_TYPES} style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
        </div>

        {/* File list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {files.length === 0 && (
            <div style={{ textAlign: 'center', color: muted, fontSize: '12px', padding: '20px 8px', lineHeight: '1.7' }}>
              No documents yet.<br />Upload one to get started.
            </div>
          )}
          {files.map((f, i) => (
            <div key={i} onClick={() => { setSelected(f); setDocMsgs([]) }}
              style={{
                padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px',
                background: selected?.name === f.name ? `${accent}15` : 'transparent',
                border: `1px solid ${selected?.name === f.name ? accent + '40' : 'transparent'}`,
                transition: 'all 0.15s',
              }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: selected?.name === f.name ? accent : text, wordBreak: 'break-word', lineHeight: '1.3', marginBottom: '3px' }}>{f.name}</div>
              <div style={{ fontSize: '11px', color: muted }}>{formatBytes(f.size)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: document chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: surface, border: `1px solid ${border}`, borderRadius: '12px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${border}`, background: `${accent}08` }}>
          {selected
            ? <><div style={{ fontSize: '13px', fontWeight: 700, color: accent }}>{selected.name}</div><div style={{ fontSize: '11px', color: muted }}>Ask {config.agentLabel} anything about this document</div></>
            : <div style={{ fontSize: '13px', color: muted }}>Upload a document to start asking questions</div>
          }
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!selected && (
            <div style={{ textAlign: 'center', color: muted, fontSize: '13px', marginTop: '40px', lineHeight: '1.7' }}>
              Select or upload a document on the left,<br />then ask {config.agentLabel} anything about it.
            </div>
          )}
          {docMsgs.map((msg, i) => (
            <div key={i} ref={i === docMsgs.length - 1 ? lastRef : undefined}
              style={{ display: 'flex', gap: '8px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
              {msg.role === 'assistant' && (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${accent}20`, border: `1px solid ${accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: accent, flexShrink: 0 }}>
                  {config.agentLabel.charAt(0)}
                </div>
              )}
              <div style={{ maxWidth: '75%', background: msg.role === 'user' ? accent : `${accent}10`, border: `1px solid ${msg.role === 'user' ? 'transparent' : accent + '25'}`, borderRadius: '10px', padding: '10px 14px', fontSize: `${fontSize}px`, color: msg.role === 'user' ? '#fff' : text, lineHeight: '1.6' }}>
                <MessageContent content={msg.content} />
              </div>
            </div>
          ))}
          {docLoading && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${accent}20`, border: `1px solid ${accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: accent }}>
                {config.agentLabel.charAt(0)}
              </div>
              <div style={{ background: `${accent}10`, border: `1px solid ${accent}25`, borderRadius: '10px', padding: '12px 16px' }}>
                <span style={{ display: 'inline-flex', gap: '4px' }}>
                  {[0,1,2].map(i => <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: accent, opacity: 0.5, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: '12px', borderTop: `1px solid ${border}`, display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <textarea
            value={docInput}
            onChange={e => setDocInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendDocMsg() } }}
            placeholder={selected ? `Ask about ${selected.name}...` : 'Upload a document first...'}
            disabled={!selected}
            rows={2}
            style={{ flex: 1, background: themeMode === 'light' ? '#F9FAFB' : '#0d0d0d', border: `1px solid ${border}`, borderRadius: '8px', padding: '10px 14px', fontSize: `${fontSize}px`, color: text, fontFamily: 'inherit', outline: 'none', resize: 'none', lineHeight: '1.5', opacity: selected ? 1 : 0.5 }}
          />
          <button onClick={sendDocMsg} disabled={!docInput.trim() || !selected || docLoading}
            style={{ width: '44px', height: '44px', borderRadius: '50%', background: accent, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: (!docInput.trim() || !selected || docLoading) ? 0.4 : 1, transition: 'opacity 0.15s' }}>
            <span style={{ fontSize: '18px', color: '#fff', fontWeight: 900 }}>↑</span>
          </button>
        </div>
        <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.8);opacity:0.4}40%{transform:scale(1.1);opacity:1}}`}</style>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ClientPortalV2({ config }: { config: PortalConfig }) {
  const accent = config.accentColor
  const [themeMode, setThemeMode] = useState('dark')
  const [textSize, setTextSize] = useState('md')
  const theme = getTheme(themeMode)
  const tv = { BG: theme.bg, SURFACE: theme.surface, BORDER: theme.border, GRAY: theme.gray, LIGHT_GRAY: theme.lightGray }

  const [unlocked, setUnlocked] = useState(false)
  const [digits, setDigits] = useState(['', '', '', ''])
  const [pinError, setPinError] = useState(false)
  const [savedContext, setSavedContext] = useState<any>(null)
  const [intakeSaved, setIntakeSaved] = useState(false)
  const [section, setSection] = useState('welcome')
  const [fields, setFields] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {}
    for (const f of config.intakeFields as any[]) {
      init[f.key] = f.type === 'chips' ? (f.default ? f.default.split(',') : []) : (f.default ?? '')
    }
    return init
  })

  // Pre-load history at top level so ChatSection always has it on mount
  const [preloadedHistory, setPreloadedHistory] = useState<{ role: string; content: string }[] | null>(null)
  useEffect(() => {
    const memberName = (config as any).memberName || config.clientName
    fetch(`/api/history?slug=${encodeURIComponent(config.slug)}&member=${encodeURIComponent(memberName)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          const msgs = (d.messages || d.history || []).slice(-60)
          setPreloadedHistory(msgs.map((m: any) => ({ role: m.role === 'agent' ? 'assistant' : m.role, content: m.content })))
        } else {
          setPreloadedHistory([])
        }
      })
      .catch(() => setPreloadedHistory([]))
  }, [config.slug])

  // On unlock, load saved context
  useEffect(() => {
    if (!unlocked) return
    const ctx = loadContext(config.slug)
    if (ctx) { setSavedContext(ctx); setIntakeSaved(true); setFields(ctx.fields) }
    if (config.intakeFields.length === 0 || ctx) setSection('chat')
  }, [unlocked])

  function handleDigit(i: number, val: string) {
    const d = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]; next[i] = d; setDigits(next); setPinError(false)
    if (d && i < 3) (document.getElementById(`pin-${i + 1}`) as HTMLInputElement)?.focus()
    if (next.every(v => v !== '') && i === 3) setTimeout(() => checkPin(next), 80)
  }
  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      (document.getElementById(`pin-${i - 1}`) as HTMLInputElement)?.focus()
      setDigits(prev => { const n = [...prev]; n[i - 1] = ''; return n })
    }
  }
  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (text.length === 4) { const d = text.split(''); setDigits(d); setTimeout(() => checkPin(d), 80) }
  }
  function checkPin(d = digits) {
    if (d.join('') === config.pin) { setUnlocked(true) }
    else { setPinError(true); setDigits(['', '', '', '']); setTimeout(() => (document.getElementById('pin-0') as HTMLInputElement)?.focus(), 80) }
  }
  function handleSaveIntake(e: React.FormEvent) {
    e.preventDefault()
    saveContext(config.slug, fields)
    const ctx = { fields, savedAt: new Date().toISOString() }
    setSavedContext(ctx); setIntakeSaved(true); setSection('chat')
  }

  const enableDocuments = !!(config as any).enableDocuments

  const navItems = config.intakeFields.length > 0
    ? [
        { id: 'welcome', label: 'Welcome', icon: '👋' },
        { id: 'about', label: `About ${config.agentLabel}`, icon: '⚡' },
        ...(!intakeSaved ? [{ id: 'intake', label: 'Your Practice', icon: '🏢' }] : []),
        { id: 'chat', label: `Chat with ${config.agentLabel}`, icon: '💬', tag: 'Live' },
        ...(enableDocuments ? [{ id: 'documents', label: 'Documents', icon: '📁' }] : []),
      ]
    : [
        { id: 'chat', label: `Chat with ${config.agentLabel}`, icon: '💬', tag: 'Live' },
        ...(enableDocuments ? [{ id: 'documents', label: 'Documents', icon: '📁' }] : []),
      ]

  if (!unlocked) {
    return (
      <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <style>{`html, body, #root { background: ${theme.bg}; margin: 0; padding: 0; }`}</style>
        <div style={{ textAlign: 'center', maxWidth: '360px', padding: '0 24px' }}>
          <div style={{ fontSize: '13px', letterSpacing: '4px', textTransform: 'uppercase', color: accent, fontWeight: 700, marginBottom: '12px' }}>AxiomStream Group</div>
          <div style={{ fontSize: '32px', fontWeight: 900, marginBottom: '6px', letterSpacing: '-0.5px', color: theme.text }}>{config.clientName}</div>
          <div style={{ fontSize: '14px', color: theme.gray, marginBottom: '40px' }}>{config.company} · Private Access</div>
          <div style={{ fontSize: '13px', color: theme.gray, marginBottom: '20px', letterSpacing: '2px', textTransform: 'uppercase' }}>Enter access code</div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
            {digits.map((d, i) => (
              <input key={i} id={`pin-${i}`} type="tel" inputMode="numeric" maxLength={1} value={d} autoFocus={i === 0}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                style={{ width: '56px', height: '64px', textAlign: 'center', fontSize: '24px', fontWeight: 800, background: theme.surface, border: `2px solid ${pinError ? '#EF4444' : d ? accent : theme.border}`, borderRadius: '10px', color: theme.text, fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.15s' }}
              />
            ))}
          </div>
          {pinError && <div style={{ color: '#EF4444', fontSize: '13px', marginBottom: '16px' }}>Incorrect code — try again</div>}
          <div style={{ fontSize: '12px', color: '#333', marginTop: '32px' }}>Secured by AxiomStream Group</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`html, body, #root { background: ${theme.bg}; margin: 0; padding: 0; }`}</style>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: `1px solid ${theme.border}`, position: 'sticky', top: 0, background: theme.bg, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: '11px', letterSpacing: '3px', color: accent, textTransform: 'uppercase', fontWeight: 700 }}>AxiomStream Group</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: theme.text }}>{config.clientName} · {config.agentLabel}</div>
        </div>
        {intakeSaved && <div style={{ fontSize: '11px', color: accent, background: `${accent}15`, border: `1px solid ${accent}30`, borderRadius: '20px', padding: '4px 12px' }}>Context saved ✓</div>}
      </div>

      <style>{`
        @media (max-width: 600px) {
          .portal-layout { flex-direction: column !important; }
          .portal-sidebar { width: 100% !important; position: static !important; height: auto !important; border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.08) !important; padding: 12px 16px !important; }
          .portal-sidebar-nav { display: flex !important; flex-direction: row !important; gap: 8px !important; flex-wrap: wrap !important; }
          .portal-sidebar-meta { display: none !important; }
          .portal-mobile-controls { display: flex !important; }
          .portal-main { min-height: calc(100dvh - 120px) !important; padding: 12px 8px !important; }
        }
        @media (min-width: 601px) { .portal-mobile-controls { display: none !important; } }
      `}</style>

      <div className="portal-layout" style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
        {/* Sidebar */}
        <div className="portal-sidebar" style={{ width: '220px', flexShrink: 0, borderRight: `1px solid ${theme.border}`, padding: '28px 14px', position: 'sticky', top: '60px', height: 'calc(100vh - 60px)', overflowY: 'auto' }}>
          <div style={{ fontSize: '10px', letterSpacing: '3px', color: theme.gray, textTransform: 'uppercase', marginBottom: '10px' }}>Navigation</div>
          <div className="portal-sidebar-nav">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setSection(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: section === item.id ? `${accent}15` : 'transparent', color: section === item.id ? accent : theme.gray, fontFamily: 'inherit', fontSize: '14px', fontWeight: section === item.id ? 700 : 400, marginBottom: '2px', transition: 'all 0.15s' }}>
                <span>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.tag && <span style={{ fontSize: '10px', background: `${accent}20`, color: accent, padding: '2px 7px', borderRadius: '10px', fontWeight: 700 }}>{item.tag}</span>}
              </button>
            ))}
          </div>

          {/* Mobile controls */}
          <div className="portal-mobile-controls" style={{ alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingTop: '8px', borderTop: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: theme.gray, textTransform: 'uppercase', letterSpacing: '2px', marginRight: '4px' }}>Size</span>
              {(['sm', 'md', 'lg'] as const).map(s => (
                <button key={s} onClick={() => setTextSize(s)} style={{ width: '34px', height: '30px', borderRadius: '6px', border: `1px solid ${textSize === s ? accent : theme.border}`, background: textSize === s ? `${accent}15` : 'transparent', color: textSize === s ? accent : theme.gray, fontFamily: 'inherit', cursor: 'pointer', fontSize: s === 'sm' ? '11px' : s === 'md' ? '13px' : '15px', fontWeight: 700 }}>A</button>
              ))}
            </div>
            <button onClick={() => setThemeMode(m => m === 'dark' ? 'light' : 'dark')} style={{ padding: '6px 12px', borderRadius: '6px', border: `1px solid ${theme.border}`, background: 'transparent', color: theme.gray, fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {themeMode === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>

          {/* Desktop sidebar meta */}
          <div className="portal-sidebar-meta" style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '20px', marginTop: '16px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '3px', color: theme.gray, textTransform: 'uppercase', marginBottom: '8px' }}>Your Access</div>
            <div style={{ fontSize: '12px', color: theme.gray, lineHeight: '1.6' }}>
              {config.clientName}<br />{config.company}<br /><span style={{ color: accent }}>{config.agentLabel}</span>
            </div>
          </div>
          <div className="portal-sidebar-meta" style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '16px', marginTop: '16px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '3px', color: theme.gray, textTransform: 'uppercase', marginBottom: '8px' }}>Text Size</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['sm', 'md', 'lg'] as const).map(s => (
                <button key={s} onClick={() => setTextSize(s)} style={{ flex: 1, padding: '6px 0', borderRadius: '6px', border: `1px solid ${textSize === s ? accent : theme.border}`, background: textSize === s ? `${accent}15` : 'transparent', color: textSize === s ? accent : theme.gray, fontFamily: 'inherit', cursor: 'pointer', fontSize: s === 'sm' ? '11px' : s === 'md' ? '13px' : '15px', fontWeight: 700 }}>A</button>
              ))}
            </div>
          </div>
          <div className="portal-sidebar-meta" style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '16px', marginTop: '12px' }}>
            <button onClick={() => setThemeMode(m => m === 'dark' ? 'light' : 'dark')} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${theme.border}`, background: 'transparent', color: theme.gray, fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              {themeMode === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="portal-main" style={{ flex: 1, padding: '40px 48px', overflow: 'hidden' }}>
          {section === 'welcome' && <WelcomeSection config={config} accent={accent} intakeSaved={intakeSaved} onNavigate={setSection} tv={tv} />}
          {section === 'about' && <AboutSection config={config} accent={accent} tv={tv} />}
          {section === 'intake' && !intakeSaved && <IntakeSection config={config} accent={accent} fields={fields} setFields={setFields} onSave={handleSaveIntake} tv={tv} />}
          {/* Keep ChatSection mounted once visited so history survives tab switches */}
          <div style={{ display: section === 'chat' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
            <ChatSection config={config} accent={accent} savedContext={intakeSaved ? savedContext : null} fields={intakeSaved ? fields : null} fontSize={FONT_SIZE[textSize]} themeMode={themeMode} tv={tv} preloadedHistory={preloadedHistory} />
          </div>
          {enableDocuments && section === 'documents' && (
            <DocumentsSection config={config} accent={accent} themeMode={themeMode} fontSize={FONT_SIZE[textSize]} tv={tv} />
          )}
        </div>
      </div>
    </div>
  )
}
