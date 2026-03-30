import { useState, useRef, useEffect } from 'react'

const PIN = '2010'

const PURPLE = '#7C3AED'
const TEAL = '#27B5A3'
const BG = '#0A0A0A'
const SURFACE = '#111111'
const BORDER = '#1F1F1F'
const GRAY = '#6B7280'
const LIGHT_GRAY = '#9CA3AF'

type Section = 'welcome' | 'ventures' | 'asg' | 'chat' | 'documents'

const NAV_ITEMS: { id: Section; label: string; icon: string; tag?: string }[] = [
  { id: 'welcome', label: 'Welcome', icon: '👋' },
  { id: 'ventures', label: 'Your Ventures', icon: '🏗️', tag: 'Context' },
  { id: 'asg', label: 'About ASG', icon: '⚡', tag: 'New' },
  { id: 'chat', label: 'Chat with Kit', icon: '💬', tag: 'Live' },
  { id: 'documents', label: 'Documents', icon: '📄' },
]

// ─── CHAT PERSISTENCE ────────────────────────────────────────────────────────

interface ChatMessage { role: 'user' | 'assistant'; content: string }

const ANTTI_SLUG = 'anttip'

async function persistMessages(msgs: ChatMessage[]) {
  try {
    const last = msgs.slice(-2)
    for (const m of last) {
      await fetch(`/api/portal-chat-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: ANTTI_SLUG, role: m.role, content: m.content }),
      })
    }
  } catch { /* non-critical */ }
}

async function loadPersistedHistory(): Promise<ChatMessage[]> {
  try {
    const res = await fetch(`/api/portal-chat-history?slug=${ANTTI_SLUG}`)
    if (!res.ok) return []
    const data = await res.json()
    return (data.messages || []).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))
  } catch { return [] }
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export default function AnttipPortal() {
  const [unlocked, setUnlocked] = useState(false)
  const [digits, setDigits] = useState(['', '', '', ''])
  const [pinError, setPinError] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>('welcome')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleDigit(i: number, val: string) {
    const d = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = d
    setDigits(next)
    setPinError(false)
    if (d && i < 3) {
      const el = document.getElementById(`ap-pin-${i + 1}`)
      if (el) (el as HTMLInputElement).focus()
    }
    if (next.every(v => v !== '') && i === 3) {
      setTimeout(() => checkPin(next), 80)
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      const el = document.getElementById(`ap-pin-${i - 1}`)
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

  function checkPin(d = digits) {
    if (d.join('') === PIN) {
      setUnlocked(true)
    } else {
      setPinError(true)
      setDigits(['', '', '', ''])
      setTimeout(() => {
        const el = document.getElementById('ap-pin-0')
        if (el) (el as HTMLInputElement).focus()
      }, 100)
    }
  }

  if (!unlocked) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Inter', -apple-system, sans-serif" }}>
        <div style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#333', marginBottom: '48px' }}>
            AXIOMSTREAM GROUP
          </div>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '20px', padding: '44px 40px 40px' }}>
            <div style={{ height: '3px', width: '48px', background: PURPLE, borderRadius: '2px', margin: '0 auto 28px' }} />
            <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: PURPLE, fontWeight: 700, marginBottom: '8px' }}>
              BUILT FOR ANTTI PASILA
            </div>
            <div style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '8px', color: '#FAFAFA' }}>
              Antti Pasila
            </div>
            <div style={{ fontSize: '14px', color: GRAY, marginBottom: '36px', lineHeight: '1.5' }}>
              Cyans SEZC<br />
              <span style={{ color: '#444', fontSize: '12px' }}>Anguilla, B.W.I.</span>
            </div>
            <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: '14px' }}>
              Enter Access Code
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  id={`ap-pin-${i}`}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  style={{
                    width: '60px', height: '68px',
                    background: '#161616', border: `1.5px solid ${pinError ? '#ef4444' : d ? `${PURPLE}60` : BORDER}`,
                    borderRadius: '10px', fontSize: '26px', fontWeight: 700,
                    color: '#FAFAFA', textAlign: 'center', outline: 'none',
                    fontFamily: "'Inter', sans-serif",
                    animation: pinError ? 'shake 0.35s ease' : 'none',
                    transition: 'border-color 0.15s',
                  }}
                />
              ))}
            </div>
            {pinError && (
              <div style={{ fontSize: '13px', color: '#ef4444', marginBottom: '16px' }}>
                Incorrect code. Try again.
              </div>
            )}
            <button
              onClick={() => checkPin()}
              disabled={digits.some(d => !d)}
              style={{
                width: '100%', padding: '14px', background: PURPLE, color: '#FAFAFA',
                border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700,
                cursor: 'pointer', fontFamily: "'Inter', sans-serif", opacity: digits.some(d => !d) ? 0.4 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              Unlock →
            </button>
            <div style={{ marginTop: '24px', fontSize: '11px', color: '#333', lineHeight: '1.6' }}>
              Access code provided by AxiomStream Group.<br />
              Questions? <a href="mailto:jfulmines@axiomstreamgroup.com" style={{ color: TEAL, textDecoration: 'none' }}>jfulmines@axiomstreamgroup.com</a>
            </div>
          </div>
        </div>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 60%{transform:translateX(8px)} }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Inter', -apple-system, sans-serif", display: 'flex', flexDirection: 'column' }}>
      {/* Top header */}
      <header style={{
        borderBottom: `1px solid ${BORDER}`, padding: '0 24px', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(10,10,10,0.95)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', color: GRAY, cursor: 'pointer', padding: '4px', fontSize: '18px' }}
            className="ap-mob-toggle"
          >☰</button>
          <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '4px', textTransform: 'uppercase', color: PURPLE }}>
            AXIOM<span style={{ color: GRAY, fontWeight: 400 }}>STREAM GROUP</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: PURPLE }} />
          <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: PURPLE, fontWeight: 700 }}>
            Made for Antti
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{
          width: '220px', flexShrink: 0, borderRight: `1px solid ${BORDER}`,
          padding: '32px 0', background: SURFACE,
          position: 'sticky', top: '56px', height: 'calc(100vh - 56px)', overflowY: 'auto',
        }} className={sidebarOpen ? 'ap-sidebar-open' : ''}>
          <div style={{ padding: '0 20px 16px', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#333', fontWeight: 700 }}>
            Your Portal
          </div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); setSidebarOpen(false) }}
              style={{
                width: '100%', textAlign: 'left', background: activeSection === item.id ? `${PURPLE}08` : 'none',
                border: 'none', padding: '10px 20px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '10px',
                color: activeSection === item.id ? '#FAFAFA' : GRAY,
                fontFamily: "'Inter', sans-serif",
                borderLeft: `3px solid ${activeSection === item.id ? PURPLE : 'transparent'}`,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: activeSection === item.id ? 600 : 400, flex: 1 }}>{item.label}</span>
              {item.tag && (
                <span style={{
                  fontSize: '9px', fontWeight: 700, letterSpacing: '1px',
                  textTransform: 'uppercase', color: TEAL, background: `${TEAL}15`,
                  border: `1px solid ${TEAL}30`, borderRadius: '4px', padding: '2px 6px',
                }}>
                  {item.tag}
                </span>
              )}
            </button>
          ))}
          <div style={{ margin: '24px 20px 0', paddingTop: '20px', borderTop: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: '11px', color: '#333', lineHeight: '1.6' }}>
              March 27, 2026<br />
              <span style={{ color: '#222' }}>Confidential · ASG</span>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '48px 48px 80px' }}>
          {activeSection === 'welcome' && <WelcomeSection onNavigate={setActiveSection} />}
          {activeSection === 'ventures' && <VenturesSection />}
          {activeSection === 'asg' && <ASGSection onNavigate={setActiveSection} />}
          {activeSection === 'chat' && <AnttipChatSection />}
          {activeSection === 'documents' && <DocumentsSection tenantId="anttip" />}
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 60%{transform:translateX(8px)} }
        @keyframes bounce { 0%,80%,100%{transform:scale(0.8);opacity:0.4} 40%{transform:scale(1.1);opacity:1} }
        .ap-mob-toggle { display: none !important; }
        @media (max-width: 640px) {
          aside { display: none; }
          .ap-mob-toggle { display: block !important; }
          .ap-sidebar-open { display: block !important; position: fixed; z-index: 200; top: 56px; left: 0; height: calc(100vh - 56px); }
          main { padding: 24px 20px 60px !important; }
        }
      `}</style>
    </div>
  )
}

// ─── WELCOME ─────────────────────────────────────────────────────────────────

function WelcomeSection({ onNavigate }: { onNavigate: (s: Section) => void }) {
  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: PURPLE, fontWeight: 700, marginBottom: '16px' }}>
        Tervetuloa
      </div>
      <h1 style={{ fontSize: '42px', fontWeight: 900, lineHeight: '1.05', letterSpacing: '-1px', marginBottom: '20px', color: '#FAFAFA' }}>
        Built for<br /><span style={{ color: PURPLE }}>Antti Pasila.</span>
      </h1>
      <p style={{ fontSize: '17px', color: LIGHT_GRAY, lineHeight: '1.75', marginBottom: '24px', maxWidth: '540px' }}>
        This isn't a demo. Everything in this portal was built around you — your ventures, your worldview, your way of thinking. Finnish or English, your call. It gets sharper the more you engage with it.
      </p>

      {/* What we already know */}
      <div style={{ background: `${PURPLE}08`, border: `1px solid ${PURPLE}20`, borderRadius: '10px', padding: '20px 24px', marginBottom: '36px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: PURPLE, fontWeight: 700, marginBottom: '14px' }}>
          What Kit Already Knows About You
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { label: 'Current venture', value: 'Cyans SEZC · Anguilla — venture studio. Building products that matter.' },
            { label: 'Flagship product', value: 'Platinum.ai — AI Website Profiles (AWPs). Makes businesses discoverable by AI assistants.' },
            { label: 'Background', value: 'Helsinki, Finland. ~20 years building across adtech, edtech, diagnostics, and AI platforms.' },
            { label: 'Notable builds', value: 'Kiosked (programmatic adtech) · GraphoGame (8M+ children) · DeepScan Diagnostics (CBDO)' },
            { label: 'How you think', value: 'Platform builder, systems thinker. Portfolio across domains — architecture over domain specialization.' },
            { label: 'Current bet', value: 'AI discoverability is the next SEO wave. Platinum.ai is the early mover. AWPs are structured data for LLM retrieval.' },
          ].map(item => (
            <div key={item.label} style={{ background: '#0d0a18', borderRadius: '6px', padding: '10px 12px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: PURPLE, fontWeight: 700, marginBottom: '3px' }}>{item.label}</div>
              <div style={{ fontSize: '12px', color: LIGHT_GRAY, lineHeight: '1.5' }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#444' }}>
          Anything off? Use the chat to correct it — Kit updates its context.
        </div>
      </div>

      {/* Feature cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {[
          { id: 'ventures' as Section, icon: '🏗️', color: PURPLE, title: 'Your Ventures', desc: 'Cyans, Platinum.ai, Kiosked, DeepScan, GraphoGame — Kit has full context on all of them.' },
          { id: 'chat' as Section, icon: '💬', color: TEAL, title: 'Chat with Kit', desc: 'Remembers everything across sessions. Finnish or English. Takes action — not just text.' },
          { id: 'documents' as Section, icon: '📄', color: '#A78BFA', title: 'Documents', desc: 'Upload anything — pitch decks, research, contracts — and Kit will reference it in chat.' },
        ].map(card => (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            style={{
              textAlign: 'left', background: SURFACE, border: `1px solid ${card.color}20`,
              borderRadius: '12px', padding: '24px', cursor: 'pointer',
              fontFamily: "'Inter', sans-serif", color: 'inherit',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = `${card.color}50`
              ;(e.currentTarget as HTMLElement).style.background = `${card.color}08`
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = `${card.color}20`
              ;(e.currentTarget as HTMLElement).style.background = SURFACE
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>{card.icon}</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: card.color, marginBottom: '8px' }}>{card.title}</div>
            <div style={{ fontSize: '13px', color: GRAY, lineHeight: '1.6' }}>{card.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ background: `${TEAL}08`, border: `1px solid ${TEAL}20`, borderRadius: '10px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: TEAL, fontWeight: 700, marginBottom: '8px' }}>
            Start Here
          </div>
          <p style={{ fontSize: '14px', color: LIGHT_GRAY, lineHeight: '1.7' }}>
            Open Chat — ask Kit anything about Platinum.ai, AWP distribution strategy, or whatever's on your mind. Finnish or English, mid-sentence switch, doesn't matter.
          </p>
        </div>
        <button
          onClick={() => onNavigate('chat')}
          style={{
            background: PURPLE, color: '#FAFAFA', border: 'none', borderRadius: '8px',
            padding: '12px 22px', fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', fontFamily: "'Inter', sans-serif", flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          Start Talking with Kit →
        </button>
      </div>
    </div>
  )
}

// ─── ASG ─────────────────────────────────────────────────────────────────────

function ASGSection({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const builds = [
    { name: 'Rex', desc: 'CRE & financial research agent. Pulls live data, synthesizes market context, drafts memos. Built for commercial real estate operators.', time: '2 weeks' },
    { name: 'Lex', desc: 'Legal drafting agent. Researches case law, drafts motions and memos, trained on specific practice areas. Built for law firms.', time: '2 weeks' },
    { name: 'Aria', desc: 'Tax and accounting agent. Deep expertise in IRC, GAAP, transfer pricing. Built for CPA firms and tax departments.', time: '2 weeks' },
    { name: 'Atlas', desc: 'Executive AI — reads email, manages calendar context, does research, drafts outbound. This instance you\'re using now.', time: '1 week' },
  ]

  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: PURPLE, fontWeight: 700, marginBottom: '16px' }}>
        The Company That Built This
      </div>
      <h2 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '12px', lineHeight: '1.1', color: '#FAFAFA' }}>
        AxiomStream Group
      </h2>
      <p style={{ fontSize: '15px', color: LIGHT_GRAY, lineHeight: '1.7', marginBottom: '32px' }}>
        ASG builds purpose-built AI agents for founders and professionals. Not wrapped ChatGPT. Not generic chatbots. Agents with memory, context, and the ability to take action — built around how specific people actually work.
      </p>

      {/* Core differentiator */}
      <div style={{ background: `${PURPLE}08`, border: `1px solid ${PURPLE}20`, borderRadius: '10px', padding: '20px 24px', marginBottom: '28px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: PURPLE, fontWeight: 700, marginBottom: '12px' }}>
          The Model Is Not The Product
        </div>
        <p style={{ fontSize: '14px', color: LIGHT_GRAY, lineHeight: '1.75' }}>
          You already use Claude. So does everyone. The difference: ASG builds what sits on top — the context, the integrations, the memory architecture, the domain expertise baked in before the first conversation. That's what makes this feel different from a tab in your browser.
        </p>
      </div>

      {/* What ASG builds */}
      <div style={{ fontSize: '13px', fontWeight: 700, color: GRAY, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>
        What's Been Built
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {builds.map(b => (
          <div key={b.name} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ minWidth: '60px' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: PURPLE }}>{b.name}</div>
              <div style={{ fontSize: '10px', color: TEAL, fontWeight: 700, letterSpacing: '1px', marginTop: '2px' }}>{b.time}</div>
            </div>
            <div style={{ fontSize: '13px', color: LIGHT_GRAY, lineHeight: '1.6' }}>{b.desc}</div>
          </div>
        ))}
      </div>

      {/* Honest note */}
      <div style={{ background: `${TEAL}08`, border: `1px solid ${TEAL}20`, borderRadius: '10px', padding: '20px 24px', marginBottom: '28px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: TEAL, fontWeight: 700, marginBottom: '10px' }}>
          No Pitch Here
        </div>
        <p style={{ fontSize: '14px', color: LIGHT_GRAY, lineHeight: '1.75' }}>
          JJ built this for you because you're someone he respects — not to sell you something. Use it however it's useful. If you have questions about how it works or what else could be built, ask Kit directly. That's what it's here for.
        </p>
      </div>

      {/* CTA */}
      <div style={{ background: `${PURPLE}06`, border: `1px solid ${PURPLE}15`, borderRadius: '10px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#FAFAFA', marginBottom: '6px' }}>
            Ask Kit anything
          </div>
          <p style={{ fontSize: '13px', color: GRAY, lineHeight: '1.6' }}>
            How this was built. What JJ is working on. How ASG thinks about AI. Anything at all — Kit knows the whole picture.
          </p>
        </div>
        <button
          onClick={() => onNavigate('chat')}
          style={{
            background: PURPLE, color: '#FAFAFA', border: 'none', borderRadius: '8px',
            padding: '12px 22px', fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', fontFamily: "'Inter', sans-serif", flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          Open Chat →
        </button>
      </div>
    </div>
  )
}

// ─── VENTURES ────────────────────────────────────────────────────────────────

function VenturesSection() {
  const ventures = [
    {
      name: 'Cyans SEZC',
      icon: '🏝️',
      color: PURPLE,
      tagline: 'Venture Studio · Anguilla, B.W.I.',
      desc: 'Family-run venture studio. Building products that matter in the real world with a long time horizon. Antti and Johanna Pasila, co-founders.',
    },
    {
      name: 'Platinum.ai',
      icon: '🤖',
      color: '#A78BFA',
      tagline: 'AI Website Profiles · AI Discoverability',
      desc: 'Makes businesses discoverable by AI assistants replacing traditional search. AWPs are structured data profiles that LLMs retrieve instead of crawling web pages.',
    },
    {
      name: 'Kiosked',
      icon: '📡',
      color: TEAL,
      tagline: 'Programmatic Advertising · Co-founded 2010',
      desc: "Finland's fastest growing company award (2016). End-to-end scalable sales platform linking advertiser offerings to impulse-generating content across the web.",
    },
    {
      name: 'DeepScan Diagnostics',
      icon: '🐾',
      color: '#34D399',
      tagline: 'Canine Health Diagnostics · Co-founder & CBDO',
      desc: 'Data science applied to canine health diagnostics. Improving accuracy and accessibility of veterinary diagnostics at scale.',
    },
    {
      name: 'GraphoGame',
      icon: '📚',
      color: '#FB923C',
      tagline: 'Literacy App · 8M+ children globally',
      desc: "World's most widely used literacy app in its category. Teaches reading through adaptive, game-based learning. Built for children in dozens of languages.",
    },
    {
      name: 'Claned Group',
      icon: '🎓',
      color: '#60A5FA',
      tagline: 'EdTech · Learning Data Platform',
      desc: 'Learning analytics platform built around educational data. Helps institutions understand how learning actually happens — and optimize for it.',
    },
  ]

  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: PURPLE, fontWeight: 700, marginBottom: '16px' }}>
        Context Loaded
      </div>
      <h2 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '12px', lineHeight: '1.1', color: '#FAFAFA' }}>
        Your Ventures
      </h2>
      <p style={{ fontSize: '15px', color: LIGHT_GRAY, lineHeight: '1.7', marginBottom: '32px' }}>
        Kit has full context on each of these. No need to re-explain who you are or what you've built — it already knows.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {ventures.map(v => (
          <div key={v.name} style={{
            background: SURFACE, border: `1px solid ${v.color}20`,
            borderRadius: '12px', padding: '20px 24px',
            transition: 'border-color 0.15s',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ fontSize: '28px', flexShrink: 0 }}>{v.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#FAFAFA' }}>{v.name}</div>
                  <div style={{ fontSize: '11px', color: v.color, fontWeight: 600, letterSpacing: '1px' }}>{v.tagline}</div>
                </div>
                <div style={{ fontSize: '14px', color: LIGHT_GRAY, lineHeight: '1.65' }}>{v.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '28px', background: `${PURPLE}08`, border: `1px solid ${PURPLE}20`, borderRadius: '10px', padding: '16px 20px' }}>
        <div style={{ fontSize: '12px', color: LIGHT_GRAY, lineHeight: '1.7' }}>
          <span style={{ color: PURPLE, fontWeight: 700 }}>Kit has this loaded.</span> When you chat, you don't need to explain your background. Ask directly — "what's the distribution play for Platinum.ai" or "how do I think about Cyans portfolio strategy" — and Kit already has the context.
        </div>
      </div>
    </div>
  )
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────

const STARTERS = [
  'Mikä erottaa Platinum.ai:n kilpailijoista pitkässä juoksussa?',
  'What would you do differently if you were rebuilding Kiosked today with current AI infrastructure?',
  'Haluaisin ajatella ääneen Cyans-portfolion strategiasta.',
  "What's the distribution model that actually scales for AWP — direct, channel, or something else?",
]

function AnttipChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [fileUploading, setFileUploading] = useState(false)
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md')
  const [isDark, setIsDark] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastMsgRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [sendKey, setSendKey] = useState(0)

  const fontSizePx = fontSize === 'sm' ? '13px' : fontSize === 'lg' ? '17px' : '15px'
  const chatBg = isDark ? SURFACE : '#f9fafb'
  const chatBorder = isDark ? BORDER : '#e5e7eb'
  const msgUserBg = isDark ? '#1e1a3f' : '#ede9fe'
  const msgUserBorder = isDark ? `${PURPLE}30` : '#c4b5fd'
  const msgUserColor = isDark ? '#FAFAFA' : '#3b1d8c'
  const msgAsstBg = isDark ? '#161616' : '#ffffff'
  const msgAsstBorder = isDark ? BORDER : '#e5e7eb'
  const msgAsstColor = isDark ? '#FAFAFA' : '#111827'
  const inputBg = isDark ? '#0d0d0d' : '#ffffff'
  const inputColor = isDark ? '#FAFAFA' : '#111827'
  const inputBorder = isDark ? BORDER : '#d1d5db'

  useEffect(() => {
    if (loading) {
      const el = scrollRef.current
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }, [loading])

  useEffect(() => {
    if (!loading && messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      lastMsgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [messages])

  useEffect(() => {
    loadPersistedHistory().then(history => {
      if (history.length > 0) {
        setMessages(history)
      } else {
        setMessages([{
          role: 'assistant',
          content: 'Hei Antti — olen Kit.\n\nTiedän jo kuka olet. Kiosked, GraphoGame, DeepScan, Cyans — ja nyt Platinum.ai. Rakennat AI-löydettävyystuotetta samaan aikaan kun koko ala herää tähän ongelmaan.\n\nVoin auttaa strategiassa, analyysissa, tutkimuksessa — tai rakentaa konkreettisia asioita. Haluatko esimerkiksi nopean verkkosivun tai esityksen? Sen voin tehdä suoraan. Mitä on juuri nyt mielessä?',
        }])
      }
      setHistoryLoaded(true)
    })
  }, [])

  async function send(text?: string) {
    const userMsg = (text || input).trim()
    if (!userMsg || loading) return
    setInput(''); setSendKey(k => k + 1)
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: 'kit',
          message: userMsg,
          history,
          slug: ANTTI_SLUG,
          tenantId: ANTTI_SLUG,
          teamMember: 'Antti Pasila',
          isLead: true,
        }),
      })
      const data = await res.json()
      const reply = data.reply || data.text || data.message || 'Something went wrong — try again.'
      setMessages(prev => {
        const updated = [...prev, { role: 'assistant' as const, content: reply }]
        persistMessages(updated)
        return updated
      })
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection issue. Check your internet and try again.' }])
    }
    setLoading(false)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  async function uploadInlineFile(file: File) {
    setFileUploading(true)
    setMessages(prev => [...prev, { role: 'user', content: `📎 Uploading: ${file.name}…` }])
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('tenantId', ANTTI_SLUG)
      const r = await fetch('/api/rag-upload', { method: 'POST', body: form })
      if (!r.ok) throw new Error('Upload failed')
      setMessages(prev => {
        const updated = [...prev.slice(0, -1), { role: 'user' as const, content: `📎 ${file.name}` }, { role: 'assistant' as const, content: `✅ **${file.name}** uploaded and indexed. Ask me anything about it.` }]
        persistMessages(updated)
        return updated
      })
    } catch {
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: `❌ Upload failed for ${file.name}. Try again.` }])
    }
    setFileUploading(false)
  }

  const showStarters = historyLoaded && messages.length <= 1 && !loading

  return (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', minHeight: '500px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: PURPLE, fontWeight: 700, marginBottom: '8px' }}>
          Your Personal Instance
        </div>
        <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '8px', color: '#FAFAFA' }}>
          Chat with Kit
        </h2>
        <p style={{ fontSize: '14px', color: GRAY, lineHeight: '1.6' }}>
          Full context loaded — Cyans, Platinum.ai, all your ventures. Finnish or English.
        </p>
      </div>

      {/* Starter prompts */}
      {showStarters && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {STARTERS.map((s, i) => (
            <button
              key={i}
              onClick={() => send(s)}
              style={{
                textAlign: 'left', background: SURFACE, border: `1px solid ${PURPLE}20`,
                borderRadius: '10px', padding: '14px 16px', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif", color: LIGHT_GRAY, fontSize: '13px',
                lineHeight: '1.5', transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `${PURPLE}50`
                ;(e.currentTarget as HTMLElement).style.background = `${PURPLE}08`
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `${PURPLE}20`
                ;(e.currentTarget as HTMLElement).style.background = SURFACE
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: isDark ? '#0d0d0d' : '#f3f4f6',
        border: `1px solid ${chatBorder}`, borderBottom: 'none',
        borderRadius: '12px 12px 0 0', padding: '8px 14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: isDark ? '#555' : '#9ca3af', marginRight: '6px' }}>Size</span>
          {(['sm', 'md', 'lg'] as const).map((s, idx) => (
            <button key={s} onClick={() => setFontSize(s)} style={{
              background: fontSize === s ? `${PURPLE}20` : 'transparent',
              border: `1px solid ${fontSize === s ? PURPLE : (isDark ? '#333' : '#d1d5db')}`,
              borderRadius: '6px', padding: '3px 9px',
              fontSize: idx === 0 ? '11px' : idx === 1 ? '13px' : '15px',
              color: fontSize === s ? PURPLE : (isDark ? '#555' : '#9ca3af'),
              cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 700, transition: 'all 0.15s',
            }}>A</button>
          ))}
        </div>
        <button onClick={() => setIsDark(d => !d)} style={{
          background: isDark ? '#1a1a1a' : '#e5e7eb',
          border: `1px solid ${isDark ? '#333' : '#d1d5db'}`,
          borderRadius: '20px', padding: '5px 14px',
          fontSize: '12px', fontWeight: 600,
          color: isDark ? '#aaa' : '#374151',
          cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span>{isDark ? '☀️' : '🌙'}</span>
          <span>{isDark ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden', background: chatBg,
        border: `1px solid ${chatBorder}`, borderTop: 'none',
        padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        {messages.map((m, i) => (
          <div key={i} ref={i === messages.length - 1 ? lastMsgRef : undefined} style={{
            display: 'flex', gap: '10px',
            flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
          }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
              background: m.role === 'user' ? '#1e1a3f' : `${PURPLE}20`,
              border: `1px solid ${m.role === 'user' ? `${PURPLE}40` : PURPLE + '40'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 800,
              color: m.role === 'user' ? '#a78bfa' : PURPLE,
            }}>
              {m.role === 'user' ? 'A' : 'K'}
            </div>
            <div style={{
              maxWidth: '80%', minWidth: 0,
              background: m.role === 'user' ? msgUserBg : msgAsstBg,
              border: `1px solid ${m.role === 'user' ? msgUserBorder : msgAsstBorder}`,
              borderRadius: '10px', padding: '12px 16px',
              fontSize: fontSizePx, color: m.role === 'user' ? msgUserColor : msgAsstColor,
              lineHeight: '1.7', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere',
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `${PURPLE}20`, border: `1px solid ${PURPLE}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: PURPLE }}>K</div>
            <div style={{ background: msgAsstBg, border: `1px solid ${msgAsstBorder}`, borderRadius: '10px', padding: '12px 16px' }}>
              <span style={{ display: 'inline-flex', gap: '4px' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: PURPLE, opacity: 0.5, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        background: isDark ? SURFACE : '#f3f4f6',
        border: `1px solid ${chatBorder}`, borderTop: 'none',
        borderRadius: '0 0 12px 12px', padding: '12px',
        display: 'flex', gap: '8px', alignItems: 'flex-end',
      }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) { uploadInlineFile(f); e.target.value = '' } }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={fileUploading || loading}
          title="Attach a document"
          style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: isDark ? '#1a1a1a' : '#e5e7eb',
            border: `1px solid ${isDark ? '#333' : '#d1d5db'}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
            opacity: (fileUploading || loading) ? 0.4 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <span style={{ fontSize: '18px' }}>{fileUploading ? '⏳' : '📎'}</span>
        </button>
        <textarea
          key={sendKey}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask Kit… / Kysy Kitiltä…"
          rows={2}
          autoComplete="off" autoCorrect="on" autoCapitalize="sentences" spellCheck
          style={{
            flex: 1, background: inputBg, border: `1px solid ${inputBorder}`,
            borderRadius: '8px', padding: '10px 14px', fontSize: '16px',
            color: inputColor, fontFamily: "'Inter', sans-serif", outline: 'none',
            resize: 'none', lineHeight: '1.5',
          }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          style={{
            width: '40px', height: '40px', borderRadius: '50%', background: PURPLE,
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
            opacity: (!input.trim() || loading) ? 0.4 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <span style={{ fontSize: '16px', color: '#FAFAFA', fontWeight: 900 }}>↑</span>
        </button>
      </div>

      <div style={{ marginTop: '8px', fontSize: '11px', color: '#333', textAlign: 'center' }}>
        Powered by AxiomStream Group · Built for Antti Pasila
      </div>
    </div>
  )
}

// ─── DOCUMENTS ───────────────────────────────────────────────────────────────

interface RagDocument {
  id: string; filename: string; status: string; chunkCount: number; size: number; createdAt: string
}

function DocumentsSection({ tenantId }: { tenantId: string }) {
  const [docs, setDocs] = useState<RagDocument[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadDocs() }, [])

  async function loadDocs() {
    try {
      const r = await fetch(`/api/rag-documents?tenantId=${encodeURIComponent(tenantId)}`)
      if (r.ok) setDocs(await r.json())
    } catch { /* non-critical */ }
  }

  async function uploadFile(file: File) {
    if (uploading) return
    setUploading(true)
    setUploadStatus(`Uploading ${file.name}…`)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('tenantId', tenantId)
      const r = await fetch('/api/rag-upload', { method: 'POST', body: form })
      const data = await r.json()
      if (data.success) {
        setUploadStatus(`✅ ${file.name} processed — ${data.chunkCount} chunks indexed`)
        await loadDocs()
      } else {
        setUploadStatus(`❌ Error: ${data.error || 'Upload failed'}`)
      }
    } catch (e: unknown) {
      setUploadStatus(`❌ Error: ${e instanceof Error ? e.message : 'Upload failed'}`)
    }
    setUploading(false)
    setTimeout(() => setUploadStatus(''), 5000)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  async function deleteDoc(id: string) {
    try {
      await fetch(`/api/rag-documents?id=${id}&tenantId=${encodeURIComponent(tenantId)}`, { method: 'DELETE' })
      setDocs(prev => prev.filter(d => d.id !== id))
    } catch { /* non-critical */ }
  }

  function fmtBytes(b: number) {
    if (b < 1024) return `${b}B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`
    return `${(b / 1024 / 1024).toFixed(1)}MB`
  }

  function fmtDate(s: string) {
    try { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
    catch { return s }
  }

  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: PURPLE, fontWeight: 700, marginBottom: '16px' }}>
        Knowledge Base
      </div>
      <h2 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '12px', lineHeight: '1.1', color: '#FAFAFA' }}>
        Documents
      </h2>
      <p style={{ fontSize: '15px', color: LIGHT_GRAY, lineHeight: '1.7', marginBottom: '28px' }}>
        Upload documents to your knowledge base. Kit will reference these files when you ask questions in chat.
      </p>

      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? PURPLE : BORDER}`,
          borderRadius: '12px', padding: '32px', textAlign: 'center',
          cursor: 'pointer', marginBottom: '24px', background: dragOver ? `${PURPLE}08` : 'transparent',
          transition: 'all 0.15s',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
        <div style={{ fontSize: '15px', fontWeight: 600, color: '#FAFAFA', marginBottom: '4px' }}>
          {uploading ? 'Uploading…' : 'Drop a file or click to upload'}
        </div>
        <div style={{ fontSize: '13px', color: GRAY }}>PDF, Word, or TXT</div>
        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }} onChange={handleFileChange} />
      </div>

      {uploadStatus && (
        <div style={{ fontSize: '13px', color: LIGHT_GRAY, marginBottom: '16px', padding: '10px 14px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px' }}>
          {uploadStatus}
        </div>
      )}

      {docs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {docs.map(doc => (
            <div key={doc.id} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '20px' }}>📄</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#FAFAFA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.filename}</div>
                <div style={{ fontSize: '12px', color: GRAY, marginTop: '2px' }}>
                  {doc.chunkCount} chunks · {fmtBytes(doc.size)} · {fmtDate(doc.createdAt)}
                </div>
              </div>
              <button
                onClick={() => deleteDoc(doc.id)}
                style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '16px', padding: '4px', flexShrink: 0 }}
              >🗑️</button>
            </div>
          ))}
        </div>
      )}

      {docs.length === 0 && !uploading && (
        <div style={{ textAlign: 'center', padding: '32px', color: GRAY, fontSize: '14px' }}>
          No documents yet. Upload a PDF or Word doc to get started.
        </div>
      )}
    </div>
  )
}
