import { useState, useRef, useEffect } from 'react'
import mammoth from 'mammoth'

const PIN = '1604'
const ACCENT = '#4F6BFF'
const BG = '#0A0A0A'
const SURFACE = '#111111'
const BORDER = '#1F1F1F'
const GRAY = '#6B7280'

type Section = 'welcome' | 'documents' | 'nyslaw' | 'chat'

const NAV_ITEMS: { id: Section; label: string; icon: string; tag?: string }[] = [
  { id: 'welcome', label: 'Welcome', icon: '👋' },
  { id: 'documents', label: 'Document Analyzer', icon: '📄' },
  { id: 'nyslaw', label: 'NYS Quick Reference', icon: '📚' },
  { id: 'chat', label: 'Chat with Lex', icon: '💬' },
]

interface ChatMessage { role: 'user' | 'assistant'; content: string }

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

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(stripMarkdown(text)); setCopied(true); setTimeout(() => setCopied(false), 1800) }}
      style={{
        background: copied ? `${ACCENT}30` : 'transparent',
        border: `1px solid ${copied ? ACCENT : '#333'}`,
        borderRadius: '6px', padding: '3px 10px',
        fontSize: '11px', fontWeight: 600,
        color: copied ? ACCENT : '#666',
        cursor: 'pointer', fontFamily: "'Inter', sans-serif",
        transition: 'all 0.15s', marginTop: '6px',
      }}
    >
      {copied ? '✓ Copied' : label}
    </button>
  )
}

// ─── Welcome Section ─────────────────────────────────────────────────────────
function WelcomeSection({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const isMobile = useIsMobile()
  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: ACCENT, fontWeight: 700, marginBottom: '12px' }}>
        Powered by AxiomStream Group
      </div>
      <h1 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px', lineHeight: 1.1 }}>
        Welcome, Sean.
      </h1>
      <p style={{ fontSize: '16px', color: '#999', lineHeight: 1.7, marginBottom: '32px', maxWidth: '540px' }}>
        Lex was configured specifically for your practice — DeValk Power Lair & Warner, NYS family law, divorce, estates, and real estate closings. Drop in a document or ask anything.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
        {[
          { id: 'documents' as Section, icon: '📄', color: ACCENT, title: 'Document Analyzer', desc: 'Drag in any agreement, order, or deed. Lex reads it and gives you the key points, deadlines, and action items.' },
          { id: 'nyslaw' as Section, icon: '📚', color: '#A78BFA', title: 'NYS Quick Reference', desc: 'DRL, FCA, CPLR, RPL, SCPA — key rules and deadlines organized by practice area. Copy with one click.' },
          { id: 'chat' as Section, icon: '💬', color: ACCENT, title: 'Chat with Lex', desc: 'Your Lex instance. Already knows your practice, your counties, your 22 years in NYS law. Case research, drafting, anything.' },
        ].map(card => (
          <button key={card.id} onClick={() => onNavigate(card.id)} style={{
            background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px',
            padding: '20px', textAlign: 'left', cursor: 'pointer',
            transition: 'border-color 0.15s', fontFamily: "'Inter', sans-serif",
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = card.color + '60')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = BORDER)}
          >
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>{card.icon}</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#FAFAFA', marginBottom: '8px' }}>{card.title}</div>
            <div style={{ fontSize: '14px', color: '#9CA3AF', lineHeight: 1.6 }}>{card.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', maxWidth: '480px' }}>
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
              <span style={{ color: GRAY, minWidth: '80px', flexShrink: 0 }}>{label}</span>
              <span style={{ color: '#FAFAFA' }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Document Analyzer ───────────────────────────────────────────────────────
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

    // File size check — Vercel body limit is 4.5MB; base64 adds ~33% overhead
    // Safe limit: 3MB for PDFs/images, no limit for .docx (text-extracted, not sent as binary)
    const isDocxFile = file.name.toLowerCase().endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    const MAX_BINARY_MB = 3
    if (!isDocxFile && file.size > MAX_BINARY_MB * 1024 * 1024) {
      setResult(`This file is ${(file.size / 1024 / 1024).toFixed(1)}MB — too large to upload directly.\n\nOptions:\n1. For a scanned PDF, try compressing it first (use Adobe Acrobat or smallpdf.com).\n2. For a Word doc, save as .docx and upload that instead.\n3. Copy and paste the key sections directly into Chat with Lex.`)
      return
    }

    setAnalyzing(true)

    try {
      const isDocx = isDocxFile
      const isDoc = file.name.toLowerCase().endsWith('.doc')

      if (isDocx) {
        // Extract plain text from docx using mammoth, then send as message text
        const arrayBuffer = await file.arrayBuffer()
        const { value: extractedText } = await mammoth.extractRawText({ arrayBuffer })
        if (!extractedText.trim()) {
          setResult('Could not extract text from this Word document. Try saving as PDF and uploading again.')
          setAnalyzing(false)
          return
        }
        const truncated = extractedText.slice(0, 12000) // stay within token limits
        const docMsg = `Document: "${file.name}"\n\n${truncated}\n\n---\nPlease analyze this document: 1) What type of document is this and what is its purpose. 2) Key legal points, obligations, and rights. 3) Any deadlines, dates, or time-sensitive items. 4) Recommended action items. Plain text only — no markdown, no bold, no headers.`
        setDocContent(extractedText)
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent: 'Lex',
            slug: 'devalk-sean',
            disableTeamContext: true,
            teamMember: 'Sean Lair',
            isLead: true,
            message: docMsg,
            history: [],
          }),
        })
        const data = await res.json()
        setResult(data.reply || data.text || data.message || 'Analysis failed — try again.')
      } else if (isDoc) {
        setResult('Legacy .doc format cannot be read directly. Save the file as .docx or PDF and upload again.')
      } else {
        // PDF or image — send base64 via vision/document API
        const reader = new FileReader()
        reader.onload = async (e) => {
          const base64 = (e.target?.result as string).split(',')[1] || ''
          setDocContent(base64)
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agent: 'Lex',
              slug: 'devalk-sean',
              disableTeamContext: true,
              teamMember: 'Sean Lair',
              isLead: true,
              message: `Analyze this document called "${file.name}": 1) What type is it and what is its purpose. 2) Key legal points, obligations, and rights. 3) Deadlines, dates, time-sensitive items. 4) Recommended action items. Plain text only — no markdown, no bold.`,
              history: [],
              documentBase64: base64,
              documentName: file.name,
              documentType: file.type,
            }),
          })
          if (!res.ok) {
            if (res.status === 413) {
              setResult(`File too large for direct upload (${(file.size / 1024 / 1024).toFixed(1)}MB).\n\nTry:\n1. Compress the PDF at smallpdf.com\n2. Upload as .docx instead\n3. Copy the key sections and paste into Chat with Lex`)
            } else {
              const errData = await res.json().catch(() => ({}))
              setResult(errData.reply || `Upload failed (${res.status}). Try a smaller file or paste the text into chat.`)
            }
            setAnalyzing(false)
            return
          }
          const data = await res.json()
          setResult(data.reply || data.text || data.message || 'Analysis failed — try again.')
          setAnalyzing(false)
        }
        reader.onerror = () => {
          setResult('Could not read this file. Make sure it\'s not corrupted and try again.')
          setAnalyzing(false)
        }
        reader.readAsDataURL(file)
        return // async path — analyzing(false) set in onload above
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setResult(`Upload failed: ${msg}\n\nIf the file is large, try compressing it first. Or paste the key text directly into Chat with Lex.`)
    }
    setAnalyzing(false)
  }

  async function askQuestion() {
    if (!question.trim() || !docContent || asking) return
    setAsking(true)
    const q = question.trim()
    setQuestion('')
    try {
      const isTextContent = !fileName.toLowerCase().endsWith('.pdf') && !fileName.match(/\.(png|jpg|jpeg)$/i)
      const body = isTextContent
        ? {
            agent: 'Lex',
            slug: 'devalk-sean',
            disableTeamContext: true,
            teamMember: 'Sean Lair',
            isLead: true,
            message: `Document: "${fileName}"\n\n${docContent.slice(0, 8000)}\n\n---\nFollow-up question: ${q}. Plain text answer only, no markdown.`,
            history: [],
          }
        : {
            agent: 'Lex',
            slug: 'devalk-sean',
            disableTeamContext: true,
            teamMember: 'Sean Lair',
            isLead: true,
            message: `Regarding the document "${fileName}": ${q}. Plain text only, no markdown.`,
            history: [],
            documentBase64: docContent,
            documentName: fileName,
          }
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      setResult(prev => prev + '\n\nFollow-up: ' + q + '\n\n' + (data.reply || data.text || 'No response'))
    } catch {
      setResult(prev => prev + '\n\nError on follow-up. Try again.')
    }
    setAsking(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) analyzeFile(file)
  }

  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: ACCENT, fontWeight: 700, marginBottom: '8px' }}>Lex</div>
      <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '8px' }}>Document Analyzer</h2>
      <p style={{ fontSize: '14px', color: GRAY, lineHeight: 1.6, marginBottom: '24px' }}>
        Drop in any legal document — agreement, court order, deed, will, custody order. Lex reads it and gives you the key points and action items. Output is clean plain text, ready to paste.
      </p>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? ACCENT : BORDER}`,
          borderRadius: '12px', padding: '40px',
          textAlign: 'center', cursor: 'pointer',
          background: dragging ? `${ACCENT}08` : SURFACE,
          transition: 'all 0.15s', marginBottom: '24px',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📂</div>
        <div style={{ fontSize: '15px', fontWeight: 600, color: '#FAFAFA', marginBottom: '6px' }}>
          {dragging ? 'Drop to analyze' : 'Drop a document here or click to browse'}
        </div>
        <div style={{ fontSize: '12px', color: GRAY }}>PDF · Word (.docx) · Images (scanned docs)</div>
        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) analyzeFile(f) }} />
      </div>

      {/* Analysis result */}
      {(analyzing || result) && (
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          {fileName && (
            <div style={{ fontSize: '11px', color: ACCENT, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
              📄 {fileName}
            </div>
          )}
          {analyzing ? (
            <div style={{ color: GRAY, fontSize: '14px' }}>Analyzing document<span style={{ animation: 'blink 1s infinite' }}>...</span></div>
          ) : (
            <>
              <div style={{ fontSize: '14px', color: '#FAFAFA', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {result}
              </div>
              <CopyButton text={result} label="Copy Analysis" />
            </>
          )}
        </div>
      )}

      {/* Follow-up question */}
      {result && !analyzing && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && askQuestion()}
            placeholder="Ask a follow-up about this document..."
            style={{
              flex: 1, background: '#0d0d0d', border: `1px solid ${BORDER}`, borderRadius: '8px',
              padding: '10px 14px', fontSize: '14px', color: '#FAFAFA',
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

// ─── Case Research ────────────────────────────────────────────────────────────
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
      title: 'Real Estate — RPL',
      color: '#A78BFA',
      content: `Deed types: Warranty deed (full covenants), Bargain and Sale deed (no covenants, common in NY), Quitclaim deed (no warranties), Executor's deed (from estate), Referee's deed (from foreclosure).

Title: 40-year search standard in Western NY. Title insurance standard for residential closings.

Transfer taxes: NYS — $4 per $1,000 of consideration. NYC additional (not applicable in Western NY). Mansion tax: 1% on residential sales over $1M.

Mortgage recording tax: Monroe County — 1.05% on mortgage amount. Wayne County — similar rates. First-time homebuyer exemptions available.

TRID/RESPA: Loan Estimate 3 days after application. Closing Disclosure 3 business days before closing.

Co-op vs. Condo: Co-op = proprietary lease + shares (board approval required). Condo = unit deed (no board approval for transfers in most cases).`
    },
    {
      title: 'Estates & Wills — SCPA',
      color: '#FB923C',
      content: `Probate: SCPA 1402-1408 — file will with Surrogate's Court, jurisdiction in county of domicile. Publication required (notice to creditors). Letters Testamentary to executor.

Intestate Administration: SCPA 1001 — distributee priority: spouse, children, parents, siblings. Letters of Administration to administrator.

NYS Estate Tax: Exemption $7.16M (2024, indexed). Cliff tax if estate exceeds 105% of exemption — entire estate taxable, not just excess. Top rate 16%.

Federal Estate Tax: $13.61M exemption per person (2024). Portability available for married couples.

Executor duties: Inventory assets, notify creditors (7 months), pay valid claims, file accountings, distribute to beneficiaries. Fiduciary duty — no self-dealing.

Small Estate: SCPA 1301 — Voluntary Administration for estates under $50,000 (excluding real property). Simpler process, no full probate.

Will execution: SCPA 1405 — signed at end, two witnesses, testator must declare it's their will. Holographic wills NOT valid in NYS.`
    },
    {
      title: 'CPLR — Key Deadlines',
      color: '#F472B6',
      content: `Statutes of Limitations:
Personal injury: 3 years from date of injury
Medical malpractice: 2 years 6 months from act or last treatment
Contract: 6 years
Fraud: 6 years from act or 2 years from discovery
Defamation: 1 year
Wrongful death: 2 years from death

Service of process: CPLR 308
Personal delivery: anytime
Substituted service: deliver to person of suitable age + mail within 20 days (leave and mail)
Nail-and-mail: affix to door + mail, only if other methods impracticable

Motion practice: CPLR 2214 — 8 days notice for regular motion. Order to Show Cause can shorten. Return dates in Monroe and Wayne County courts — check local rules.

NYSCEF: Mandatory e-filing in Monroe County Supreme Court and Family Court. Wayne County — check current requirements.

Preliminary injunctions: CPLR Article 63 — likelihood of success, irreparable harm, balance of equities.

Appeals: CPLR Article 55 — 30 days from service of order with notice of entry.`
    },
  ]

  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: ACCENT, fontWeight: 700, marginBottom: '8px' }}>Reference</div>
      <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '8px' }}>NYS Quick Reference</h2>
      <p style={{ fontSize: '14px', color: GRAY, lineHeight: 1.6, marginBottom: '24px' }}>Key rules for your practice areas. Copy any card to paste into briefs, emails, or notes.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {refs.map(ref => (
          <div key={ref.title} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: ref.color, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{ref.title}</div>
              <CopyButton text={ref.content} />
            </div>
            <div style={{ fontSize: '13px', color: '#CCCCCC', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{ref.content}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Chat Section ─────────────────────────────────────────────────────────────
function SeanChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [openerLoaded, setOpenerLoaded] = useState(false)
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md')
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastMsgRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileUploading, setFileUploading] = useState(false)

  const fontSizePx = fontSize === 'sm' ? '13px' : fontSize === 'lg' ? '17px' : '15px'

  useEffect(() => {
    if (openerLoaded) return
    setOpenerLoaded(true)
    setLoading(true)
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent: 'Lex',
        slug: 'devalk-sean',
        disableTeamContext: true,
        teamMember: 'Sean Lair',
        isLead: true,
        message: '__opener__',
        history: [],
      }),
    })
      .then(r => r.json())
      .then(data => {
        const reply = data.reply || data.text || 'Good to see you, Sean. What are we working on today?'
        setMessages([{ role: 'assistant', content: reply }])
        setLoading(false)
      })
      .catch(() => {
        setMessages([{ role: 'assistant', content: 'Good to see you, Sean. What are we working on today?' }])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (loading) {
      const el = scrollRef.current
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }, [loading])

  useEffect(() => {
    if (!loading && messages.length > 0 &&      messages[messages.length - 1].role === 'assistant') {
      lastMsgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [messages])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: 'Lex',
          slug: 'devalk-sean',
          disableTeamContext: true,
          teamMember: 'Sean Lair',
          isLead: true,
          message: userMsg,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || data.text || data.message || 'Something went wrong — try again.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection issue. Check your internet and try again.' }])
    }
    setLoading(false)
  }

  async function uploadFile(file: File) {
    setFileUploading(true)
    setMessages(prev => [...prev, { role: 'user', content: `📎 ${file.name}` }])
    try {
      const isDocx = file.name.toLowerCase().endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      if (isDocx) {
        const arrayBuffer = await file.arrayBuffer()
        const { value: extractedText } = await mammoth.extractRawText({ arrayBuffer })
        if (!extractedText.trim()) {
          setMessages(prev => [...prev.slice(0, -1), { role: 'assistant' as const, content: 'Could not read this Word document. Try saving as PDF and uploading again.' }])
          setFileUploading(false)
          return
        }
        const docMsg = `Document: "${file.name}"\n\n${extractedText.slice(0, 12000)}\n\n---\nSummarize the key legal points, obligations, deadlines, and action items in plain text. No markdown.`
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent: 'Lex',
            slug: 'devalk-sean',
            disableTeamContext: true,
            teamMember: 'Sean Lair',
            isLead: true,
            message: docMsg,
            history: messages.map(m => ({ role: m.role, content: m.content })),
          }),
        })
        const data = await res.json()
        setMessages(prev => [...prev.slice(0, -1), { role: 'assistant' as const, content: data.reply || data.text || `Document received: ${file.name}. Ask me anything about it.` }])
        setFileUploading(false)
        return
      }
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1] || ''
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent: 'Lex',
            slug: 'devalk-sean',
            disableTeamContext: true,
            teamMember: 'Sean Lair',
            isLead: true,
            message: `Analyze "${file.name}": key legal points, obligations, deadlines, action items. Plain text only.`,
            history: messages.map(m => ({ role: m.role, content: m.content })),
            documentBase64: base64,
            documentName: file.name,
            documentType: file.type,
          }),
        })
        const data = await res.json()
        setMessages(prev => [...prev.slice(0, -1), { role: 'user' as const, content: `📎 ${file.name}` }, { role: 'assistant' as const, content: data.reply || data.text || `Document received: ${file.name}. Ask me anything about it.` }])
      }
      reader.readAsDataURL(file)
    } catch {
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: `Upload failed for ${file.name}. Try again.` }])
    }
    setFileUploading(false)
  }

  const isMobile = useIsMobile()
  const msgFontSize = isMobile ? '17px' : fontSizePx

  // Mobile: fill entire parent (parent is flex column with minHeight:0)
  // Desktop: fixed height calc
  const containerStyle: React.CSSProperties = isMobile
    ? { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }
    : { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', maxWidth: '680px' }

  return (
    <div style={containerStyle}>

      {/* Desktop header only */}
      {!isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0 14px', flexShrink: 0 }}>
          <p style={{ fontSize: '13px', color: GRAY, margin: 0 }}>Your Lex instance — pre-loaded with practice context, counties, and NYS law.</p>
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['sm', 'md', 'lg'] as const).map((s, idx) => (
              <button key={s} onClick={() => setFontSize(s)} style={{ background: fontSize === s ? `${ACCENT}20` : 'transparent', border: `1px solid ${fontSize === s ? ACCENT : '#2a2a2a'}`, borderRadius: '4px', padding: '2px 7px', fontSize: idx === 0 ? '10px' : idx === 1 ? '12px' : '14px', color: fontSize === s ? ACCENT : '#444', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>A</button>
            ))}
          </div>
        </div>
      )}

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
          justifyContent: 'flex-end',
          gap: '20px',
          padding: isMobile ? '16px 12px' : '16px',
          background: isMobile ? BG : SURFACE,
          border: isMobile ? 'none' : `1px solid ${BORDER}`,
          borderRadius: isMobile ? '0' : '12px 12px 0 0',
        } as React.CSSProperties}
      >
        {messages.map((m, i) => (
          <div key={i} ref={i === messages.length - 1 ? lastMsgRef : undefined}
            style={{ display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', gap: '10px', alignItems: 'flex-end' }}
          >
            {/* Avatar */}
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0, background: m.role === 'user' ? '#1e3a5f' : `${ACCENT}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: m.role === 'user' ? '#60a5fa' : ACCENT }}>
              {m.role === 'user' ? 'S' : 'L'}
            </div>
            {/* Bubble */}
            <div style={{
              maxWidth: isMobile ? '82%' : '78%',
              background: m.role === 'user' ? '#1a2f50' : '#1a1a1a',
              borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              padding: isMobile ? '14px 16px' : '12px 16px',
              fontSize: msgFontSize,
              lineHeight: 1.7,
              color: '#F0F0F0',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {m.content}
              {m.role === 'assistant' && i > 0 && <CopyButton text={m.content} />}
            </div>
          </div>
        ))}
        {(loading || fileUploading) && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `${ACCENT}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: ACCENT }}>L</div>
            <div style={{ background: '#1a1a1a', borderRadius: '18px 18px 18px 4px', padding: '16px 20px' }}>
              <span style={{ display: 'inline-flex', gap: '6px' }}>
                {[0, 1, 2].map(j => <span key={j} style={{ width: '8px', height: '8px', borderRadius: '50%', background: ACCENT, opacity: 0.5, display: 'inline-block' }} />)}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        padding: isMobile ? '10px 12px' : '10px 0 0',
        background: isMobile ? '#0d0d0d' : 'transparent',
        borderTop: isMobile ? `1px solid ${BORDER}` : `1px solid ${BORDER}`,
      }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Attach document"
          style={{ background: 'transparent', border: `1px solid #333`, borderRadius: '10px', width: '44px', height: '44px', cursor: 'pointer', color: '#777', fontSize: '18px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >📎</button>
        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f) }} />
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Ask Lex anything..."
          rows={1}
          style={{
            flex: 1,
            background: '#161616',
            border: `1px solid #333`,
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '17px',
            color: '#F0F0F0',
            fontFamily: "'Inter', -apple-system, sans-serif",
            outline: 'none',
            resize: 'none',
            lineHeight: 1.4,
            minHeight: '46px',
            maxHeight: '120px',
          } as React.CSSProperties}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{ background: ACCENT, border: 'none', borderRadius: '12px', width: '48px', height: '48px', fontSize: '20px', color: '#fff', cursor: 'pointer', opacity: loading || !input.trim() ? 0.4 : 1, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >→</button>
      </div>
    </div>
  )
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

// ─── Main Portal ──────────────────────────────────────────────────────────────
export default function DevalkSeanPortal() {
  const [unlocked, setUnlocked] = useState(false)
  const [digits, setDigits] = useState(['', '', '', ''])
  const [pinError, setPinError] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>('chat')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()

  // Browser back/forward support within the portal
  useEffect(() => {
    if (!unlocked) return
    const onPop = () => {
      const hash = window.location.hash.replace('#', '') as Section
      const valid: Section[] = ['welcome', 'documents', 'nyslaw', 'chat']
      if (valid.includes(hash)) setActiveSection(hash)
      else setActiveSection('welcome')
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [unlocked])

  function navigateTo(section: Section) {
    window.history.pushState({}, '', `#${section}`)
    setActiveSection(section)
    setSidebarOpen(false)
  }

  function handleDigit(i: number, val: string) {
    const d = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]; next[i] = d; setDigits(next); setPinError(false)
    if (d && i < 3) { const el = document.getElementById(`pin-${i + 1}`); if (el) (el as HTMLInputElement).focus() }
    if (next.every(v => v !== '') && i === 3) setTimeout(() => checkPin(next), 80)
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) { const el = document.getElementById(`pin-${i - 1}`); if (el) (el as HTMLInputElement).focus() }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    const next = [...digits]; for (let i = 0; i < 4; i++) next[i] = text[i] || ''; setDigits(next)
    if (text.length === 4) setTimeout(() => checkPin(next), 80)
  }

  function checkPin(d = digits) {
    if (d.join('') === PIN) { setUnlocked(true) } else { setPinError(true); setDigits(['', '', '', '']); setTimeout(() => document.getElementById('pin-0')?.focus(), 50) }
  }

  if (!unlocked) {
    return (
      <div style={{ 
        position: 'fixed', inset: 0,
        background: BG, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '24px',
        fontFamily: "'Inter', -apple-system, sans-serif", 
        color: '#FAFAFA',
        overflowY: 'auto',
      }}>
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '340px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: ACCENT, fontWeight: 700, marginBottom: '20px' }}>AxiomStream Group</div>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚖️</div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>Lex</h1>
          <p style={{ color: '#888', fontSize: '15px', marginBottom: '36px' }}>Legal Intelligence Platform</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
            {digits.map((d, i) => (
              <input 
                key={i} 
                id={`pin-${i}`} 
                type="password" 
                inputMode="numeric" 
                maxLength={1} 
                value={d}
                onChange={e => handleDigit(i, e.target.value)} 
                onKeyDown={e => handleKeyDown(i, e)} 
                onPaste={handlePaste}
                autoFocus={i === 0}
                style={{ 
                  width: '68px', 
                  height: '76px', 
                  textAlign: 'center', 
                  fontSize: '32px', 
                  fontWeight: 700, 
                  background: '#222', 
                  border: `2px solid ${pinError ? '#ef4444' : d ? ACCENT : '#666'}`,
                  borderRadius: '14px', 
                  color: '#FAFAFA', 
                  fontFamily: "'Inter', sans-serif", 
                  outline: 'none', 
                  transition: 'border-color 0.15s',
                  boxSizing: 'border-box',
                } as React.CSSProperties} 
              />
            ))}
          </div>
          {pinError && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '8px' }}>Incorrect PIN. Try again.</p>}
          <p style={{ color: '#888', fontSize: '15px' }}>Enter your 4-digit access code</p>
        </div>
      </div>
    )
  }

  if (isMobile) {
    const isChat = activeSection === 'chat'
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: BG,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: '#FAFAFA',
        display: 'flex',
        flexDirection: 'column',
        // Use dvh for proper iOS keyboard handling
        height: '100dvh' as string,
      } as React.CSSProperties}>

        {/* Top bar — minimal, always visible */}
        <header style={{
          flexShrink: 0,
          padding: '14px 20px 12px',
          paddingTop: 'max(14px, env(safe-area-inset-top))',
          borderBottom: `1px solid ${BORDER}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0d0d0d',
        } as React.CSSProperties}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>{NAV_ITEMS.find(n => n.id === activeSection)?.icon}</span>
            <span style={{ fontSize: '19px', fontWeight: 700 }}>{NAV_ITEMS.find(n => n.id === activeSection)?.label}</span>
          </div>
          <span style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: ACCENT, fontWeight: 700 }}>Lex</span>
        </header>

        {/* Content — fills remaining space, chat gets no extra padding */}
        <main style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflowY: isChat ? 'hidden' : 'auto',
          padding: isChat ? '0' : '20px 16px',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}>
          {activeSection === 'welcome' && <WelcomeSection onNavigate={navigateTo} />}
          {activeSection === 'documents' && <DocumentAnalyzerSection />}
          {activeSection === 'nyslaw' && <NYSLawSection />}
          {activeSection === 'chat' && <SeanChatSection />}
        </main>

        {/* Bottom tab bar — hidden when keyboard open (chat section) */}
        {!isChat && (
          <nav style={{
            flexShrink: 0,
            borderTop: `1px solid ${BORDER}`,
            background: '#0d0d0d',
            display: 'flex',
            paddingBottom: 'env(safe-area-inset-bottom, 16px)',
          } as React.CSSProperties}>
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => navigateTo(item.id)} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '10px 4px 10px', background: 'none', border: 'none', cursor: 'pointer',
                borderTop: `2px solid ${activeSection === item.id ? ACCENT : 'transparent'}`,
                fontFamily: "'Inter', sans-serif",
              }}>
                <span style={{ fontSize: '24px', lineHeight: 1 }}>{item.icon}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px', color: activeSection === item.id ? ACCENT : '#666' }}>{item.label.split(' ')[0]}</span>
              </button>
            ))}
          </nav>
        )}

        {/* When in chat, show a small back-to-menu button instead */}
        {isChat && (
          <div style={{
            flexShrink: 0,
            borderTop: `1px solid ${BORDER}`,
            background: '#0d0d0d',
            display: 'flex',
            justifyContent: 'flex-start',
            padding: '6px 12px',
            paddingBottom: 'env(safe-area-inset-bottom, 8px)',
          } as React.CSSProperties}>
            {NAV_ITEMS.filter(n => n.id !== 'chat').map(item => (
              <button key={item.id} onClick={() => navigateTo(item.id)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '4px 16px', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}>
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <span style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>{item.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ─── Desktop layout ───
  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Inter', -apple-system, sans-serif", color: '#FAFAFA', display: 'flex' }}>
      <div style={{ width: '220px', flexShrink: 0, borderRight: `1px solid ${BORDER}`, padding: '24px 0', display: 'flex', flexDirection: 'column', minHeight: '100vh', background: BG }}>
        <div style={{ padding: '0 20px 24px', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: ACCENT, fontWeight: 700, marginBottom: '4px' }}>AxiomStream Group</div>
          <div style={{ fontSize: '18px', fontWeight: 800 }}>Lex</div>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>Legal Intelligence</div>
        </div>
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => navigateTo(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', background: activeSection === item.id ? `${ACCENT}10` : 'none', border: 'none', borderLeft: `3px solid ${activeSection === item.id ? ACCENT : 'transparent'}`, cursor: 'pointer', fontFamily: "'Inter', sans-serif", textAlign: 'left' }}>
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span style={{ fontSize: '14px', fontWeight: activeSection === item.id ? 600 : 400, flex: 1, color: activeSection === item.id ? '#FAFAFA' : GRAY }}>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: '11px', color: '#666' }}>Sean D. Lair</div>
          <div style={{ fontSize: '10px', color: '#444', marginTop: '2px' }}>DeValk Power Lair & Warner</div>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{ borderBottom: `1px solid ${BORDER}`, padding: '16px 32px', display: 'flex', alignItems: 'center', background: BG, position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#FAFAFA' }}>{NAV_ITEMS.find(n => n.id === activeSection)?.label}</div>
        </header>
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {activeSection === 'welcome' && <WelcomeSection onNavigate={navigateTo} />}
          {activeSection === 'documents' && <DocumentAnalyzerSection />}
          {activeSection === 'nyslaw' && <NYSLawSection />}
          {activeSection === 'chat' && <SeanChatSection />}
        </main>
      </div>
    </div>
  )
}
