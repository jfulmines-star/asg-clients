import { useState, useRef, useEffect } from 'react'
import MessageRenderer from '../components/MessageRenderer'

const PIN = '1414' // JJ's birthday

const GOLD = '#F59E0B'
const BLUE = '#2563EB'
const BG = '#0A0A0A'
const SURFACE = '#111111'
const BORDER = '#1F1F1F'
const GRAY = '#6B7280'
const LIGHT_GRAY = '#9CA3AF'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  ts: number
}

export default function KitFullPortal() {
  const [unlocked, setUnlocked] = useState(false)
  const [digits, setDigits] = useState(['', '', '', ''])
  const [pinError, setPinError] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg: ChatMessage = { role: 'user', content: input.trim(), ts: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/kit-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, member: 'jj' }),
      })

      const data = await res.json()
      if (data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response, ts: Date.now() }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Error: ' + (data.error || 'Unknown error'), ts: Date.now() }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to Kit.', ts: Date.now() }])
    } finally {
      setLoading(false)
    }
  }

  // PIN screen
  if (!unlocked) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Inter', -apple-system, sans-serif" }}>
        <div style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#333', marginBottom: '48px' }}>
            KIT — FULL CONTEXT
          </div>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '20px', padding: '44px 40px 40px' }}>
            <div style={{ height: '3px', width: '48px', background: BLUE, borderRadius: '2px', margin: '0 auto 28px' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#FFF', margin: '0 0 8px' }}>Enter PIN</h2>
            <p style={{ fontSize: '13px', color: GRAY, margin: '0 0 28px' }}>Access requires authorization</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  id={`pin-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  autoFocus={i === 0}
                  style={{
                    width: '56px', height: '64px', textAlign: 'center', fontSize: '26px', fontWeight: 600,
                    background: '#1A1A1A', border: `2px solid ${pinError ? '#EF4444' : BORDER}`,
                    borderRadius: '12px', color: '#FFF', outline: 'none', caretColor: BLUE,
                  }}
                />
              ))}
            </div>
            {pinError && <p style={{ fontSize: '13px', color: '#EF4444', margin: 0 }}>Incorrect PIN</p>}
          </div>
          <p style={{ fontSize: '12px', color: '#444', marginTop: '32px' }}>
            Opus 4.5 · Full Synapse Context · No Restrictions
          </p>
        </div>
      </div>
    )
  }

  // Chat interface
  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${BLUE}, ${GOLD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
          🤖
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFF' }}>Kit — Full Context</div>
          <div style={{ fontSize: '12px', color: GRAY }}>Opus 4.5 · Synapse Memory · USER.md · SOUL.md</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: GRAY }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
            <div style={{ fontSize: '15px', marginBottom: '8px', color: LIGHT_GRAY }}>Full Kit — Your complete context is loaded</div>
            <div style={{ fontSize: '13px' }}>Synapse memory, USER.md, SOUL.md, IDENTITY.md — all injected.</div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%',
              padding: '14px 18px',
              borderRadius: '16px',
              background: msg.role === 'user' ? BLUE : SURFACE,
              border: msg.role === 'assistant' ? `1px solid ${BORDER}` : 'none',
              color: '#FFF',
              fontSize: '14px',
              lineHeight: '1.6',
            }}>
              <MessageRenderer content={msg.content} />
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: GRAY, fontSize: '13px' }}>
            <span style={{ animation: 'pulse 1.5s infinite' }}>●</span> Kit is thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} style={{ padding: '16px 24px', borderTop: `1px solid ${BORDER}`, display: 'flex', gap: '12px' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask anything..."
          style={{
            flex: 1,
            padding: '14px 18px',
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: '12px',
            color: '#FFF',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '14px 24px',
            background: BLUE,
            border: 'none',
            borderRadius: '12px',
            color: '#FFF',
            fontSize: '14px',
            fontWeight: 600,
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !input.trim() ? 0.5 : 1,
          }}
        >
          Send
        </button>
      </form>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
