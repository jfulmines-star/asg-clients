import { useState, useRef, useEffect } from 'react'

interface AppShellProps {
  slug: string
  pin: string
  rep: string
  territory: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  _id?: number
}

interface DocFile {
  name: string
  size: number
  uploadedAt: string
  content: string
  mimeType: string
}

const PORTAL_META: Record<string, { chatGreeting: (s: boolean) => string; chatPlaceholder: string; memberName: string }> = {
  andrew: {
    memberName: 'Andy Parks',
    chatPlaceholder: 'Pipeline, capture strategy, account targeting, outreach — what are we working on?',
    chatGreeting: (saved) => saved
      ? "Andy — context loaded. What's the priority today?"
      : "Andy — I've been briefed on Shield, the Envelop line, and your government and commercial pipeline. Where do you want to start — pipeline hygiene, capture strategy, or the Southwest play?",
  },
  ryanh: {
    memberName: 'Ryan Hopper',
    chatPlaceholder: 'Southwest pipeline, Navy/USCG capture, MRO accounts — what are we working on?',
    chatGreeting: (saved) => saved
      ? "Ryan — context loaded. What's the priority today?"
      : "Ryan — I'm briefed on your territory: Navy buying commands, Coast Guard, and the depot pipeline. What are we working on?",
  },
}

const UPSTASH_URL = 'https://renewed-macaw-61269.upstash.io'
const UPSTASH_TOKEN = 'Ae9VAAIncDIzYWNmNzg3NGJjMDE0ZWFmYThmNWM2YzM4MzE5NTRjNHAyNjEyNjk'

async function upstashLrange(key: string): Promise<string[]> {
  try {
    const res = await fetch(`${UPSTASH_URL}/lrange/${key}/0/49`, { headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` } })
    const d = await res.json()
    return Array.isArray(d.result) ? d.result : []
  } catch { return [] }
}

async function upstashRpush(key: string, value: string): Promise<void> {
  try {
    await fetch(`${UPSTASH_URL}/rpush/${key}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([value]),
    })
  } catch { /**/ }
}

function MsgContent({ content, light }: { content: string; light?: boolean }) {
  const parts = content.split(/(\*\*[^*]+\*\*|`[^`]+`|\n)/g)
  return (
    <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>
        if (p.startsWith('`') && p.endsWith('`')) return <code key={i} style={{ background: light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)', padding: '1px 5px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.9em' }}>{p.slice(1, -1)}</code>
        if (p === '\n') return <br key={i} />
        return <span key={i}>{p}</span>
      })}
    </span>
  )
}

function ShieldIcon({ size = 18, color = '#4ADE80' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6L12 2z" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function UploadIcon({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  )
}

function FileIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}

function getColors(light: boolean) {
  return light
    ? { bg: '#f8fafc', sidebar: '#f1f5f9', surface: '#ffffff', text: '#0f172a', muted: '#64748b', border: 'rgba(0,0,0,0.09)', inputBg: '#F9FAFB' }
    : { bg: '#0a0f1e', sidebar: '#0d1428', surface: '#111827', text: '#f8fafc', muted: '#94a3b8', border: 'rgba(255,255,255,0.08)', inputBg: '#0d1020' }
}

function formatFileSize(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1048576).toFixed(1)} MB`
}

async function readFileText(file: File): Promise<{ content: string; mimeType: string }> {
  return new Promise(resolve => {
    const reader = new FileReader()
    if (file.type.startsWith('image/')) {
      reader.onload = () => resolve({ content: reader.result as string, mimeType: file.type })
      reader.readAsDataURL(file)
    } else {
      reader.onload = () => resolve({ content: reader.result as string, mimeType: file.type || 'text/plain' })
      reader.readAsText(file)
    }
  })
}

function DocumentsTab({ light, colors }: { light: boolean; colors: ReturnType<typeof getColors> }) {
  const accent = '#4ADE80'
  const [files, setFiles] = useState<DocFile[]>([])
  const [dragging, setDragging] = useState(false)
  const [sel, setSel] = useState<DocFile | null>(null)
  const [docMsgs, setDocMsgs] = useState<ChatMessage[]>([])
  const [docInput, setDocInput] = useState('')
  const [docLoading, setDocLoading] = useState(false)
  const [ik, setIk] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const lastRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (docMsgs.length) lastRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, [docMsgs])

  async function handleFiles(list: FileList) {
    const ok = ['pdf','docx','txt','png','jpg','jpeg']
    for (const f of Array.from(list)) {
      const ext = f.name.split('.').pop()?.toLowerCase() || ''
      if (!ok.includes(ext)) continue
      const { content, mimeType } = await readFileText(f)
      const doc: DocFile = { name: f.name, size: f.size, uploadedAt: new Date().toISOString(), content, mimeType }
      try { sessionStorage.setItem(`rex-doc-${f.name}`, JSON.stringify(doc)) } catch { /**/ }
      setFiles(prev => [...prev.filter(x => x.name !== f.name), doc])
    }
  }

  function openFile(f: DocFile) {
    setSel(f)
    setDocMsgs([{ role: 'assistant', content: `\uD83D\uDCC4 **${f.name}** loaded. What would you like to know about it?` }])
    setDocInput(''); setIk(k => k + 1)
  }

  async function sendDocMsg() {
    if (!docInput.trim() || docLoading || !sel) return
    const text = docInput.trim(); setDocInput(''); setIk(k => k + 1)
    setDocMsgs(prev => [...prev, { role: 'user', content: text }])
    const ts = Date.now()
    setDocMsgs(prev => [...prev, { role: 'assistant', content: '\u26A1 Analyzing document...', _id: ts }])
    setDocLoading(true)
    try {
      const docCtx = sel.mimeType.startsWith('image/')
        ? `[Image: ${sel.name}. Text extraction unavailable.]`
        : `Document: ${sel.name}\n\nContent:\n${sel.content.slice(0, 8000)}`
      const history = docMsgs.filter(m => !m._id).map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: 'rex', message: text, history, slug: 'document-analysis', teamMember: 'Shield Rep', isLead: false, disableTeamContext: true, extraContext: `\n\n## Document Analysis\nUser uploaded a document and is asking questions.\n\n${docCtx}` }),
      })
      const data = await res.json()
      const reply = data.reply || data.text || data.message || 'Something went wrong.'
      setDocMsgs(prev => [...prev.filter(m => m._id !== ts), { role: 'assistant', content: reply }])
    } catch {
      setDocMsgs(prev => [...prev.filter(m => m._id !== ts), { role: 'assistant', content: 'Connection issue. Try again.' }])
    }
    setDocLoading(false)
  }

  const { surface, border, text, muted } = colors

  return (
    <div style={{ display: 'flex', height: '100%', flex: 1, minHeight: 0, overflow: 'hidden', gap: 0 }}>
      <div style={{ width: sel ? '300px' : '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: sel ? '16px' : 0, borderRight: sel ? `1px solid ${border}` : 'none', overflowY: 'auto' }}>
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files) }}
          onClick={() => fileRef.current?.click()}
          style={{ border: `2px dashed ${dragging ? accent : border}`, borderRadius: '12px', padding: '28px 20px', textAlign: 'center', cursor: 'pointer', background: dragging ? `${accent}08` : surface, transition: 'all 0.15s' }}
        >
          <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.txt,.png,.jpg,.jpeg" style={{ display: 'none' }} onChange={e => e.target.files && handleFiles(e.target.files)} />
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}><UploadIcon color={accent} /></div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: text, marginBottom: '4px' }}>Drop files here or click to upload</div>
          <div style={{ fontSize: '12px', color: muted }}>PDF · DOCX · TXT · PNG · JPG</div>
        </div>
        {files.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: muted, marginBottom: '2px' }}>Documents</div>
            {files.map(f => (
              <div key={f.name} onClick={() => openFile(f)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', border: `1px solid ${sel?.name === f.name ? accent + '60' : border}`, background: sel?.name === f.name ? `${accent}08` : surface, cursor: 'pointer', transition: 'all 0.15s' }}>
                <FileIcon color={accent} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                  <div style={{ fontSize: '11px', color: muted }}>{formatFileSize(f.size)} · {new Date(f.uploadedAt).toLocaleDateString()}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); openFile(f) }} style={{ flexShrink: 0, padding: '4px 8px', borderRadius: '6px', border: `1px solid ${accent}40`, background: `${accent}10`, color: accent, fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Ask &rarr;</button>
              </div>
            ))}
          </div>
        )}
        {files.length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: muted, fontSize: '13px', lineHeight: '1.7' }}>Upload a document and Rex will read it.<br />Ask anything about its contents.</div>}
      </div>

      {sel && (
        <div style={{ flex: 1, minWidth: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileIcon color={accent} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sel.name}</div>
              <div style={{ fontSize: '11px', color: muted }}>Ask Rex anything about this document</div>
            </div>
            <button onClick={() => { setSel(null); setDocMsgs([]) }} style={{ padding: '4px 10px', borderRadius: '6px', border: `1px solid ${border}`, background: 'transparent', color: muted, fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>&#x2715;</button>
          </div>
          <div style={{ flex: 1, minHeight: 0, maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', background: surface, border: `1px solid ${border}`, borderRadius: '10px 10px 0 0', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {docMsgs.map((msg, i) => (
              <div key={i} ref={i === docMsgs.length - 1 ? lastRef : undefined} style={{ display: 'flex', gap: '8px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0, background: msg.role === 'user' ? '#1e3a5f' : `${accent}20`, border: `1px solid ${msg.role === 'user' ? '#2563eb40' : accent + '40'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: msg.role === 'user' ? '#60a5fa' : accent }}>{msg.role === 'user' ? 'Y' : 'R'}</div>
                <div style={{ maxWidth: '85%', minWidth: 0, background: msg.role === 'user' ? '#1e3a5f' : (light ? '#F3F4F6' : '#1a2035'), border: `1px solid ${msg.role === 'user' ? '#2563eb30' : border}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: light ? (msg.role === 'user' ? '#fff' : '#111827') : '#f8fafc', lineHeight: '1.7', borderLeft: msg.role === 'assistant' ? `3px solid ${accent}` : undefined }}>
                  <MsgContent content={msg.content} light={light} />
                </div>
              </div>
            ))}
            {docLoading && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: `${accent}20`, border: `1px solid ${accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: accent }}>R</div>
                <div style={{ background: light ? '#F3F4F6' : '#1a2035', border: `1px solid ${border}`, borderRadius: '8px', padding: '10px 14px', borderLeft: `3px solid ${accent}` }}>
                  <span style={{ display: 'inline-flex', gap: '4px' }}>{[0,1,2].map(j => <span key={j} style={{ width: '5px', height: '5px', borderRadius: '50%', background: accent, opacity: 0.5, animation: `rexbounce 1.2s ease-in-out ${j * 0.2}s infinite` }} />)}</span>
                </div>
              </div>
            )}
          </div>
          <div style={{ background: surface, border: `1px solid ${border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '8px', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <textarea key={ik} value={docInput} onChange={e => setDocInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendDocMsg() } }} placeholder="Ask about this document..." rows={2} style={{ flex: 1, background: light ? '#F9FAFB' : '#0d1020', border: `1px solid ${border}`, borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: light ? '#111827' : '#f8fafc', fontFamily: 'inherit', outline: 'none', resize: 'none', lineHeight: '1.5' }} />
            <button onClick={sendDocMsg} disabled={!docInput.trim() || docLoading} style={{ width: '38px', height: '38px', borderRadius: '50%', background: accent, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: !docInput.trim() || docLoading ? 0.4 : 1, transition: 'opacity 0.15s' }}>
              <span style={{ fontSize: '16px', color: '#0a0f1e', fontWeight: 900 }}>&uarr;</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ShieldAppShell({ slug, pin, rep, territory }: AppShellProps) {
  const meta = PORTAL_META[slug] ?? PORTAL_META['andrew']
  const accent = '#4ADE80'

  const [unlocked, setUnlocked] = useState(false)
  const [digits, setDigits] = useState(['', '', '', ''])
  const [pinError, setPinError] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'documents'>('chat')
  const [lightMode, setLightMode] = useState(false)
  const colors = getColors(lightMode)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatReady, setChatReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [inputKey, setInputKey] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastMsgRef = useRef<HTMLDivElement>(null)
  const historyKey = `rex:${slug}`

  useEffect(() => {
    if (!unlocked) return
    async function load() {
      const raw = await upstashLrange(historyKey)
      const parsed: ChatMessage[] = []
      for (const s of raw) {
        try {
          const obj = JSON.parse(s)
          const role = obj.role === 'agent' ? 'assistant' : obj.role
          if (role === 'user' || role === 'assistant') parsed.push({ role, content: obj.content })
        } catch { /**/ }
      }
      if (parsed.length > 0) setMessages(parsed)
      setChatReady(true)
    }
    load()
  }, [unlocked])

  useEffect(() => {
    if (!chatReady) return
    if (messages.length === 0) {
      const greeting: ChatMessage = { role: 'assistant', content: meta.chatGreeting(false) }
      setMessages([greeting])
      void upstashRpush(historyKey, JSON.stringify({ role: 'assistant', content: greeting.content, ts: Date.now() }))
    }
  }, [chatReady])

  useEffect(() => {
    if (!loading && messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      lastMsgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [messages])

  useEffect(() => {
    if (loading) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [loading])

  function handleDigit(i: number, val: string) {
    const d = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]; next[i] = d; setDigits(next); setPinError(false)
    if (d && i < 3) (document.getElementById(`sas-pin-${i + 1}`) as HTMLInputElement)?.focus()
    if (next.every(v => v !== '') && i === 3) setTimeout(() => checkPin(next), 80)
  }
  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      (document.getElementById(`sas-pin-${i - 1}`) as HTMLInputElement)?.focus()
      setDigits(prev => { const n = [...prev]; n[i - 1] = ''; return n })
    }
  }
  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (text.length === 4) { const d = text.split(''); setDigits(d); setTimeout(() => checkPin(d), 80) }
  }
  function checkPin(d = digits) {
    if (d.join('') === pin) setUnlocked(true)
    else { setPinError(true); setDigits(['', '', '', '']); setTimeout(() => (document.getElementById('sas-pin-0') as HTMLInputElement)?.focus(), 80) }
  }

  async function send() {
    if (!input.trim() || loading) return
    const text = input.trim(); setInput(''); setInputKey(k => k + 1)
    setMessages(prev => [...prev, { role: 'user', content: text }])
    void upstashRpush(historyKey, JSON.stringify({ role: 'user', content: text, ts: Date.now(), member: meta.memberName }))
    const ts = Date.now()
    setMessages(prev => [...prev, { role: 'assistant', content: '\u26A1 Searching live data sources...', _id: ts }])
    setLoading(true)
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: 'rex', message: text, history, slug, teamMember: meta.memberName, isLead: false, extraContext: '', disableTeamContext: false }),
      })
      const data = await res.json()
      const reply = data.reply || data.text || data.message || 'Something went wrong.'
      void upstashRpush(historyKey, JSON.stringify({ role: 'assistant', content: reply, ts: Date.now() }))
      setMessages(prev => [...prev.filter(m => m._id !== ts), { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev.filter(m => m._id !== ts), { role: 'assistant', content: 'Connection issue. Try again.' }])
    }
    setLoading(false)
  }

  const { bg, sidebar, surface, border, text: textColor, muted, inputBg } = colors

  if (!unlocked) {
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', -apple-system, sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <style>{`html,body,#root{background:${bg};margin:0;padding:0;}`}</style>
        <div style={{ textAlign: 'center', maxWidth: '360px', padding: '0 24px', width: '100%' }}>
          {/* REX wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
            <ShieldIcon size={22} color={accent} />
            <span style={{ fontSize: '28px', fontWeight: 900, color: accent, letterSpacing: '-1px' }}>REX</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: textColor, marginBottom: '4px' }}>{rep}</div>
          <div style={{ fontSize: '13px', color: muted, marginBottom: '40px' }}>Shield Technologies · Private Access</div>
          <div style={{ fontSize: '12px', color: muted, marginBottom: '20px', letterSpacing: '2px', textTransform: 'uppercase' }}>Enter access code</div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
            {digits.map((d, i) => (
              <input
                key={i} id={`sas-pin-${i}`} type="tel" inputMode="numeric" maxLength={1} value={d}
                autoFocus={i === 0}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                style={{ width: '56px', height: '64px', textAlign: 'center', fontSize: '24px', fontWeight: 800, background: surface, border: `2px solid ${pinError ? '#EF4444' : d ? accent : border}`, borderRadius: '10px', color: textColor, fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.15s' }}
              />
            ))}
          </div>
          {pinError && <div style={{ color: '#EF4444', fontSize: '13px', marginBottom: '16px' }}>Incorrect code — try again</div>}
          <div style={{ fontSize: '11px', color: muted, marginTop: '32px' }}>Secured by AxiomStream Group</div>
        </div>
      </div>
    )
  }

  const navItems = [
    { id: 'chat' as const, label: 'Chat', icon: '💬' },
    { id: 'documents' as const, label: 'Documents', icon: '📁' },
  ]

  return (
    <div style={{ minHeight: '100vh', height: '100vh', background: bg, color: textColor, fontFamily: "'Inter', -apple-system, sans-serif", display: 'flex', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        html,body,#root{background:${bg};margin:0;padding:0;height:100%;}
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${accent}40;border-radius:4px;}
        @keyframes rexbounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
        textarea:focus{border-color:${accent}!important;outline:none!important;box-shadow:0 0 0 2px ${accent}20!important;}
        input:focus{outline:none!important;}
      `}</style>

      {/* Sidebar */}
      <div style={{ width: '220px', flexShrink: 0, background: sidebar, borderRight: `1px solid ${border}`, display: 'flex', flexDirection: 'column', padding: '20px 0' }}>
        {/* Logo */}
        <div style={{ padding: '0 18px 20px', borderBottom: `1px solid ${border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <ShieldIcon size={18} color={accent} />
            <span style={{ fontSize: '20px', fontWeight: 900, color: accent, letterSpacing: '-0.5px' }}>REX</span>
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: textColor }}>{rep}</div>
          <div style={{ fontSize: '11px', color: muted, marginTop: '1px' }}>Shield Technologies</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '8px', border: 'none', background: activeTab === item.id ? `${accent}18` : 'transparent', color: activeTab === item.id ? accent : muted, fontSize: '13px', fontWeight: activeTab === item.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', marginBottom: '2px', textAlign: 'left' }}>
              <span style={{ fontSize: '15px' }}>{item.icon}</span>
              {item.label}
              {activeTab === item.id && <span style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', background: accent }} />}
            </button>
          ))}
        </nav>

        {/* Territory */}
        <div style={{ padding: '12px 18px', borderTop: `1px solid ${border}`, marginBottom: '8px' }}>
          <div style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: muted, marginBottom: '4px' }}>Territory</div>
          <div style={{ fontSize: '11px', color: textColor, lineHeight: '1.5' }}>{territory}</div>
        </div>

        {/* Light/Dark toggle */}
        <div style={{ padding: '8px 18px' }}>
          <button onClick={() => setLightMode(m => !m)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: `1px solid ${border}`, borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', color: muted, fontSize: '12px', fontFamily: 'inherit', width: '100%', transition: 'all 0.15s' }}>
            <span style={{ fontSize: '14px' }}>{lightMode ? '🌙' : '☀️'}</span>
            {lightMode ? 'Dark mode' : 'Light mode'}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, background: surface }}>
          <span style={{ fontSize: '16px' }}>{navItems.find(n => n.id === activeTab)?.icon}</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: textColor }}>{navItems.find(n => n.id === activeTab)?.label}</div>
            <div style={{ fontSize: '11px', color: muted }}>{activeTab === 'chat' ? 'Rex — your sales AI' : 'Upload documents · Ask Rex anything'}</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e80' }} />
            <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600 }}>Live</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: activeTab === 'documents' ? '16px' : '0' }}>
          {activeTab === 'chat' ? (
            <>
              {/* Messages */}
              <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px' }}>
                {messages.map((msg, i) => (
                  <div key={i} ref={i === messages.length - 1 ? lastMsgRef : undefined} style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, background: msg.role === 'user' ? '#1e3a5f' : `${accent}20`, border: `1.5px solid ${msg.role === 'user' ? '#2563eb50' : accent + '50'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: msg.role === 'user' ? '#93c5fd' : accent }}>
                      {msg.role === 'user' ? rep[0].toUpperCase() : <ShieldIcon size={14} color={accent} />}
                    </div>
                    <div style={{ maxWidth: '72%', minWidth: 0, background: msg.role === 'user' ? (lightMode ? '#1e40af' : '#1e3a5f') : surface, border: `1px solid ${msg.role === 'user' ? '#2563eb30' : border}`, borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px', padding: '11px 16px', fontSize: '13.5px', color: msg.role === 'user' ? '#e0f2fe' : textColor, lineHeight: '1.75', borderLeft: msg.role === 'assistant' ? `3px solid ${accent}` : undefined, boxShadow: msg._id ? `0 0 0 1px ${accent}30` : undefined }}>
                      {msg._id
                        ? <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>{[0,1,2].map(j => <span key={j} style={{ width: '5px', height: '5px', borderRadius: '50%', background: accent, opacity: 0.6, animation: `rexbounce 1.2s ease-in-out ${j * 0.2}s infinite` }} />)}</span>
                        : <MsgContent content={msg.content} light={lightMode} />
                      }
                    </div>
                  </div>
                ))}
                {loading && !messages.some(m => m._id) && (
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${accent}20`, border: `1.5px solid ${accent}50`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldIcon size={14} color={accent} /></div>
                    <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '4px 14px 14px 14px', padding: '11px 16px', borderLeft: `3px solid ${accent}` }}>
                      <span style={{ display: 'inline-flex', gap: '4px' }}>{[0,1,2].map(j => <span key={j} style={{ width: '5px', height: '5px', borderRadius: '50%', background: accent, opacity: 0.6, animation: `rexbounce 1.2s ease-in-out ${j * 0.2}s infinite` }} />)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div style={{ flexShrink: 0, padding: '12px 16px', borderTop: `1px solid ${border}`, background: surface, display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <textarea
                  key={inputKey} value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                  placeholder={meta.chatPlaceholder}
                  rows={2}
                  style={{ flex: 1, background: inputBg, border: `1.5px solid ${border}`, borderRadius: '10px', padding: '10px 14px', fontSize: '13.5px', color: textColor, fontFamily: 'inherit', resize: 'none', lineHeight: '1.55', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || loading}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', background: accent, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: !input.trim() || loading ? 0.35 : 1, transition: 'opacity 0.15s, transform 0.1s', boxShadow: `0 2px 12px ${accent}40` }}
                >
                  <span style={{ fontSize: '18px', color: '#0a0f1e', fontWeight: 900, lineHeight: 1 }}>↑</span>
                </button>
              </div>
            </>
          ) : (
            <DocumentsTab light={lightMode} colors={colors} />
          )}
        </div>
      </div>
    </div>
  )
}
