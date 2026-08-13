import { useState, useRef, useEffect } from 'react'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false)
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return isMobile
}

const PIN = '0312' // March 12 — meeting date

const GOLD = '#E8B84B'
const TEAL = '#27B5A3'
const BG = '#0A0A0A'
const SURFACE = '#111111'
const BORDER = '#1F1F1F'
const GRAY = '#6B7280'
const LIGHT_GRAY = '#9CA3AF'

type Section = 'welcome' | 'stockbrief' | 'retirement' | 'aboutyou' | 'chat' | 'documents'

interface IntakeForm {
  aiToday: string; topChallenge: string; clientType: string[]; sectors: string[]; horizon: string; notes: string
}

const NAV_ITEMS: { id: Section; label: string; icon: string; tag?: string }[] = [
  { id: 'welcome', label: 'Welcome', icon: '👋' },
  { id: 'stockbrief', label: 'Stock Brief', icon: '📈', tag: 'Try it' },
  { id: 'retirement', label: 'Retirement Planner', icon: '🏖️', tag: 'Demo' },
  { id: 'aboutyou', label: 'About You', icon: '🎯' },
  { id: 'chat', label: 'Chat with Kit', icon: '💬', tag: 'Live' },
  { id: 'documents', label: 'Documents', icon: '📄' },
]

export default function MarkPortal() {
  const isMobile = useIsMobile()
  const [unlocked, setUnlocked] = useState(false)
  const [digits, setDigits] = useState(['', '', '', ''])
  const [pinError, setPinError] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>('welcome')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [intakeForm, setIntakeForm] = useState<IntakeForm>({
    aiToday: '',
    topChallenge: 'Client prep before meetings — want to reduce time spent pulling together research',
    clientType: ['HNW Individuals & Families', 'Institutions', 'Nonprofits & Foundations'],
    sectors: ['Healthcare', 'Technology / AI'],
    horizon: '10–20 years',
    notes: 'Asset allocator for the Landmark book — I\'m not picking individual stocks for clients, I\'m allocating across managers and strategies. Separately, I do invest for myself and pay close attention to individual companies. Fee-only fiduciary, no commissions. Long-horizon orientation, tax efficiency matters a lot. When I evaluate a company I look at: is cash flow real and growing, what is institutional ownership doing, what\'s the volume story, who are the customers and is there concentration risk, what does debt-to-equity look like, and who or what could disrupt the model in 5-10 years.'
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
        const el = document.getElementById('pin-0')
        if (el) (el as HTMLInputElement).focus()
      }, 100)
    }
  }

  if (!unlocked) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Inter', -apple-system, sans-serif" }}>
        <div style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }}>
          {/* Wordmark */}
          <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#333', marginBottom: '48px' }}>
            AXIOMSTREAM GROUP
          </div>

          {/* Card */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '20px', padding: '44px 40px 40px' }}>
            <div style={{ height: '3px', width: '48px', background: GOLD, borderRadius: '2px', margin: '0 auto 28px' }} />
            <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: '8px' }}>
              MADE FOR LANDMARK
            </div>
            <div style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '8px' }}>
              Mark Collard
            </div>
            <div style={{ fontSize: '14px', color: GRAY, marginBottom: '36px', lineHeight: '1.5' }}>
              Landmark Wealth Management<br />
              <span style={{ color: '#444', fontSize: '12px' }}>Amherst, NY</span>
            </div>

            <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: '14px' }}>
              Enter Access Code
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  id={`pin-${i}`}
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  autoFocus={i === 0}
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  style={{
                    width: '60px', height: '68px',
                    background: '#222',
                    border: `2px solid ${pinError ? '#ef4444' : d ? GOLD : '#444'}`,
                    borderRadius: '10px', fontSize: '26px', fontWeight: 700,
                    color: '#FAFAFA', textAlign: 'center', outline: 'none',
                    fontFamily: "'Inter', sans-serif",
                    animation: pinError ? 'shake 0.35s ease' : 'none',
                    transition: 'border-color 0.15s',
                    boxSizing: 'border-box',
                  } as React.CSSProperties}
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
                width: '100%', padding: '14px', background: GOLD, color: BG,
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
        <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 60%{transform:translateX(8px)} }`}</style>
      </div>
    )
  }

  // ─── Mobile layout ───
  if (isMobile) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: BG,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: '#FAFAFA', display: 'flex', flexDirection: 'column',
        height: '100dvh',
      } as React.CSSProperties}>
        <header style={{
          flexShrink: 0, padding: '14px 20px 12px',
          paddingTop: 'max(14px, env(safe-area-inset-top))' as string,
          borderBottom: `1px solid ${BORDER}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#0d0d0d',
        } as React.CSSProperties}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>{NAV_ITEMS.find(n => n.id === activeSection)?.icon}</span>
            <span style={{ fontSize: '19px', fontWeight: 700 }}>{NAV_ITEMS.find(n => n.id === activeSection)?.label}</span>
          </div>
          <span style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: GOLD, fontWeight: 700 }}>Landmark</span>
        </header>
        <main style={{
          flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
          overflowY: activeSection === 'chat' ? 'hidden' : 'auto',
          padding: activeSection === 'chat' ? '0' : '20px 16px',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}>
          {activeSection === 'welcome' && <WelcomeSection onNavigate={setActiveSection} />}
          {activeSection === 'stockbrief' && <StockBriefSection />}
          {activeSection === 'retirement' && <RetirementDemoSection />}
          {activeSection === 'aboutyou' && <AboutYouSection form={intakeForm} setForm={setIntakeForm} saved={intakeSaved} setSaved={setIntakeSaved} onNavigate={setActiveSection} />}
          {activeSection === 'chat' && <MarkChatSection intake={intakeSaved ? intakeForm : null} />}
          {activeSection === 'documents' && <DocumentsSection tenantId="mark" />}
        </main>
        <nav style={{
          flexShrink: 0, borderTop: `1px solid ${BORDER}`, background: '#0d0d0d',
          display: 'flex', paddingBottom: 'env(safe-area-inset-bottom, 0px)' as string,
        } as React.CSSProperties}>
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.id
            return (
              <button key={item.id} onClick={() => setActiveSection(item.id)} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '10px 2px',
                background: isActive ? `${GOLD}12` : 'none', border: 'none',
                borderTop: `2px solid ${isActive ? GOLD : 'transparent'}`,
                cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'background 0.15s',
              }}>
                <span style={{ fontSize: '20px', lineHeight: 1 }}>{item.icon}</span>
                <span style={{ fontSize: '10px', fontWeight: isActive ? 700 : 500, marginTop: '3px', color: isActive ? GOLD : '#555' }}>
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
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Inter', -apple-system, sans-serif", display: 'flex', flexDirection: 'column' }}>
      {/* Top header */}
      <header style={{
        borderBottom: `1px solid ${BORDER}`, padding: '0 24px', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(10,10,10,0.95)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Mobile nav toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', color: GRAY, cursor: 'pointer', padding: '4px', display: 'none', fontSize: '18px' }}
            className="mob-nav-toggle"
          >☰</button>
          <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '4px', textTransform: 'uppercase', color: GOLD }}>
            AXIOM<span style={{ color: GRAY, fontWeight: 400 }}>STREAM GROUP</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: TEAL }} />
          <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, fontWeight: 700 }}>
            Made for Landmark
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{
          width: '220px', flexShrink: 0, borderRight: `1px solid ${BORDER}`,
          padding: '32px 0', background: SURFACE,
          position: 'sticky', top: '56px', height: 'calc(100vh - 56px)', overflowY: 'auto',
        }}>
          <div style={{ padding: '0 20px 16px', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#333', fontWeight: 700 }}>
            Your Portal
          </div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                width: '100%', textAlign: 'left', background: 'none',
                border: 'none', padding: '10px 20px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '10px',
                color: activeSection === item.id ? '#FAFAFA' : GRAY,
                fontFamily: "'Inter', sans-serif",
                borderLeft: `3px solid ${activeSection === item.id ? GOLD : 'transparent'}`,
                background: activeSection === item.id ? `${GOLD}08` : 'none',
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
              March 12, 2026<br />
              <span style={{ color: '#222' }}>Confidential · ASG</span>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '48px 48px 80px' }}>
          {activeSection === 'welcome' && <WelcomeSection onNavigate={setActiveSection} />}
          {activeSection === 'stockbrief' && <StockBriefSection />}
          {activeSection === 'retirement' && <RetirementDemoSection />}
          {activeSection === 'aboutyou' && <AboutYouSection form={intakeForm} setForm={setIntakeForm} saved={intakeSaved} setSaved={setIntakeSaved} onNavigate={setActiveSection} />}
          {activeSection === 'chat' && <MarkChatSection intake={intakeSaved ? intakeForm : null} />}
          {activeSection === 'documents' && <DocumentsSection tenantId="mark" />}
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 60%{transform:translateX(8px)} }
        @media (max-width: 640px) {
          aside { display: none; }
          .mob-nav-toggle { display: block !important; }
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
      <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: TEAL, fontWeight: 700, marginBottom: '16px' }}>
        Welcome, Mark
      </div>
      <h1 style={{ fontSize: '42px', fontWeight: 900, lineHeight: '1.05', letterSpacing: '-1px', marginBottom: '20px' }}>
        Built for<br /><span style={{ color: GOLD }}>Landmark.</span>
      </h1>
      <p style={{ fontSize: '17px', color: LIGHT_GRAY, lineHeight: '1.75', marginBottom: '24px', maxWidth: '540px' }}>
        Everything in this portal was built around how Landmark operates — your practice, your clients, your strategy. Use it as a working tool, not a demo. It gets better the more you engage with it.
      </p>

      {/* What we already know — specific to Mark */}
      <div style={{ background: `${TEAL}08`, border: `1px solid ${TEAL}20`, borderRadius: '10px', padding: '20px 24px', marginBottom: '36px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: TEAL, fontWeight: 700, marginBottom: '14px' }}>
          Your Context
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { label: 'Role', value: 'Managing Partner · Landmark Wealth Management · Amherst, NY' },
            { label: 'Credentials', value: 'CPWA · AIF · CIS · Behavioral Finance Specialist · EMBA, UB School of Management' },
            { label: 'Practice model', value: 'Fee-only fiduciary RIA · ~200 client relationships · Charles Schwab custodian' },
            { label: 'Your approach', value: 'Asset allocator for clients — you\'re not picking stocks for the book. But you do for yourself.' },
            { label: 'Personal thesis', value: 'Long DMRC. Also tracking CDXS, ABVX, IDXX, LQDA — healthcare, biotech, and synthetic biology conviction plays.' },
            { label: 'How you evaluate', value: 'Cash flow · institutional ownership % · volume trends · customer concentration · P/E · debt-to-equity · disruptors in the category' },
            { label: 'What you\'re watching', value: 'AI replacing advisors — not a hypothetical for you. You\'ve been thinking about it seriously.' },
            { label: 'Your edge', value: 'Fiduciary independence. You can hold conviction positions your institutional peers can\'t touch.' },
          ].map(item => (
            <div key={item.label} style={{ background: '#0d1a18', borderRadius: '6px', padding: '10px 12px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, fontWeight: 700, marginBottom: '3px' }}>{item.label}</div>
              <div style={{ fontSize: '12px', color: LIGHT_GRAY, lineHeight: '1.5' }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#444' }}>
          Built from six weeks of conversations with Nick. Correct anything that's off in the "About You" section.
        </div>
      </div>

      {/* Quick cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {[
          { id: 'stockbrief' as Section, icon: '📈', color: GOLD, title: 'Stock Brief', desc: 'Drop in any ticker — get institutional-grade analysis through Landmark\'s lens.' },
          { id: 'retirement' as Section, icon: '🏖️', color: '#34D399', title: 'Retirement Planner', desc: 'Build a full retirement plan live. Try it with a real client scenario — adjust, regenerate, see the difference.' },
          { id: 'aboutyou' as Section, icon: '🎯', color: '#A78BFA', title: 'About You', desc: 'A few quick questions so the tools already know your practice before you start.' },
          { id: 'chat' as Section, icon: '💬', color: GOLD, title: 'Chat with Kit', desc: 'Your own Kit instance, pre-loaded with your practice context and watchlist. Ask anything.' },
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

      <div style={{ background: `${GOLD}08`, border: `1px solid ${GOLD}20`, borderRadius: '10px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: '8px' }}>
            Start Here
          </div>
          <p style={{ fontSize: '14px', color: LIGHT_GRAY, lineHeight: '1.7' }}>
            Enter a ticker in Stock Brief — any company you follow — and see how it reads through Landmark's lens. That's the fastest way to understand what this does for your practice.
          </p>
        </div>
        <button
          onClick={() => onNavigate('stockbrief')}
          style={{
            background: GOLD, color: BG, border: 'none', borderRadius: '8px',
            padding: '12px 22px', fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', fontFamily: "'Inter', sans-serif", flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          Open Stock Brief →
        </button>
      </div>
    </div>
  )
}

// ─── STOCK BRIEF ─────────────────────────────────────────────────────────────

function StockBriefSection() {
  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: '16px' }}>
        Instant 10-K Analysis
      </div>
      <h2 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '16px', lineHeight: '1.1' }}>
        Stock Brief
      </h2>
      <p style={{ fontSize: '16px', color: LIGHT_GRAY, lineHeight: '1.75', marginBottom: '20px' }}>
        Enter any public company ticker. Get real financials, AI-synthesized catalysts, key risk factors — and a read through the lens of a fee-only fiduciary with a long-horizon, concentration-aware practice.
      </p>
      <div style={{ background: `${GOLD}08`, border: `1px solid ${GOLD}20`, borderRadius: '8px', padding: '12px 16px', marginBottom: '28px', fontSize: '13px', color: LIGHT_GRAY, lineHeight: '1.6' }}>
        <span style={{ color: GOLD, fontWeight: 700 }}>Start with DMRC.</span> You already have a thesis on it — see how the brief reads it, what the institutional data says, and where the ASG connection comes in. That's the fastest way to pressure-test whether this is useful.
      </div>

      <a
        href="https://axiomstreamgroup.com/stock-brief.html"
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: GOLD, color: BG, padding: '16px 28px',
          borderRadius: '10px', fontWeight: 800, fontSize: '15px',
          textDecoration: 'none', letterSpacing: '0.5px', marginBottom: '32px',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
      >
        Open Stock Brief →
      </a>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
        {[
          { label: 'Your position', value: 'DMRC', sub: 'Digimarc — digital identity + agent layer thesis' },
          { label: 'Your watchlist', value: 'IDXX', sub: 'IDEXX Laboratories — healthcare/diagnostics' },
          { label: 'Your watchlist', value: 'CDXS', sub: 'Codexis — synthetic biology, early-stage conviction' },
          { label: 'Your watchlist', value: 'ABVX', sub: 'Abivax — specialty pharma pipeline play' },
          { label: 'Your watchlist', value: 'LQDA', sub: 'Liquidia — specialty pharma, regulatory catalyst' },
        ].map(s => (
          <a
            key={s.value}
            href={`https://axiomstreamgroup.com/stock-brief.html?ticker=${s.value}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'block', background: SURFACE, border: `1px solid ${BORDER}`,
              borderRadius: '8px', padding: '16px', textDecoration: 'none',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = `${GOLD}40`}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = BORDER}
          >
            <div style={{ fontSize: '10px', color: GRAY, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: GOLD }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: GRAY, marginTop: '4px' }}>{s.sub}</div>
          </a>
        ))}
      </div>

      <div style={{ background: `${TEAL}08`, border: `1px solid ${TEAL}20`, borderRadius: '10px', padding: '20px 24px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: TEAL, marginBottom: '8px' }}>
          The Landmark Lens
        </div>
        <p style={{ fontSize: '13px', color: LIGHT_GRAY, lineHeight: '1.7' }}>
          Every brief includes a section specific to Landmark — how this stock fits your practice, what your clients with positions are probably asking, and what a fee-only fiduciary advisor sees that sell-side coverage misses. It knows your team's credentials and your firm's strategy.
        </p>
      </div>
    </div>
  )
}

// ─── ASG STORY ───────────────────────────────────────────────────────────────

function ASGStorySection() {
  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: TEAL, fontWeight: 700, marginBottom: '16px' }}>
        The Full Brief
      </div>
      <h2 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '16px', lineHeight: '1.1' }}>
        The ASG Story
      </h2>
      <p style={{ fontSize: '16px', color: LIGHT_GRAY, lineHeight: '1.75', marginBottom: '20px' }}>
        Where we came from, what we've built, how we operate, and why this looks different from every other AI pitch you'll see. No slideware. The actual system, live.
      </p>
      <div style={{ background: `${TEAL}08`, border: `1px solid ${TEAL}20`, borderRadius: '8px', padding: '12px 16px', marginBottom: '28px', fontSize: '13px', color: LIGHT_GRAY, lineHeight: '1.6' }}>
        <span style={{ color: TEAL, fontWeight: 700 }}>The disruption section is written for you.</span> The question you've been sitting with — whether AI eventually replaces advisors — is addressed directly. The answer isn't reassuring fluff. It's a real position on where this goes and what it means for a firm like Landmark.
      </div>

      <a
        href="https://axiomstreamgroup.com/asg-brief.html"
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: TEAL, color: BG, padding: '16px 28px',
          borderRadius: '10px', fontWeight: 800, fontSize: '15px',
          textDecoration: 'none', letterSpacing: '0.5px', marginBottom: '32px',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
      >
        Read the Brief →
      </a>

      {/* Quick-scan bullets */}
      {[
        { icon: '🏗️', title: 'The 30% Problem', body: 'Off-the-shelf software gets every firm to 70%. The last 30% — the part specific to how you actually work — becomes manual workarounds and missed opportunity. ASG fills that gap.' },
        { icon: '⚡', title: 'Digital Team Model', body: 'Founders and domain experts set strategy and make decisions. A digital team executes 24/7 — analysis, drafting, outreach, monitoring. Humans where you need judgment. Technology everywhere else.' },
        { icon: '🧬', title: 'It Learns You. Forever.', body: 'Every implementation starts with an intake that builds context around your practice. That context never gets lost. It\'s the difference between a chatbot and a system that already knows who your clients are.' },
        { icon: '⚠️', title: 'The Disruption Coming for Your Industry', body: 'The narrative is already written: AI will replace financial advisors. The firms that layer AI onto 20 years of domain expertise — before their competitors do — won\'t be replaced. They\'ll be untouchable.' },
      ].map((b, i) => (
        <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '20px 0', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: '24px', flexShrink: 0 }}>{b.icon}</div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>{b.title}</div>
            <div style={{ fontSize: '14px', color: GRAY, lineHeight: '1.7' }}>{b.body}</div>
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
  }

  if (saved) {
    return (
      <div style={{ maxWidth: '560px', textAlign: 'center', paddingTop: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
        <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '12px' }}>Got it, Mark.</h2>
        <p style={{ fontSize: '16px', color: LIGHT_GRAY, lineHeight: '1.7', marginBottom: '28px' }}>
          Your context is saved. Kit now knows your practice, your investment approach, and what matters to you at Landmark. Every conversation starts from there.
        </p>
        <button
          onClick={() => onNavigate('chat')}
          style={{
            background: GOLD, color: BG, border: 'none', borderRadius: '10px',
            padding: '15px 32px', fontSize: '15px', fontWeight: 700,
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
          }}
        >
          Chat with Kit →
        </button>
      </div>
    )
  }

  const labelStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: GRAY, display: 'block', marginBottom: '10px' }
  const inputStyle: React.CSSProperties = { width: '100%', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '12px 16px', fontSize: '14px', color: '#FAFAFA', fontFamily: "'Inter', sans-serif", outline: 'none' }
  const chipStyle = (active: boolean): React.CSSProperties => ({
    background: active ? `${TEAL}20` : SURFACE, border: `1px solid ${active ? TEAL : BORDER}`,
    borderRadius: '20px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer',
    color: active ? TEAL : GRAY, fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
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
        We've pre-loaded what we already know about Landmark from conversations with Nick. Review it, correct anything that's off, and add what only you know. The more accurate this is, the more specifically every tool speaks to your practice.
      </p>
      <div style={{ background: `${GOLD}08`, border: `1px solid ${GOLD}20`, borderRadius: '8px', padding: '12px 16px', marginBottom: '28px', fontSize: '13px', color: GRAY }}>
        ✅ Pre-filled from context — just review and save.
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

        <div>
          <label style={labelStyle}>What AI tools are you using today, if any?</label>
          <input
            type="text"
            placeholder="ChatGPT, Copilot, none yet..."
            value={form.aiToday}
            onChange={e => setForm({ ...form, aiToday: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>What's your biggest time drain in a typical week?</label>
          <input
            type="text"
            placeholder="Client prep, reporting, prospecting..."
            value={form.topChallenge}
            onChange={e => setForm({ ...form, topChallenge: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Primary client profile</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['HNW Individuals & Families', 'Institutions', 'Nonprofits & Foundations', 'Business Owners', 'Retirees / Pre-retirees'].map(v => (
              <button key={v} type="button" style={chipStyle(form.clientType.includes(v))} onClick={() => setForm({ ...form, clientType: toggle(form.clientType, v) })}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Sectors you follow most closely (select all that apply)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['Healthcare', 'Technology / AI', 'Financial Services', 'Energy', 'Consumer', 'Industrials', 'Real Estate'].map(v => (
              <button key={v} type="button" style={chipStyle(form.sectors.includes(v))} onClick={() => setForm({ ...form, sectors: toggle(form.sectors, v) })}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Typical client investment horizon</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['Under 5 years', '5–10 years', '10–20 years', '20+ years / generational'].map(v => (
              <button key={v} type="button" style={chipStyle(form.horizon === v)} onClick={() => setForm({ ...form, horizon: form.horizon === v ? '' : v })}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Anything else we should know about Landmark or how you work?</label>
          <textarea
            placeholder="Your investment philosophy, how you run client reviews, what makes Landmark different..."
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

// ─── CHAT WITH KIT ───────────────────────────────────────────────────────────

interface ChatMessage { role: 'user' | 'assistant'; content: string }

const PORTAL_SLUG = 'mark'

async function persistMessages(msgs: ChatMessage[]) {
  // Save full history snapshot — clear then rewrite last 100 turns
  // Simpler: just append the last two messages (user + assistant pair)
  try {
    const last = msgs.slice(-2)
    for (const m of last) {
      await fetch(`/api/portal-chat-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: PORTAL_SLUG, role: m.role, content: m.content }),
      })
    }
  } catch { /* non-critical — don't block UI */ }
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

function MarkChatSection({ intake }: { intake: IntakeForm | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [fileUploading, setFileUploading] = useState(false)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const scrollRef  = useRef<HTMLDivElement>(null)
  const lastMsgRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [sendKey, setSendKey] = useState(0)
  const [fontSize, setFontSize] = useState<'sm'|'md'|'lg'>('md')
  const [isDark, setIsDark] = useState(true)

  const fontSizePx = fontSize === 'sm' ? '13px' : fontSize === 'lg' ? '17px' : '15px'
  const chatBg       = isDark ? SURFACE   : '#f9fafb'
  const chatBorder   = isDark ? BORDER    : '#e5e7eb'
  const msgUserBg    = isDark ? '#1e3a5f' : '#dbeafe'
  const msgUserBorder = isDark ? '#2563eb30' : '#93c5fd'
  const msgUserColor = isDark ? '#FAFAFA' : '#1e3a5f'
  const msgAsstBg    = isDark ? '#161616' : '#ffffff'
  const msgAsstBorder = isDark ? BORDER   : '#e5e7eb'
  const msgAsstColor = isDark ? '#FAFAFA' : '#111827'
  const inputBg      = isDark ? '#0d0d0d' : '#ffffff'
  const inputColor   = isDark ? '#FAFAFA' : '#111827'
  const inputBorder  = isDark ? BORDER    : '#d1d5db'

  const intakeContext = intake ? `\n\n## Mark's Intake (filled in during this session)\nAI tools today: ${intake.aiToday || 'not specified'}\nBiggest time drain: ${intake.topChallenge}\nClient profile: ${intake.clientType.join(', ')}\nSectors: ${intake.sectors.join(', ')}\nInvestment horizon: ${intake.horizon}\nNotes: ${intake.notes}` : ''

  useEffect(() => {
    if (loading) {
      const el = scrollRef.current
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }, [loading])
  useEffect(() => {
    if (!loading && messages.length > 0 && messages[messages.length-1].role === 'assistant') {
      lastMsgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [messages])

  // Load persisted history on mount; fall back to greeting if none
  useEffect(() => {
    loadPersistedHistory().then(history => {
      if (history.length > 0) {
        setMessages(history)
      } else {
        setMessages([{
          role: 'assistant',
          content: intake
            ? "Hey Mark — I have your context loaded, including what you just filled in. Ask me anything about your watchlist, your practice, or anything else on your mind."
            : "Hey Mark — I'm Kit. Ask me anything — your watchlist, the DMRC thesis, how AI fits into a fiduciary practice, or anything else."
        }])
      }
      setHistoryLoaded(true)
    })
  }, [])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput(''); setSendKey(k => k + 1)
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: 'Kit',
          message: userMsg,
          history,
          slug: 'mark',
          tenantId: 'mark',
          teamMember: 'Mark Collard',
          isLead: true,
          extraContext: intakeContext,
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
      form.append('tenantId', 'mark')
      const r = await fetch('/api/rag-upload', { method: 'POST', body: form })
      if (!r.ok) throw new Error('Upload failed')
      setMessages(prev => {
        const updated = [...prev.slice(0, -1), { role: 'user' as const, content: `📎 ${file.name}` }, { role: 'assistant' as const, content: `✅ **${file.name}** is uploaded and ready. Ask me anything about it.` }]
        persistMessages(updated)
        return updated
      })
    } catch {
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: `❌ Upload failed for ${file.name}. Try again.` }])
    }
    setFileUploading(false)
  }

  return (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', minHeight: '500px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: '8px' }}>
          Your Personal Instance
        </div>
        <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '8px' }}>
          Chat with Kit
        </h2>
        <p style={{ fontSize: '14px', color: GRAY, lineHeight: '1.6' }}>
          Full context loaded — your practice, your watchlist, your investment thesis.
          {intake && <span style={{ color: TEAL }}> Intake saved ✓</span>}
        </p>
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: isDark ? '#0d0d0d' : '#f3f4f6',
        border: `1px solid ${chatBorder}`, borderBottom: 'none',
        borderRadius: '12px 12px 0 0', padding: '8px 14px',
      }}>
        {/* Font size */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: isDark ? '#555' : '#9ca3af', marginRight: '6px' }}>Size</span>
          {(['sm','md','lg'] as const).map((s, idx) => (
            <button key={s} onClick={() => setFontSize(s)} style={{
              background: fontSize === s ? (isDark ? GOLD + '20' : '#fef3c7') : 'transparent',
              border: `1px solid ${fontSize === s ? GOLD : (isDark ? '#333' : '#d1d5db')}`,
              borderRadius: '6px', padding: '3px 9px',
              fontSize: idx === 0 ? '11px' : idx === 1 ? '13px' : '15px',
              color: fontSize === s ? GOLD : (isDark ? '#555' : '#9ca3af'),
              cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 700, transition: 'all 0.15s',
            }}>A</button>
          ))}
        </div>
        {/* Dark/Light toggle */}
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
        flex: 1, overflowY: 'auto', overflowX: 'hidden', background: chatBg, border: `1px solid ${chatBorder}`,
        borderTop: 'none', borderRadius: '0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        {messages.map((m, i) => (
          <div key={i} ref={i === messages.length - 1 ? lastMsgRef : undefined} style={{
            display: 'flex', gap: '10px',
            flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
          }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
              background: m.role === 'user' ? '#1e3a5f' : `${GOLD}20`,
              border: `1px solid ${m.role === 'user' ? '#2563eb40' : GOLD + '40'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 800, color: m.role === 'user' ? '#60a5fa' : GOLD,
            }}>
              {m.role === 'user' ? 'M' : 'K'}
            </div>
            <div style={{
              maxWidth: '80%', minWidth: 0,
              background: m.role === 'user' ? msgUserBg : msgAsstBg,
              border: `1px solid ${m.role === 'user' ? msgUserBorder : msgAsstBorder}`,
              borderRadius: '10px', padding: '12px 16px',
              fontSize: fontSizePx, color: m.role === 'user' ? msgUserColor : msgAsstColor, lineHeight: '1.7',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere',
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `${GOLD}20`, border: `1px solid ${GOLD}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: GOLD }}>K</div>
            <div style={{ background: msgAsstBg, border: `1px solid ${msgAsstBorder}`, borderRadius: '10px', padding: '12px 16px' }}>
              <span style={{ display: 'inline-flex', gap: '4px' }}>
                {[0,1,2].map(i => (
                  <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: GOLD, opacity: 0.5, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        background: isDark ? SURFACE : '#f3f4f6', border: `1px solid ${chatBorder}`, borderTop: 'none',
        borderRadius: '0 0 12px 12px', padding: '12px',
        display: 'flex', gap: '8px', alignItems: 'flex-end',
      }}>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) { uploadInlineFile(f); e.target.value = '' } }}
        />
        {/* Paperclip button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={fileUploading || loading}
          title="Attach a document (PDF, Word, TXT)"
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
          placeholder={messages.filter(m => m.role === 'user').length > 0 ? '' : "Ask about DMRC, your practice, anything on your mind..."}
          rows={2}
          autoComplete="off" autoCorrect="on" autoCapitalize="sentences" spellCheck={true}
          style={{
            flex: 1, background: inputBg, border: `1px solid ${inputBorder}`,
            borderRadius: '8px', padding: '10px 14px', fontSize: '16px',
            color: inputColor, fontFamily: "'Inter', sans-serif", outline: 'none',
            resize: 'none', lineHeight: '1.5', WebkitAppearance: 'none' as const,
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          style={{
            width: '40px', height: '40px', borderRadius: '50%', background: GOLD,
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0, opacity: (!input.trim() || loading) ? 0.4 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <span style={{ fontSize: '16px', color: BG, fontWeight: 900 }}>↑</span>
        </button>
      </div>

      <div style={{ marginTop: '8px', fontSize: '11px', color: '#333', textAlign: 'center' }}>
        Powered by AxiomStream Group · Built for Landmark Wealth Management
      </div>

      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.8);opacity:0.4} 40%{transform:scale(1.1);opacity:1} }`}</style>
    </div>
  )
}

// ─── RETIREMENT PLANNER DEMO ─────────────────────────────────────────────────

const GREEN = '#34D399'

interface RetirementInputs {
  clientName: string
  clientAge: string
  spouseAge: string
  retirementAge: string
  currentSavings: string
  annualContrib: string
  expectedReturn: string
  currentIncome: string
  monthlyExpenses: string
  goals: string[]
  socialSecurity: string
  riskTolerance: string
  extraNotes: string
}

const DEFAULT_INPUTS: RetirementInputs = {
  clientName: 'The Millers',
  clientAge: '52',
  spouseAge: '50',
  retirementAge: '62',
  currentSavings: '850,000',
  annualContrib: '46,000',
  expectedReturn: '7',
  currentIncome: '280,000',
  monthlyExpenses: '12,000',
  goals: ['Travel extensively in early retirement', 'Purchase lake house in Adirondacks', "Fund grandchildren's education", 'Leave meaningful legacy for heirs'],
  socialSecurity: '3,200',
  riskTolerance: 'Moderate Growth',
  extraNotes: 'Client is concerned about sequence-of-returns risk given they are close to retirement. Spouse plans to continue part-time consulting 2–3 years post-retirement. Both healthy, no long-term care policy in place. Tax efficiency is a priority — high earners looking to minimize RMDs.',
}

function RetirementDemoSection() {
  const [inputs, setInputs] = useState<RetirementInputs>(DEFAULT_INPUTS)
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [chatHistory, setChatHistory] = useState<{role:'user'|'assistant';content:string}[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const goalOptions = [
    'Travel extensively in early retirement',
    'Purchase lake house in Adirondacks',
    "Fund grandchildren's education",
    'Leave meaningful legacy for heirs',
    'Pay off primary residence',
    'Start a passion project or business',
    'Downsize home in retirement',
  ]

  function toggleGoal(g: string) {
    setInputs(prev => ({
      ...prev,
      goals: prev.goals.includes(g) ? prev.goals.filter(v => v !== g) : [...prev.goals, g],
    }))
  }

  async function generate() {
    setLoading(true)
    setAnalysis('')
    setGenerated(false)
    setChatHistory([])

    const prompt = `Generate a comprehensive retirement readiness analysis for the following client profile. Write advisor-to-advisor — clear, direct, data-grounded, no fluff.

CLIENT PROFILE:
- Name: ${inputs.clientName}
- Ages: ${inputs.clientAge} (client) / ${inputs.spouseAge} (spouse)
- Target retirement age: ${inputs.retirementAge}
- Current retirement savings: $${inputs.currentSavings}
- Annual contributions: $${inputs.annualContrib}
- Expected portfolio return: ${inputs.expectedReturn}%/yr
- Combined household income: $${inputs.currentIncome}
- Monthly expenses (current): $${inputs.monthlyExpenses}
- Estimated Social Security (combined at 67): $${inputs.socialSecurity}/mo
- Risk tolerance: ${inputs.riskTolerance}
- Goals: ${inputs.goals.join('; ')}
- Additional context: ${inputs.extraNotes}

Structure:
1. **Retirement Readiness Score** (0–100, with brief rationale)
2. **Projected Portfolio at Retirement** (range based on return assumptions)
3. **Monthly Income in Retirement** (from all sources — portfolio, SS, other)
4. **Retirement Gap Analysis** (shortfall or surplus vs. stated expenses + goals)
5. **Goal Feasibility** (quick assessment of each stated goal)
6. **Key Risks to Address** (top 3–4, specific to this client)
7. **Recommended Actions** (3–5 specific steps, prioritized)
8. **Bottom Line** (one paragraph — what you'd tell them in person)

Use their actual figures. Be specific with numbers.`

    try {
      const res = await fetch('/api/retire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      const reply = data.text || 'Something went wrong — try again.'
      setAnalysis(reply)
      setChatHistory([{ role: 'assistant', content: reply }])
      setGenerated(true)
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch {
      setAnalysis('Connection issue. Check your internet and try again.')
      setGenerated(true)
    }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: SURFACE, border: `1px solid ${BORDER}`,
    borderRadius: '8px', padding: '10px 14px', fontSize: '14px',
    color: '#FAFAFA', fontFamily: "'Inter', sans-serif", outline: 'none',
    boxSizing: 'border-box' as const,
  }
  const labelStyle: React.CSSProperties = {
    fontSize: '10px', fontWeight: 700, letterSpacing: '2px',
    textTransform: 'uppercase', color: GRAY, display: 'block', marginBottom: '8px',
  }
  const chipStyle = (active: boolean): React.CSSProperties => ({
    background: active ? `${GREEN}15` : SURFACE,
    border: `1px solid ${active ? GREEN : BORDER}`,
    borderRadius: '20px', padding: '6px 14px', fontSize: '12px',
    cursor: 'pointer', color: active ? GREEN : GRAY,
    fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
  })

  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: GREEN, fontWeight: 700, marginBottom: '16px' }}>
        Live Demo · Retirement Planning
      </div>
      <h2 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '12px', lineHeight: '1.1' }}>
        Build a Plan<br /><span style={{ color: GREEN }}>In the Room.</span>
      </h2>
      <p style={{ fontSize: '15px', color: LIGHT_GRAY, lineHeight: '1.7', marginBottom: '12px' }}>
        Pre-loaded with a sample client profile — The Millers, a married couple 10 years from retirement. Walk through it, adjust any inputs, and generate a Landmark-style analysis on the spot.
      </p>
      <div style={{ background: `${GREEN}08`, border: `1px solid ${GREEN}20`, borderRadius: '8px', padding: '12px 16px', marginBottom: '32px', fontSize: '13px', color: '#4ADE80' }}>
        💡 Try changing the annual contribution or removing a goal — then regenerate to see how the plan shifts.
      </div>

      {/* Input grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div>
          <label style={labelStyle}>Client Name</label>
          <input style={inputStyle} value={inputs.clientName} onChange={e => setInputs(p => ({ ...p, clientName: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Risk Tolerance</label>
          <select style={{ ...inputStyle, appearance: 'none' }} value={inputs.riskTolerance} onChange={e => setInputs(p => ({ ...p, riskTolerance: e.target.value }))}>
            {['Conservative', 'Moderate', 'Moderate Growth', 'Growth', 'Aggressive Growth'].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Client Age</label>
          <input style={inputStyle} value={inputs.clientAge} onChange={e => setInputs(p => ({ ...p, clientAge: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Spouse Age</label>
          <input style={inputStyle} value={inputs.spouseAge} onChange={e => setInputs(p => ({ ...p, spouseAge: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Target Retirement Age</label>
          <input style={inputStyle} value={inputs.retirementAge} onChange={e => setInputs(p => ({ ...p, retirementAge: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Current Savings ($)</label>
          <input style={inputStyle} value={inputs.currentSavings} onChange={e => setInputs(p => ({ ...p, currentSavings: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Annual Contributions ($)</label>
          <input style={inputStyle} value={inputs.annualContrib} onChange={e => setInputs(p => ({ ...p, annualContrib: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Expected Return (% / yr)</label>
          <input style={inputStyle} value={inputs.expectedReturn} onChange={e => setInputs(p => ({ ...p, expectedReturn: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Combined Household Income ($)</label>
          <input style={inputStyle} value={inputs.currentIncome} onChange={e => setInputs(p => ({ ...p, currentIncome: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Monthly Expenses ($)</label>
          <input style={inputStyle} value={inputs.monthlyExpenses} onChange={e => setInputs(p => ({ ...p, monthlyExpenses: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Social Security Est. ($/mo, combined at 67)</label>
          <input style={inputStyle} value={inputs.socialSecurity} onChange={e => setInputs(p => ({ ...p, socialSecurity: e.target.value }))} />
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Client Goals (select all that apply)</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {goalOptions.map(g => (
            <button key={g} type="button" style={chipStyle(inputs.goals.includes(g))} onClick={() => toggleGoal(g)}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <label style={labelStyle}>Additional Context / Notes</label>
        <textarea
          style={{ ...inputStyle, resize: 'vertical' as const }}
          rows={3}
          value={inputs.extraNotes}
          onChange={e => setInputs(p => ({ ...p, extraNotes: e.target.value }))}
        />
      </div>

      <button
        onClick={generate}
        disabled={loading}
        style={{
          background: loading ? `${GREEN}40` : GREEN,
          color: BG, border: 'none', borderRadius: '10px',
          padding: '16px 36px', fontSize: '16px', fontWeight: 800,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: "'Inter', sans-serif",
          display: 'flex', alignItems: 'center', gap: '10px',
          transition: 'background 0.15s',
        }}
      >
        {loading ? (
          <>
            <span style={{ display: 'inline-flex', gap: '3px' }}>
              {[0,1,2].map(i => <span key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: BG, opacity: 0.7, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
            </span>
            Generating Landmark Analysis...
          </>
        ) : (
          <>
            {generated ? '↺ Regenerate Analysis' : '→ Generate Landmark Analysis'}
          </>
        )}
      </button>

      {/* Output */}
      {(analysis || loading) && (
        <div ref={outputRef} style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ height: '3px', width: '32px', background: GREEN, borderRadius: '2px' }} />
            <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: GREEN, fontWeight: 700 }}>
              Landmark Analysis — {inputs.clientName}
            </div>
          </div>
          <div style={{
            background: SURFACE, border: `1px solid ${GREEN}30`,
            borderRadius: '12px', padding: '28px 32px',
            fontSize: '14px', color: LIGHT_GRAY, lineHeight: '1.8',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {loading ? (
              <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', color: GRAY }}>
                <span>Generating...</span>
                {[0,1,2].map(i => <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: GREEN, opacity: 0.5, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
              </span>
            ) : analysis}
          </div>
          {generated && !loading && (
            <div style={{ marginTop: '16px', fontSize: '12px', color: '#333', textAlign: 'right' }}>
              Powered by AxiomStream Group · Landmark Wealth Management
            </div>
          )}
        </div>
      )}

      {/* Follow-up chat */}
      {generated && !loading && (
        <div style={{ marginTop: '40px', borderTop: `1px solid ${BORDER}`, paddingTop: '32px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: GREEN, fontWeight: 700, marginBottom: '16px' }}>
            Follow-up Questions
          </div>
          {chatHistory.slice(1).map((msg, i) => (
            <div key={i} style={{
              marginBottom: '16px',
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '80%',
                background: msg.role === 'user' ? `${GREEN}15` : SURFACE,
                border: `1px solid ${msg.role === 'user' ? GREEN + '30' : BORDER}`,
                borderRadius: '10px', padding: '14px 18px',
                fontSize: '14px', color: LIGHT_GRAY, lineHeight: '1.7',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '14px 18px' }}>
                <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', color: GRAY }}>
                  {[0,1,2].map(i => <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: GREEN, opacity: 0.5, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <input
              style={{ ...inputStyle, flex: 1, padding: '14px 16px' }}
              placeholder="Ask a follow-up question about this analysis..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={async e => {
                if (e.key === 'Enter' && chatInput.trim() && !chatLoading) {
                  const userMsg = chatInput.trim()
                  setChatInput('')
                  const newHistory = [...chatHistory, { role: 'user' as const, content: userMsg }]
                  setChatHistory(newHistory)
                  setChatLoading(true)
                  setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
                  try {
                    const res = await fetch('/api/retire', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ prompt: userMsg, history: newHistory.slice(0, -1) }),
                    })
                    const data = await res.json()
                    const reply = data.text || 'Something went wrong.'
                    setChatHistory(h => [...h, { role: 'assistant', content: reply }])
                  } catch {
                    setChatHistory(h => [...h, { role: 'assistant', content: 'Connection issue — try again.' }])
                  }
                  setChatLoading(false)
                  setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
                }
              }}
              disabled={chatLoading}
            />
            <button
              onClick={async () => {
                if (!chatInput.trim() || chatLoading) return
                const userMsg = chatInput.trim()
                setChatInput('')
                const newHistory = [...chatHistory, { role: 'user' as const, content: userMsg }]
                setChatHistory(newHistory)
                setChatLoading(true)
                setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
                try {
                  const res = await fetch('/api/retire', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: userMsg, history: newHistory.slice(0, -1) }),
                  })
                  const data = await res.json()
                  const reply = data.text || 'Something went wrong.'
                  setChatHistory(h => [...h, { role: 'assistant', content: reply }])
                } catch {
                  setChatHistory(h => [...h, { role: 'assistant', content: 'Connection issue — try again.' }])
                }
                setChatLoading(false)
                setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
              }}
              disabled={chatLoading || !chatInput.trim()}
              style={{
                background: GREEN, color: BG, border: 'none', borderRadius: '8px',
                padding: '14px 20px', fontSize: '14px', fontWeight: 700,
                cursor: chatLoading || !chatInput.trim() ? 'not-allowed' : 'pointer',
                opacity: chatLoading || !chatInput.trim() ? 0.4 : 1,
                fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap',
              }}
            >Send →</button>
          </div>
          <div style={{ fontSize: '11px', color: '#333', marginTop: '8px' }}>Press Enter or click Send</div>
        </div>
      )}

      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.8);opacity:0.4} 40%{transform:scale(1.1);opacity:1} }`}</style>
    </div>
  )
}

// ─── DOCUMENTS ───────────────────────────────────────────────────────────────

interface RagDocument {
  id: string
  filename: string
  file_type: string
  status: 'processing' | 'ready' | 'error'
  chunk_count: number
  file_size_bytes: number
  created_at: string
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
    } catch (e: any) {
      setUploadStatus(`❌ Error: ${e.message || 'Upload failed'}`)
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

  function statusColor(status: string) {
    if (status === 'ready') return '#34D399'
    if (status === 'error') return '#ef4444'
    return GOLD
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
      <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: TEAL, fontWeight: 700, marginBottom: '16px' }}>
        Knowledge Base
      </div>
      <h2 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '12px', lineHeight: '1.1' }}>
        Documents
      </h2>
      <p style={{ fontSize: '15px', color: LIGHT_GRAY, lineHeight: '1.7', marginBottom: '28px' }}>
        Upload documents to your knowledge base. Kit will retrieve relevant context from these files when you ask questions in chat.
      </p>

      {/* Upload area */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? TEAL : BORDER}`,
          borderRadius: '12px',
          background: dragOver ? `${TEAL}08` : '#0d0d0d',
          padding: '40px 24px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s',
          marginBottom: '16px',
          opacity: uploading ? 0.6 : 1,
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
        <div style={{ fontSize: '15px', fontWeight: 600, color: '#FAFAFA', marginBottom: '6px' }}>
          {uploading ? 'Processing…' : 'Drop files here or click to browse'}
        </div>
        <div style={{ fontSize: '12px', color: GRAY }}>
          Accepts: .pdf, .docx, .txt, .md, .csv · Max 10MB
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md,.csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {uploadStatus && (
        <div style={{
          background: uploadStatus.startsWith('✅') ? `${TEAL}15` : uploadStatus.startsWith('❌') ? '#ef444415' : `${GOLD}15`,
          border: `1px solid ${uploadStatus.startsWith('✅') ? TEAL : uploadStatus.startsWith('❌') ? '#ef4444' : GOLD}30`,
          borderRadius: '8px', padding: '12px 16px',
          fontSize: '13px', color: LIGHT_GRAY, marginBottom: '20px',
        }}>
          {uploadStatus}
        </div>
      )}

      {/* Document list */}
      {docs.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: GRAY, fontSize: '14px', background: SURFACE, borderRadius: '10px', border: `1px solid ${BORDER}` }}>
          No documents uploaded yet. Upload a file above to get started.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {docs.map(doc => (
            <div key={doc.id} style={{
              background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px',
              padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <div style={{ fontSize: '20px', flexShrink: 0 }}>
                {doc.file_type === 'pdf' ? '📕' : doc.file_type === 'docx' ? '📘' : '📄'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#FAFAFA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.filename}
                </div>
                <div style={{ fontSize: '12px', color: GRAY, marginTop: '3px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <span>{fmtDate(doc.created_at)}</span>
                  {doc.file_size_bytes > 0 && <span>{fmtBytes(doc.file_size_bytes)}</span>}
                  {doc.status === 'ready' && <span>{doc.chunk_count} chunks</span>}
                </div>
              </div>
              <div style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
                color: statusColor(doc.status), background: `${statusColor(doc.status)}15`,
                border: `1px solid ${statusColor(doc.status)}30`,
                borderRadius: '4px', padding: '3px 8px', flexShrink: 0,
              }}>
                {doc.status}
              </div>
              <button
                onClick={() => deleteDoc(doc.id)}
                style={{
                  background: 'none', border: `1px solid #ef444430`, borderRadius: '6px',
                  color: '#ef4444', fontSize: '12px', padding: '4px 10px', cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif", flexShrink: 0, transition: 'all 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#ef444415'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '24px', fontSize: '12px', color: '#333', lineHeight: '1.6' }}>
        Documents are indexed into Kit's knowledge base and retrieved automatically when relevant to your questions.
      </div>
    </div>
  )
}
