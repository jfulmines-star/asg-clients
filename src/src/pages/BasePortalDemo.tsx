/**
 * BasePortalDemo — POC of Sean's portal rebuilt on BasePortal.
 * Route: /base-demo
 * 
 * Sean's content, branding, and logic — zero changes.
 * Shell (PIN gate, layout, nav, mobile) handled by BasePortal.
 * 
 * DevalkSeanPortal.tsx is NOT touched until JJ approves this demo.
 */

import { useState, useRef } from 'react'
import mammoth from 'mammoth'
import BasePortal, {
  ChatSection,
  CopyButton,
  PortalConfig,
  DEFAULT_DARK_THEME,
  useIsMobile,
} from '../components/portal/BasePortal'

// ─── Config ───────────────────────────────────────────────────────────────────

const ACCENT = '#4F6BFF'

const SEAN_CONFIG: PortalConfig = {
  clientName: 'Sean D. Lair',
  firmName: 'DeValk Power Lair & Warner',
  agentName: 'Lex',
  pin: '1604',
  slug: 'devalk-sean',
  theme: {
    ...DEFAULT_DARK_THEME,
    accent: ACCENT,
  },
  navItems: [
    { id: 'welcome', label: 'Welcome', icon: '👋' },
    { id: 'documents', label: 'Document Analyzer', icon: '📄' },
    { id: 'nyslaw', label: 'NYS Quick Reference', icon: '📚' },
    { id: 'chat', label: 'Chat with Lex', icon: '💬' },
  ],
  defaultSection: 'chat',
  disableTeamContext: true,
  enableChat: true,
}

// ─── Welcome Section ──────────────────────────────────────────────────────────

function WelcomeSection({ onNavigate }: { onNavigate: (s: string) => void }) {
  const isMobile = useIsMobile()
  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: ACCENT, fontWeight: 700, marginBottom: '12px' }}>
        Powered by AxiomStream Group
      </div>
      <h1 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px', lineHeight: 1.1 }}>
        Welcome, Sean.
      </h1>
      <p style={{ fontSize: '17px', color: '#999', lineHeight: 1.7, marginBottom: '32px', maxWidth: '540px' }}>
        Lex was configured specifically for your practice — DeValk Power Lair & Warner, NYS family law, divorce, estates, and real estate closings. Drop in a document or ask anything.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
        {[
          { id: 'documents', icon: '📄', color: ACCENT, title: 'Document Analyzer', desc: 'Drag in any agreement, order, or deed. Lex reads it and gives you the key points, deadlines, and action items.' },
          { id: 'nyslaw', icon: '📚', color: '#A78BFA', title: 'NYS Quick Reference', desc: 'DRL, FCA, CPLR, RPL, SCPA — key rules and deadlines organized by practice area. Copy with one click.' },
          { id: 'chat', icon: '💬', color: ACCENT, title: 'Chat with Lex', desc: 'Your Lex instance. Already knows your practice, your counties, your 22 years in NYS law. Case research, drafting, anything.' },
        ].map(card => (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            style={{
              background: '#111111',
              border: '1px solid #1F1F1F',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = card.color + '60')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#1F1F1F')}
          >
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>{card.icon}</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#FAFAFA', marginBottom: '8px' }}>{card.title}</div>
            <div style={{ fontSize: '14px', color: '#9CA3AF', lineHeight: 1.6 }}>{card.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ background: '#111111', border: '1px solid #1F1F1F', borderRadius: '12px', padding: '20px', maxWidth: '480px' }}>
        <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: ACCENT, fontWeight: 700, marginBottom: '8px' }}>Your Practice Profile</div>
        <div style={{ display: 'grid', gap: '6px' }}>
          {[
            ['Firm', 'DeValk Power Lair & Warner'],
            ['Admitted', 'New York State, 2004'],
            ['Practice', 'Divorce · Family Law · Wills/Estates · Real Estate'],
            ['Counties', 'Wayne, Monroe, Ontario, Seneca, Cayuga, Yates'],
            ['Litigation', '70% of practice'],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
              <span style={{ color: '#6B7280', minWidth: '80px', flexShrink: 0 }}>{label}</span>
              <span style={{ color: '#FAFAFA' }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Document Analyzer ────────────────────────────────────────────────────────

function DocumentAnalyzerSection() {
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState('')
  const [question, setQuestion] = useState('')
  const [docContent, setDocContent] = useState('')
  const [asking, setAsking] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function analyzeFile(file: File) {
    setFileName(file.name)
    setResult('')
    setDocContent('')

    const isDocxFile = file.name.toLowerCase().endsWith('.docx')
    const MAX_BINARY_MB = 3
    if (!isDocxFile && file.size > MAX_BINARY_MB * 1024 * 1024) {
      setResult(`This file is ${(file.size / 1024 / 1024).toFixed(1)}MB — too large to upload directly.\n\nOptions:\n1. Compress the PDF at smallpdf.com\n2. Save as .docx and upload that instead\n3. Copy the key sections and paste into Chat with Lex`)
      return
    }

    setAnalyzing(true)

    try {
      const isDocx = isDocxFile
      if (isDocx) {
        const arrayBuffer = await file.arrayBuffer()
        const { value: extractedText } = await mammoth.extractRawText({ arrayBuffer })
        if (!extractedText.trim()) {
          setResult('Could not extract text from this Word document. Try saving as PDF and uploading again.')
          setAnalyzing(false)
          return
        }
        const truncated = extractedText.slice(0, 12000)
        setDocContent(extractedText)
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent: 'Lex', slug: 'devalk-sean', disableTeamContext: true,
            teamMember: 'Sean Lair', isLead: true,
            message: `Document: "${file.name}"\n\n${truncated}\n\n---\nAnalyze: 1) Type and purpose. 2) Key legal points. 3) Deadlines. 4) Action items. Plain text only.`,
            history: [],
          }),
        })
        const data = await res.json()
        setResult(data.reply || data.text || 'Analysis failed — try again.')
      } else if (file.name.toLowerCase().endsWith('.doc')) {
        setResult('Legacy .doc format cannot be read directly. Save as .docx or PDF and upload again.')
      } else {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const base64 = (e.target?.result as string).split(',')[1] || ''
          setDocContent(base64)
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agent: 'Lex', slug: 'devalk-sean', disableTeamContext: true,
              teamMember: 'Sean Lair', isLead: true,
              message: `Analyze "${file.name}": 1) Type and purpose. 2) Key legal points. 3) Deadlines. 4) Action items. Plain text only.`,
              history: [], documentBase64: base64, documentName: file.name, documentType: file.type,
            }),
          })
          if (!res.ok) {
            setResult(res.status === 413
              ? `File too large (${(file.size/1024/1024).toFixed(1)}MB). Compress at smallpdf.com or paste the text into Chat.`
              : `Upload failed (${res.status}). Try a smaller file or paste text into chat.`)
            setAnalyzing(false)
            return
          }
          const data = await res.json()
          setResult(data.reply || data.text || 'Analysis failed — try again.')
          setAnalyzing(false)
        }
        reader.onerror = () => { setResult('Could not read this file.'); setAnalyzing(false) }
        reader.readAsDataURL(file)
        return
      }
    } catch {
      setResult('Error analyzing document. Try uploading as PDF or pasting the text directly.')
    }
    setAnalyzing(false)
  }

  async function askQuestion() {
    if (!question.trim() || !docContent || asking) return
    setAsking(true)
    const q = question.trim()
    setQuestion('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: 'Lex', slug: 'devalk-sean', disableTeamContext: true,
          teamMember: 'Sean Lair', isLead: true,
          message: `Document: "${fileName}"\n\n${docContent.slice(0, 8000)}\n\n---\nFollow-up: ${q}. Plain text only.`,
          history: [],
        }),
      })
      const data = await res.json()
      setResult(prev => prev + '\n\nFollow-up: ' + q + '\n\n' + (data.reply || data.text || 'No response'))
    } catch {
      setResult(prev => prev + '\n\nError on follow-up. Try again.')
    }
    setAsking(false)
  }

  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: ACCENT, fontWeight: 700, marginBottom: '8px' }}>Lex</div>
      <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '8px' }}>Document Analyzer</h2>
      <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6, marginBottom: '24px' }}>
        Drop in any legal document. Lex reads it and gives you the key points and action items in plain text.
      </p>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) analyzeFile(f) }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? ACCENT : '#1F1F1F'}`,
          borderRadius: '12px', padding: '40px',
          textAlign: 'center', cursor: 'pointer',
          background: dragging ? `${ACCENT}08` : '#111111',
          transition: 'all 0.15s', marginBottom: '24px',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📂</div>
        <div style={{ fontSize: '15px', fontWeight: 600, color: '#FAFAFA', marginBottom: '6px' }}>
          {dragging ? 'Drop to analyze' : 'Drop a document here or tap to browse'}
        </div>
        <div style={{ fontSize: '12px', color: '#6B7280' }}>PDF · Word (.docx) · Images (scanned docs)</div>
        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) analyzeFile(f) }} />
      </div>

      {(analyzing || result) && (
        <div style={{ background: '#111111', border: '1px solid #1F1F1F', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          {fileName && (
            <div style={{ fontSize: '11px', color: ACCENT, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
              📄 {fileName}
            </div>
          )}
          {analyzing ? (
            <div style={{ color: '#6B7280', fontSize: '14px' }}>Analyzing document...</div>
          ) : (
            <>
              <div style={{ fontSize: '14px', color: '#FAFAFA', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{result}</div>
              <CopyButton text={result} label="Copy Analysis" accent={ACCENT} />
            </>
          )}
        </div>
      )}

      {result && !analyzing && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && askQuestion()}
            placeholder="Ask a follow-up about this document..."
            style={{
              flex: 1, background: '#0d0d0d', border: '1px solid #1F1F1F', borderRadius: '8px',
              padding: '10px 14px', fontSize: '17px', color: '#FAFAFA',
              fontFamily: "'Inter', sans-serif", outline: 'none',
            }}
          />
          <button onClick={askQuestion} disabled={asking || !question.trim()} style={{
            background: ACCENT, border: 'none', borderRadius: '8px',
            padding: '10px 18px', fontSize: '14px', fontWeight: 700,
            color: '#fff', cursor: 'pointer', opacity: asking || !question.trim() ? 0.5 : 1,
            fontFamily: "'Inter', sans-serif",
          }}>
            {asking ? '...' : 'Ask'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── NYS Quick Reference ──────────────────────────────────────────────────────

function NYSLawSection() {
  const refs = [
    {
      title: 'Divorce — DRL',
      color: ACCENT,
      content: `No-fault divorce: DRL 170(7) — irretrievable breakdown for 6+ months.

Equitable distribution: DRL 236B — 14 factors, marital vs. separate property. Duration of marriage, each spouse's income and earning capacity, age/health, contributions to career, custody arrangements.

Maintenance (alimony): Advisory formula — 20% of payor's income minus 25% of payee's income. Check CSSA interaction. Temporary vs. post-divorce maintenance differ.

Child support: CSSA 413 — 17% (1 child), 25% (2), 29% (3), 31% (4), 35% (5+). Combined parental income cap: $163,000 (2023, adjusted periodically).

Venue: Supreme Court only — Family Court has no divorce jurisdiction.

Timeline: Uncontested 3-6 months with Judgment of Divorce. Contested can run 2+ years.`
    },
    {
      title: 'Custody & Family — FCA',
      color: '#34D399',
      content: `Modification standard: Substantial change in circumstances AND best interests of child.

Best interests factors: Domestic violence history, stability of each home, each parent's fitness, child's expressed preference (age/maturity dependent), sibling relationships, willingness to foster relationship with other parent, prior court orders.

UCCJEA jurisdiction: 6-month home state rule. Emergency jurisdiction available. Enforcement of other states' orders.

Orders of Protection: FCA Article 8 — family offense proceedings. Temporary OPs ex parte, final OPs after hearing. Duration up to 5 years for aggravated circumstances.

Support: CSSA controls. Gross income basis. Income imputation for voluntarily underemployed.

Paternity: FCA Article 5 — DNA testing standard. Order of filiation establishes rights and obligations.`
    },
    {
      title: 'Estates & Wills — SCPA',
      color: '#FB923C',
      content: `Probate: SCPA 1402-1408 — file will with Surrogate's Court, jurisdiction in county of domicile. Publication required. Letters Testamentary to executor.

Intestate Administration: SCPA 1001 — distributee priority: spouse, children, parents, siblings.

NYS Estate Tax: Exemption $7.16M (2024). Cliff tax if estate exceeds 105% of exemption.

Federal Estate Tax: $13.61M exemption per person (2024). Portability available.

Will execution: SCPA 1405 — signed at end, two witnesses, testator must declare it's their will. Holographic wills NOT valid in NYS.

Small Estate: SCPA 1301 — Voluntary Administration for estates under $50,000.`
    },
    {
      title: 'CPLR — Key Deadlines',
      color: '#F472B6',
      content: `Statutes of Limitations:
Personal injury: 3 years
Medical malpractice: 2 years 6 months
Contract: 6 years
Fraud: 6 years or 2 years from discovery
Defamation: 1 year
Wrongful death: 2 years

Service of process: CPLR 308
Personal delivery: anytime
Substituted service: leave and mail within 20 days
Nail-and-mail: affix to door + mail, only if others impracticable

Motion practice: CPLR 2214 — 8 days notice. Order to Show Cause can shorten.

NYSCEF: Mandatory e-filing in Monroe County Supreme Court and Family Court.

Appeals: CPLR Article 55 — 30 days from service of order with notice of entry.`
    },
  ]

  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: ACCENT, fontWeight: 700, marginBottom: '8px' }}>Reference</div>
      <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '8px' }}>NYS Quick Reference</h2>
      <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6, marginBottom: '24px' }}>Key rules for your practice areas. Copy any card to paste into briefs or notes.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {refs.map(ref => (
          <div key={ref.title} style={{ background: '#111111', border: '1px solid #1F1F1F', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: ref.color, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{ref.title}</div>
              <CopyButton text={ref.content} accent={ref.color} />
            </div>
            <div style={{ fontSize: '13px', color: '#CCCCCC', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{ref.content}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BasePortalDemo() {
  return (
    <BasePortal
      config={SEAN_CONFIG}
      agentIcon="⚖️"
      agentTagline="Legal Intelligence Platform"
    >
      {(section, isMobile) => {
        if (section === 'welcome') return <WelcomeSection onNavigate={(s) => {
          window.history.pushState({}, '', `#${s}`)
          window.dispatchEvent(new PopStateEvent('popstate'))
        }} />
        if (section === 'documents') return <DocumentAnalyzerSection />
        if (section === 'nyslaw') return <NYSLawSection />
        if (section === 'chat') return <ChatSection config={SEAN_CONFIG} isMobile={isMobile} />
        return null
      }}
    </BasePortal>
  )
}
