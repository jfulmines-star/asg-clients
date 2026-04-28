/**
 * Dining Concierge module — city-based restaurant recommendations via Rex.
 * Available on Shield portal configs (ryanh, andrew, markb).
 */
import { useState, useRef, useEffect } from 'react'
import type { SectionProps } from '../types'
import { MessageContent } from '../markdown'
import { FONT_STACK } from '../theme'

const QUICK_CITIES = ['Orlando', 'Dallas', 'Chicago', 'Washington DC', 'San Diego', 'New York', 'Huntsville AL']

export function DiningSection({ tv, isMobile }: SectionProps) {
  const [msgs, setMsgs] = useState<Array<{ role: 'user' | 'assistant'; content: string; _id?: number }>>([])
  const [inputVal, setInputVal] = useState('')
  const [inputKey, setInputKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const lastRef = useRef<HTMLDivElement>(null)
  const accent = '#4ADE80'

  useEffect(() => {
    if (msgs.length) lastRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [msgs])

  async function askRex(question: string) {
    if (!question.trim() || loading) return
    const text = question.trim()
    setInputVal('')
    setInputKey(k => k + 1)
    setMsgs(prev => [...prev, { role: 'user', content: text }])
    const ts = Date.now()
    setMsgs(prev => [...prev, { role: 'assistant', content: '🍽️ Finding the best spots...', _id: ts }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: 'rex',
          message: text,
          history: msgs.filter(m => !m._id).map(m => ({ role: m.role, content: m.content })),
          slug: 'dining',
          teamMember: 'Shield Rep',
          isLead: false,
          disableTeamContext: true,
          extraContext: `\n\n## Dining Concierge Mode\nYou are Rex, a world-class dining concierge for the Shield Technologies sales team. They work hard and play hard — they entertain clients and love exceptional meals whenever they travel. Your job is to give specific, confident restaurant recommendations: name, neighborhood, why it's right for them, what to order, and whether it's good for a client dinner vs. a team night out. No generic lists. Be the friend who actually knows. If they give you a city, give 3–5 picks across different vibes (power lunch, client entertainment, late night, hidden gem). Always include one "trust me on this one" pick.`,
        }),
      })
      const data = await res.json()
      const reply = data.reply || data.text || data.message || 'Try again.'
      setMsgs(prev => [...prev.filter(m => m._id !== ts), { role: 'assistant', content: reply }])
    } catch {
      setMsgs(prev => [...prev.filter(m => m._id !== ts), { role: 'assistant', content: 'Connection issue. Try again.' }])
    }
    setLoading(false)
  }

  function quickHit(city: string) {
    askRex(`Best restaurants in ${city} — client dinner, team night out, and a hidden gem`)
  }

  const compact = isMobile

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, maxWidth: 760, width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 12, flexShrink: 0 }}>
        <div style={{ fontSize: compact ? 10 : 11, letterSpacing: 4, textTransform: 'uppercase', color: accent, fontWeight: 700, marginBottom: 6 }}>
          Dining Concierge
        </div>
        <h2 style={{ fontSize: compact ? 24 : 28, fontWeight: 900, letterSpacing: '-0.5px', margin: 0, color: tv.text }}>
          Where to eat
        </h2>
        <p style={{ fontSize: 13, color: tv.gray, margin: '6px 0 0' }}>
          Drop a city — client dinner, team night, hidden gem.
        </p>
      </div>

      {/* Quick cities */}
      {msgs.length === 0 && (
        <div style={{ flexShrink: 0, marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: tv.gray, marginBottom: 8 }}>
            Quick hit
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {QUICK_CITIES.map(c => (
              <button
                key={c}
                onClick={() => quickHit(c)}
                style={{
                  padding: '7px 14px', borderRadius: 20,
                  border: `1px solid ${tv.border}`,
                  background: tv.surface, color: tv.text,
                  fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: FONT_STACK,
                  transition: 'all 0.15s',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
        {msgs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 20px', color: tv.gray, fontSize: 13, lineHeight: 1.8 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🍽️</div>
            Pick a city above or ask anything.<br />
            <span style={{ fontSize: 12 }}>"Best steak in Dallas for closing a deal" · "Late night in Chicago after a flight"</span>
          </div>
        )}
        {msgs.map((msg, i) => (
          <div
            key={i}
            ref={i === msgs.length - 1 ? lastRef : undefined}
            style={{ display: 'flex', gap: 8, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}
          >
            <div style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              background: msg.role === 'user' ? '#1e3a5f' : `${accent}20`,
              border: `1px solid ${accent}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: accent,
            }}>
              {msg.role === 'user' ? '👤' : '🍽️'}
            </div>
            <div style={{
              maxWidth: '85%', minWidth: 0,
              background: msg.role === 'user' ? '#1e3a5f' : '#1a2035',
              border: `1px solid ${msg.role === 'user' ? '#2563eb30' : tv.border}`,
              borderRadius: 8, padding: '10px 14px',
              fontSize: 13, color: msg.role === 'user' ? '#e0f2fe' : tv.text,
              lineHeight: 1.75,
              borderLeft: msg.role === 'assistant' ? `3px solid ${accent}` : undefined,
            }}>
              {msg._id
                ? <span style={{ display: 'inline-flex', gap: 4 }}>
                    {[0, 1, 2].map(j => (
                      <span key={j} style={{ width: 5, height: 5, borderRadius: '50%', background: accent, opacity: 0.5, animation: `rexbounce 1.2s ease-in-out ${j * 0.2}s infinite` }} />
                    ))}
                  </span>
                : <MessageContent content={msg.content} accent={accent} />
              }
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{
        flexShrink: 0, background: tv.surface,
        border: `1px solid ${tv.border}`, borderRadius: 10,
        padding: 8, display: 'flex', gap: 8, alignItems: 'flex-end',
      }}>
        <textarea
          key={inputKey}
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askRex(inputVal) } }}
          placeholder="City, vibe, occasion — Rex will handle the rest..."
          rows={2}
          style={{
            flex: 1, background: 'transparent',
            border: 'none', outline: 'none', resize: 'none',
            padding: '6px 10px', fontSize: 13,
            color: tv.text, fontFamily: FONT_STACK, lineHeight: 1.5,
          }}
        />
        <button
          onClick={() => askRex(inputVal)}
          disabled={!inputVal.trim() || loading}
          style={{
            width: 38, height: 38, borderRadius: '50%',
            background: accent, border: 'none',
            cursor: !inputVal.trim() || loading ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, opacity: !inputVal.trim() || loading ? 0.4 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <span style={{ fontSize: 16, color: '#0a0f1e', fontWeight: 900 }}>↑</span>
        </button>
      </div>
    </div>
  )
}
