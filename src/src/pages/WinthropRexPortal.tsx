import { useState, useRef, useEffect } from 'react'

const PIN = '4321'

const GOLD   = '#E8B84B'
const GREEN  = '#10B981'   // CRE accent — Rex green
const BG     = '#0A0A0A'
const SURFACE  = '#111111'
const BORDER   = '#1F1F1F'
const GRAY     = '#6B7280'
const LIGHT_GRAY = '#9CA3AF'

type Section = 'welcome' | 'asgstory' | 'aboutyou' | 'chat'

interface IntakeForm {
  dealVolume: string
  docPain: string
  dealTypes: string[]
  currentTools: string
  notes: string
}

const NAV_ITEMS: { id: Section; label: string; icon: string; tag?: string }[] = [
  { id: 'welcome',  label: 'Welcome',       icon: '👋' },
  { id: 'asgstory', label: 'About Rex',     icon: '⚡' },
  { id: 'aboutyou', label: 'Your Practice', icon: '🏢' },
  { id: 'chat',     label: 'Chat with Rex', icon: '💬', tag: 'Live' },
]

export default function WinthropRexPortal() {
  const [unlocked, setUnlocked]     = useState(false)
  const [digits, setDigits]         = useState(['', '', '', ''])
  const [pinError, setPinError]     = useState(false)
  const [activeSection, setActiveSection] = useState<Section>('welcome')
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [intakeForm, setIntakeForm] = useState<IntakeForm>({
    dealVolume: '',
    docPain: 'Lease review and LOI drafting — too much time on the first pass',
    dealTypes: ['Office Leases', 'Industrial Leases', 'PSA / Acquisition'],
    currentTools: '',
    notes: 'Commercial real estate brokerage and acquisitions. VP at Winthrop Realty Group, Houston TX. Law background — South Texas College of Law. $25M+ in acquisitions, 2.5M+ sq ft transacted across office, industrial, retail, multifamily, and land. Current client mix includes publicly traded REITs, national private companies, law firms, and institutional developers.',
  })
  const [intakeSaved, setIntakeSaved] = useState(false)

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
      setDigits(prev => { const n = [...prev]; n[i - 1] = ''; return n })
    }
  }

  function checkPin(d = digits) {
    if (d.join('') === PIN) {
      setUnlocked(true)
    } else {
      setPinError(true)
      setDigits(['', '', '', ''])
      setTimeout(() => { document.getElementById('pin-0')?.focus() }, 80)
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (text.length === 4) {
      const arr = text.split('')
      setDigits(arr)
      setTimeout(() => checkPin(arr), 80)
    }
  }

  if (!unlocked) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <div style={{ textAlign: 'center', maxWidth: '360px', padding: '0 24px' }}>
          <div style={{ fontSize: '13px', letterSpacing: '4px', textTransform: 'uppercase', color: GREEN, fontWeight: 700, marginBottom: '12px' }}>
            AxiomStream Group
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, marginBottom: '6px', letterSpacing: '-0.5px' }}>Blake Warren</div>
          <div style={{ fontSize: '14px', color: GRAY, marginBottom: '40px' }}>Winthrop Realty Group · Private Access</div>

          <div style={{ fontSize: '13px', color: GRAY, marginBottom: '20px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Enter access code
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
            {digits.map((d, i) => (
              <input
                key={i}
                id={`pin-${i}`}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={d}
                autoFocus={i === 0}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                style={{
                  width: '56px', height: '64px', textAlign: 'center', fontSize: '24px', fontWeight: 800,
                  background: SURFACE, border: `2px solid ${pinError ? '#EF4444' : d ? GREEN : BORDER}`,
                  borderRadius: '10px', color: '#FAFAFA', fontFamily: "'Inter', sans-serif", outline: 'none',
                  transition: 'border-color 0.15s',
                }}
              />
            ))}
          </div>
          {pinError && (
            <div style={{ color: '#EF4444', fontSize: '13px', marginBottom: '16px', animation: 'shake 0.3s ease' }}>
              Incorrect code — try again
            </div>
          )}
          <div style={{ fontSize: '12px', color: '#333', marginTop: '32px' }}>
            Secured by AxiomStream Group
          </div>
        </div>
        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Mobile header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, background: BG, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: '11px', letterSpacing: '3px', color: GREEN, textTransform: 'uppercase', fontWeight: 700 }}>AxiomStream Group</div>
          <div style={{ fontSize: '15px', fontWeight: 800 }}>Blake Warren · Rex</div>
        </div>
        <button onClick={() => setSidebarOpen(v => !v)} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '8px 12px', color: '#FAFAFA', fontSize: '18px', cursor: 'pointer' }}>
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
        {/* Sidebar */}
        <div style={{
          width: '240px', flexShrink: 0, borderRight: `1px solid ${BORDER}`,
          padding: '24px 16px', position: 'sticky', top: '60px', height: 'calc(100vh - 60px)',
          overflowY: 'auto',
          display: sidebarOpen ? 'block' : 'none',
          position: 'fixed' as any, top: '60px', left: 0, zIndex: 99, background: BG,
        }}>
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '3px', color: GRAY, textTransform: 'uppercase', marginBottom: '8px' }}>Navigation</div>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setSidebarOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left',
                  padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: activeSection === item.id ? `${GREEN}15` : 'transparent',
                  color: activeSection === item.id ? GREEN : GRAY,
                  fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: activeSection === item.id ? 700 : 400,
                  marginBottom: '2px', transition: 'all 0.15s',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.tag && (
                  <span style={{ marginLeft: 'auto', fontSize: '10px', background: `${GREEN}20`, color: GREEN, padding: '2px 7px', borderRadius: '10px', fontWeight: 700 }}>
                    {item.tag}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '20px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '3px', color: GRAY, textTransform: 'uppercase', marginBottom: '8px' }}>Your Instance</div>
            <div style={{ fontSize: '12px', color: GRAY, lineHeight: '1.6' }}>
              Blake Warren<br />
              Winthrop Realty Group<br />
              <span style={{ color: GREEN }}>Rex — CRE Edition</span>
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div style={{ width: '240px', flexShrink: 0, borderRight: `1px solid ${BORDER}`, padding: '32px 16px', position: 'sticky', top: '60px', height: 'calc(100vh - 60px)', overflowY: 'auto', display: 'block' }}>
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '3px', color: GRAY, textTransform: 'uppercase', marginBottom: '8px' }}>Navigation</div>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left',
                  padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: activeSection === item.id ? `${GREEN}15` : 'transparent',
                  color: activeSection === item.id ? GREEN : GRAY,
                  fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: activeSection === item.id ? 700 : 400,
                  marginBottom: '2px', transition: 'all 0.15s',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.tag && (
                  <span style={{ marginLeft: 'auto', fontSize: '10px', background: `${GREEN}20`, color: GREEN, padding: '2px 7px', borderRadius: '10px', fontWeight: 700 }}>
                    {item.tag}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '20px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '3px', color: GRAY, textTransform: 'uppercase', marginBottom: '8px' }}>Your Instance</div>
            <div style={{ fontSize: '12px', color: GRAY, lineHeight: '1.6' }}>
              Blake Warren<br />
              Winthrop Realty Group<br />
              <span style={{ color: GREEN }}>Rex — CRE Edition</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '40px 48px', maxWidth: '900px', overflow: 'hidden' }}>
          {activeSection === 'welcome'  && <WelcomeSection onNavigate={setActiveSection} />}
          {activeSection === 'asgstory' && <AboutRexSection />}
          {activeSection === 'aboutyou' && (
            <AboutYouSection
              form={intakeForm}
              setForm={setIntakeForm}
              saved={intakeSaved}
              setSaved={setIntakeSaved}
              onNavigate={setActiveSection}
            />
          )}
          {activeSection === 'chat' && (
            <BlakeChatSection intake={intakeSaved ? intakeForm : null} />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── WELCOME ─────────────────────────────────────────────────────────────────

function WelcomeSection({ onNavigate }: { onNavigate: (s: Section) => void }) {
  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: GREEN, fontWeight: 700, marginBottom: '16px' }}>
        Private Access · Winthrop Realty Group
      </div>
      <h1 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '8px', lineHeight: '1.0' }}>
        Hey Blake.
      </h1>
      <h2 style={{ fontSize: '28px', fontWeight: 700, color: GRAY, letterSpacing: '-0.5px', marginBottom: '28px' }}>
        This is Rex.
      </h2>

      <p style={{ fontSize: '16px', color: LIGHT_GRAY, lineHeight: '1.75', marginBottom: '16px' }}>
        Rex is a CRE-specific AI built by AxiomStream Group — trained for commercial real estate transactions. Copy clause language from a lease, LOI, PSA, or NDA and paste it into the chat. Rex reads it, tells you what it means, and flags what's non-standard. The kind of first-pass document work that eats hours of your week.
      </p>
      <p style={{ fontSize: '16px', color: LIGHT_GRAY, lineHeight: '1.75', marginBottom: '32px' }}>
        It has deep legal understanding — not just pattern matching. It knows what provisions matter in an office versus industrial lease, what's standard and what's not, and where the exposure lives in a PSA. Your law background means you'll know immediately when it's right.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '36px' }}>
        {[
          { label: 'Clause Analysis',        icon: '📋', sub: "Paste any clause — Rex reads it, explains what it means, and flags what's non-standard" },
          { label: 'LOI Drafting',          icon: '✍️',  sub: 'Structure any offer from a conversation — office, industrial, retail, multifamily' },
          { label: 'PSA / Deal Review',      icon: '🔍', sub: 'Paste rep and warranty language or deal terms — Rex flags exposure and missing protections' },
          { label: 'Commission Agreements', icon: '🤝', sub: 'Review or draft co-brokerage agreements, referral splits, exclusivity terms' },
        ].map(c => (
          <div
            key={c.label}
            style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '18px' }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{c.icon}</div>
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px', color: '#FAFAFA' }}>{c.label}</div>
            <div style={{ fontSize: '13px', color: GRAY, lineHeight: '1.5' }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: `${GREEN}08`, border: `1px solid ${GREEN}25`, borderRadius: '10px', padding: '20px 24px', marginBottom: '32px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: GREEN, marginBottom: '8px' }}>
          Your Context
        </div>
        <div style={{ fontSize: '13px', color: LIGHT_GRAY, lineHeight: '1.7' }}>
          VP at Winthrop Realty Group · Houston, TX · South Texas College of Law · $25M+ in acquisitions · 2.5M+ sq ft across office, industrial, retail, multifamily, and land · Clients include publicly traded REITs, national companies, law firms, and institutional developers.
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => onNavigate('chat')}
          style={{
            background: GREEN, color: BG, border: 'none', borderRadius: '10px',
            padding: '16px 28px', fontSize: '15px', fontWeight: 800,
            cursor: 'pointer', fontFamily: "'Inter', sans-serif", letterSpacing: '0.3px',
          }}
        >
          Chat with Rex →
        </button>
        <button
          onClick={() => onNavigate('aboutyou')}
          style={{
            background: SURFACE, color: LIGHT_GRAY, border: `1px solid ${BORDER}`, borderRadius: '10px',
            padding: '16px 28px', fontSize: '15px', fontWeight: 600,
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
          }}
        >
          Add Your Context
        </button>
      </div>
    </div>
  )
}

// ─── ABOUT REX ───────────────────────────────────────────────────────────────

function AboutRexSection() {
  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: GREEN, fontWeight: 700, marginBottom: '16px' }}>
        The Technology
      </div>
      <h2 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '16px', lineHeight: '1.1' }}>
        Rex — Built for CRE
      </h2>
      <p style={{ fontSize: '16px', color: LIGHT_GRAY, lineHeight: '1.75', marginBottom: '28px' }}>
        Rex is not a general-purpose AI. It's configured specifically for commercial real estate professionals — the workflows, the document types, the legal standards, and the deal patterns you work with every day.
      </p>

      {[
        {
          icon: '⚖️',
          title: 'Deep Legal Understanding',
          body: 'Rex was built with CRE legal workflows at the core. It understands lease structure — base rent, NNN vs. gross, CAM reconciliation, rent escalation mechanics, co-tenancy provisions, exclusivity clauses, SNDA requirements, subordination, and go-dark protections. On the acquisition side: representations and warranties, due diligence contingencies, closing conditions, assignment rights, and indemnification. It knows what\'s standard. It knows what\'s not.',
        },
        {
          icon: '⚡',
          title: 'It Works While You\'re on the Phone',
          body: 'Drop in a lease. Rex extracts the key provisions, flags non-standard terms, and surfaces the questions you\'d ask anyway — in the time it takes you to dial into the next call. The first pass is done before you open the document yourself.',
        },
        {
          icon: '🎯',
          title: 'Configured for Your Practice',
          body: 'The context you add about Winthrop — your deal mix, your client types, your standard terms — gets loaded into every Rex conversation. It\'s not generic advice. It\'s advice calibrated to how Winthrop operates.',
        },
        {
          icon: '🏗️',
          title: 'The ASG Model',
          body: 'AxiomStream Group builds purpose-specific AI for professionals. Not a platform. Not a chatbot layer on top of generic tools. A tool built for one practice, configured for one team, that gets more useful the longer you use it. Rex for CRE is the same model we\'ve deployed in tax, legal, and enterprise sales.',
        },
      ].map((b, i) => (
        <div key={i} style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', padding: '22px 0', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: '26px', flexShrink: 0 }}>{b.icon}</div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{b.title}</div>
            <div style={{ fontSize: '14px', color: GRAY, lineHeight: '1.75' }}>{b.body}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── ABOUT YOU ───────────────────────────────────────────────────────────────

function AboutYouSection({ form, setForm, saved, setSaved, onNavigate }: {
  form: IntakeForm
  setForm: (f: IntakeForm) => void
  saved: boolean
  setSaved: (v: boolean) => void
  onNavigate: (s: Section) => void
}) {
  function toggle(arr: string[], val: string) {
    return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
  }

  if (saved) {
    return (
      <div style={{ maxWidth: '560px', textAlign: 'center', paddingTop: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
        <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '12px' }}>Got it, Blake.</h2>
        <p style={{ fontSize: '16px', color: LIGHT_GRAY, lineHeight: '1.7', marginBottom: '28px' }}>
          Your context is saved. Rex now knows your deal mix, your document pain points, and how Winthrop operates. Every conversation starts from there.
        </p>
        <button
          onClick={() => onNavigate('chat')}
          style={{
            background: GREEN, color: BG, border: 'none', borderRadius: '10px',
            padding: '15px 32px', fontSize: '15px', fontWeight: 700,
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
          }}
        >
          Chat with Rex →
        </button>
      </div>
    )
  }

  const labelStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: GRAY, display: 'block', marginBottom: '10px' }
  const inputStyle: React.CSSProperties = { width: '100%', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '12px 16px', fontSize: '14px', color: '#FAFAFA', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box' as const }
  const chipStyle = (active: boolean): React.CSSProperties => ({
    background: active ? `${GREEN}20` : SURFACE, border: `1px solid ${active ? GREEN : BORDER}`,
    borderRadius: '20px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer',
    color: active ? GREEN : GRAY, fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
  })

  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: '#A78BFA', fontWeight: 700, marginBottom: '16px' }}>
        Quick Context — 2 Minutes
      </div>
      <h2 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '12px', lineHeight: '1.1' }}>
        Tell Us About<br />Your Practice
      </h2>
      <p style={{ fontSize: '15px', color: LIGHT_GRAY, lineHeight: '1.7', marginBottom: '28px' }}>
        We've pre-loaded what we already know about Winthrop and your background. Review it, correct anything off, and add what only you know. The more accurate this is, the more specifically Rex speaks to your deals.
      </p>

      <form onSubmit={e => { e.preventDefault(); setSaved(true) }} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

        <div>
          <label style={labelStyle}>Typical deal volume — roughly how many transactions per year?</label>
          <input
            type="text"
            placeholder="e.g. 20–30 deals, $50M+ volume"
            value={form.dealVolume}
            onChange={e => setForm({ ...form, dealVolume: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Where does document review eat the most time?</label>
          <input
            type="text"
            placeholder="Lease review, PSA red-lining, LOI drafting..."
            value={form.docPain}
            onChange={e => setForm({ ...form, docPain: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Deal types you work most (select all that apply)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['Office Leases', 'Industrial Leases', 'Retail Leases', 'Multifamily', 'PSA / Acquisition', 'Land', 'Investment / Disposition', 'Tenant Rep'].map(v => (
              <button key={v} type="button" style={chipStyle(form.dealTypes.includes(v))} onClick={() => setForm({ ...form, dealTypes: toggle(form.dealTypes, v) })}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Current tools you use for document review or deal management</label>
          <input
            type="text"
            placeholder="CoStar, DocuSign, CRE-specific software, none..."
            value={form.currentTools}
            onChange={e => setForm({ ...form, currentTools: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Anything else about Winthrop or how you work?</label>
          <textarea
            placeholder="Client mix, standard deal structures, what makes your practice different..."
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' as const }}
          />
        </div>

        <button
          type="submit"
          style={{
            background: '#A78BFA', color: BG, border: 'none', borderRadius: '10px',
            padding: '15px 28px', fontSize: '15px', fontWeight: 700,
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
          }}
        >
          Save My Context →
        </button>
      </form>
    </div>
  )
}

// ─── CHAT WITH REX ───────────────────────────────────────────────────────────

interface ChatMessage { role: 'user' | 'assistant'; content: string }

const PORTAL_SLUG = 'blake'

async function persistMessages(msgs: ChatMessage[]) {
  try {
    const last = msgs.slice(-2)
    for (const m of last) {
      await fetch(`/api/portal-chat-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: PORTAL_SLUG, role: m.role, content: m.content }),
      })
    }
  } catch { /* non-critical */ }
}

async function loadPersistedHistory(): Promise<ChatMessage[]> {
  try {
    const res = await fetch(`/api/portal-chat-history?slug=${PORTAL_SLUG}`)
    if (!res.ok) return []
    const data = await res.json()
    return (data.messages || []).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))
  } catch { return [] }
}

function BlakeChatSection({ intake }: { intake: IntakeForm | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const intakeContext = intake ? `\n\n## Blake's Practice Context (from intake)\nDeal volume: ${intake.dealVolume || 'not specified'}\nDocument pain: ${intake.docPain}\nDeal types: ${intake.dealTypes.join(', ')}\nCurrent tools: ${intake.currentTools || 'not specified'}\nNotes: ${intake.notes}` : ''

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  useEffect(() => {
    loadPersistedHistory().then(history => {
      if (history.length > 0) {
        setMessages(history)
      } else {
        setMessages([{
          role: 'assistant',
          content: intake
            ? "Hey Blake — your context is loaded. I know your deal mix and where the document work piles up. What are you working on?"
            : "Hey Blake — I'm Rex. I've been briefed on Winthrop and your background. What are you working on right now?",
        }])
      }
      setHistoryLoaded(true)
    })
  }, [])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    // Inject immediate status so user knows Rex is working — search queries take 4-8s
    const SEARCHING_PLACEHOLDER = '⚡ Searching live data sources...'
    const searchingId = Date.now()
    setMessages(prev => [...prev, { role: 'assistant' as const, content: SEARCHING_PLACEHOLDER, _id: searchingId } as typeof prev[0]])

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: 'rex',
          message: userMsg,
          history,
          slug: 'blake',
          teamMember: 'Blake Warren',
          isLead: true,
          extraContext: intakeContext,
        }),
      })
      const data = await res.json()
      const reply = data.reply || data.text || data.message || 'Something went wrong — try again.'
      setMessages(prev => {
        // Replace the searching placeholder with the real response
        const without = prev.filter((m: {role: string; content: string; _id?: number}) => m._id !== searchingId)
        const updated = [...without, { role: 'assistant' as const, content: reply }]
        persistMessages(updated)
        return updated
      })
    } catch {
      setMessages(prev => {
        const without = prev.filter((m: {role: string; content: string; _id?: number}) => m._id !== searchingId)
        return [...without, { role: 'assistant', content: 'Connection issue. Check your internet and try again.' }]
      })
    }
    setLoading(false)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', minHeight: '500px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: GREEN, fontWeight: 700, marginBottom: '8px' }}>
          Your CRE Instance
        </div>
        <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '8px' }}>
          Chat with Rex
        </h2>
        <p style={{ fontSize: '14px', color: GRAY, lineHeight: '1.6' }}>
          Winthrop context loaded. Paste a clause, describe a deal, or ask anything.
          {intake && <span style={{ color: GREEN }}> Practice context saved ✓</span>}
        </p>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', background: SURFACE, border: `1px solid ${BORDER}`,
        borderRadius: '12px 12px 0 0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
              background: m.role === 'user' ? '#1e3a5f' : `${GREEN}20`,
              border: `1px solid ${m.role === 'user' ? '#2563eb40' : GREEN + '40'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 800, color: m.role === 'user' ? '#60a5fa' : GREEN,
            }}>
              {m.role === 'user' ? 'B' : 'R'}
            </div>
            <div style={{
              maxWidth: '80%', background: m.role === 'user' ? '#1e3a5f' : '#161616',
              border: `1px solid ${m.role === 'user' ? '#2563eb30' : BORDER}`,
              borderRadius: '10px', padding: '12px 16px',
              fontSize: '14px', color: '#FAFAFA', lineHeight: '1.7', whiteSpace: 'pre-wrap',
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `${GREEN}20`, border: `1px solid ${GREEN}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: GREEN }}>R</div>
            <div style={{ background: '#161616', border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '12px 16px' }}>
              <span style={{ display: 'inline-flex', gap: '4px' }}>
                {[0,1,2].map(i => (
                  <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: GREEN, opacity: 0.5, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{
        background: SURFACE, border: `1px solid ${BORDER}`, borderTop: 'none',
        borderRadius: '0 0 12px 12px', padding: '12px',
        display: 'flex', gap: '10px', alignItems: 'flex-end',
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Paste a clause, describe a deal, ask anything about a transaction..."
          rows={2}
          style={{
            flex: 1, background: '#0d0d0d', border: `1px solid ${BORDER}`,
            borderRadius: '8px', padding: '10px 14px', fontSize: '14px',
            color: '#FAFAFA', fontFamily: "'Inter', sans-serif", outline: 'none',
            resize: 'none', lineHeight: '1.5',
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          style={{
            width: '40px', height: '40px', borderRadius: '50%', background: GREEN,
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0, opacity: (!input.trim() || loading) ? 0.4 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <span style={{ fontSize: '16px', color: BG, fontWeight: 900 }}>↑</span>
        </button>
      </div>

      <div style={{ marginTop: '8px', fontSize: '11px', color: '#333', textAlign: 'center' }}>
        Powered by AxiomStream Group · Built for Winthrop Realty Group
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.8);opacity:0.4}40%{transform:scale(1.1);opacity:1}}`}</style>
    </div>
  )
}
