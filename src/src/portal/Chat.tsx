/**
 * Chat — shared streaming chat component.
 * Supports two transports:
 *
 *   api-proxy:         POST /api/chat (existing backend, non-streaming).
 *                      Used by all existing portals for backward compatibility.
 *
 *   anthropic-direct:  POST https://api.anthropic.com/v1/messages with SSE
 *                      streaming. Used by the JJF sandbox and any client
 *                      running without a backend.
 *
 * Module onChatMessage hooks fire after each completed exchange.
 */
import { useState, useRef, useEffect } from 'react'
import type React from 'react'
import { MessageContent } from './markdown'
import { FONT_STACK } from './theme'
import type {
  PortalConfig,
  ChatMessage,
  Module,
  ModuleContext,
  ThemeTokens,
} from './types'

interface Props {
  config: PortalConfig
  tv: ThemeTokens
  isMobile: boolean
  preloadedHistory: ChatMessage[] | null
  intake: Record<string, unknown> | null
  intakeAsMarkdown: string
  /** Modules may fire side effects (HubSpot logging, etc.) after each exchange */
  modules: Module[]
  moduleCtx: (id: string) => ModuleContext
  fontSize?: number
}

const DEFAULT_MODEL = 'claude-sonnet-4-6'

export function Chat({
  config,
  tv,
  isMobile,
  preloadedHistory,
  intake,
  intakeAsMarkdown,
  modules,
  moduleCtx,
  fontSize = 16,
}: Props) {
  const accent = config.accentColor
  const agentInitial = config.agentLabel.charAt(0).toUpperCase()
  const clientInitial = config.clientName.charAt(0).toUpperCase()
  const memberName = config.memberName || config.clientName

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastAssistantRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Load preloaded history (or fall back to fetch) ─────────────────────────
  useEffect(() => {
    if (preloadedHistory === null) return // still loading
    if (preloadedHistory.length > 0) {
      setMessages(preloadedHistory)
    } else {
      // No history → show greeting
      setMessages([{ role: 'assistant', content: config.chat.greeting(Boolean(intake)) }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preloadedHistory])

  // Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [loading])

  useEffect(() => {
    if (!loading && messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      lastAssistantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [messages, loading])

  // ── Transports ──────────────────────────────────────────────────────────

  async function sendViaApiProxy(text: string, history: ChatMessage[]): Promise<string> {
    const endpoint = config.chat.apiEndpoint || '/api/chat'
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent: config.agentId,
        message: text,
        history: history.map(m => ({ role: m.role, content: m.content })),
        slug: config.slug,
        tenantId: config.slug,
        teamMember: memberName,
        isLead: config.chat.isLead ?? false,
        extraContext: intakeAsMarkdown,
        disableTeamContext: config.chat.disableTeamContext ?? false,
      }),
    })
    const data = await res.json()
    return data.reply || data.text || data.message || 'Something went wrong.'
  }

  async function sendViaAnthropicDirect(
    text: string,
    history: ChatMessage[],
    onDelta: (chunk: string) => void,
    signal: AbortSignal,
  ): Promise<string> {
    const ac = config.chat.anthropic
    if (!ac) throw new Error('anthropic-direct transport requires chat.anthropic config')

    const apiKey =
      ac.apiKey ||
      (typeof import.meta !== 'undefined' ? (import.meta as { env?: Record<string, string> }).env?.VITE_ANTHROPIC_API_KEY : undefined)

    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured (set VITE_ANTHROPIC_API_KEY)')

    const systemPrompt = ac.systemPrompt({ config, intake, practiceContext: intakeAsMarkdown })

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: ac.model || DEFAULT_MODEL,
        max_tokens: ac.maxTokens ?? 2048,
        stream: true,
        system: systemPrompt,
        messages: [
          ...history
            .filter(m => m.role !== 'system')
            .map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: text },
        ],
      }),
      signal,
    })

    if (!res.ok || !res.body) {
      const errText = await res.text().catch(() => '')
      throw new Error(`Anthropic API error ${res.status}: ${errText}`)
    }

    // Parse SSE stream
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let accumulated = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // SSE events are \n\n-delimited
      let delimIdx: number
      while ((delimIdx = buffer.indexOf('\n\n')) !== -1) {
        const rawEvent = buffer.slice(0, delimIdx)
        buffer = buffer.slice(delimIdx + 2)
        const lines = rawEvent.split('\n')
        for (const line of lines) {
          if (!line.startsWith('data:')) continue
          const dataStr = line.slice(5).trim()
          if (!dataStr || dataStr === '[DONE]') continue
          try {
            const evt = JSON.parse(dataStr)
            if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
              accumulated += evt.delta.text
              onDelta(accumulated)
            }
          } catch {
            /* ignore malformed event */
          }
        }
      }
    }
    return accumulated
  }

  // ── Send ────────────────────────────────────────────────────────────────

  async function persist(role: 'user' | 'assistant', content: string) {
    const endpoint = config.chat.persistEndpoint || '/api/portal-chat-history'
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: config.slug, role, content }),
      })
    } catch { /* non-critical */ }
  }

  async function send() {
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput('')
    const historySnapshot = messages.filter(m => m.role !== 'system')
    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    // Placeholder bubble for streaming / searching
    const placeholderId = Date.now()
    const placeholderText = config.chat.transport === 'anthropic-direct'
      ? ''  // will be filled by streaming deltas
      : '⚡ Searching live data sources…'
    setMessages(prev => [...prev, { role: 'assistant', content: placeholderText, _id: placeholderId }])

    abortRef.current = new AbortController()

    try {
      let reply: string
      if (config.chat.transport === 'anthropic-direct') {
        reply = await sendViaAnthropicDirect(
          text,
          historySnapshot,
          (partial) => {
            setMessages(prev =>
              prev.map(m => (m._id === placeholderId ? { ...m, content: partial } : m))
            )
          },
          abortRef.current.signal,
        )
      } else {
        reply = await sendViaApiProxy(text, historySnapshot)
      }

      setMessages(prev =>
        prev.map(m => (m._id === placeholderId ? { role: 'assistant', content: reply } : m))
      )

      // Persistence (api-proxy mode writes to /api/portal-chat-history;
      // api-proxy also persists via /api/chat backend, so this is mostly
      // belt-and-suspenders; anthropic-direct REQUIRES this)
      if (config.chat.transport === 'anthropic-direct') {
        await persist('user', text)
        await persist('assistant', reply)
      }

      // Fire module onChatMessage hooks
      for (const m of modules) {
        if (m.onChatMessage) {
          try {
            await m.onChatMessage(moduleCtx(m.id), { user: text, assistant: reply })
          } catch { /* module hook failure is non-critical */ }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection issue — try again.'
      setMessages(prev =>
        prev.map(m => (m._id === placeholderId ? { role: 'assistant', content: `❌ ${msg}` } : m))
      )
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  async function startFresh() {
    if (config.chat.transport === 'api-proxy') {
      // Write a session break marker to preserve Redis history but skip past it
      const endpoint = config.chat.persistEndpoint || '/api/portal-chat-history'
      try {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: config.slug, role: 'system', content: '___SESSION_BREAK___' }),
        })
      } catch { /* ignore */ }
    }
    setMessages([{ role: 'assistant', content: config.chat.greeting(Boolean(intake)) }])
    setInput('')
  }

  // ── Render ──────────────────────────────────────────────────────────────

  const msgUserBg = '#1e3a5f'
  const msgUserBorder = '#2563eb30'
  const msgAsstBg = tv.surface === '#111111' ? '#1a2035' : tv.surface
  const msgAsstBorder = tv.border

  const height = isMobile ? 'calc(100dvh - 180px)' : 'calc(100dvh - 180px)'
  const minHeight = isMobile ? 360 : 500

  return (
    <div style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', height, minHeight, width: '100%' }}>
      {/* Header */}
      <div
        style={{
          marginBottom: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: accent, fontWeight: 700, marginBottom: 6 }}>
            Your Instance
          </div>
          <h2 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 900, letterSpacing: '-0.5px', margin: 0, color: tv.text }}>
            Chat with {config.agentLabel}
          </h2>
          <p style={{ fontSize: Math.max(13, Math.round(fontSize * 0.75)), color: tv.gray, margin: '6px 0 0' }}>
            {config.company} context loaded.
            {intake && <span style={{ color: accent }}> Practice context saved ✓</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={startFresh}
            title="Start fresh — history is preserved on the server"
            style={{
              minHeight: 36,
              padding: '0 12px',
              borderRadius: 6,
              border: `1px solid ${tv.border}`,
              background: 'transparent',
              color: tv.gray,
              fontFamily: FONT_STACK,
              fontSize: 12,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            ↺ Fresh
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          background: tv.surface,
          border: `1px solid ${tv.border}`,
          borderRadius: '12px 12px 0 0',
          padding: isMobile ? 14 : 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            ref={i === messages.length - 1 && m.role === 'assistant' ? lastAssistantRef : undefined}
            style={{
              display: 'flex',
              gap: 10,
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                flexShrink: 0,
                background: m.role === 'user' ? msgUserBg : `${accent}20`,
                border: `1px solid ${m.role === 'user' ? '#2563eb40' : `${accent}40`}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 800,
                color: m.role === 'user' ? '#60a5fa' : accent,
              }}
            >
              {m.role === 'user' ? clientInitial : agentInitial}
            </div>
            <div
              style={{
                maxWidth: '85%',
                minWidth: 0,
                background: m.role === 'user' ? msgUserBg : msgAsstBg,
                border: `1px solid ${m.role === 'user' ? msgUserBorder : msgAsstBorder}`,
                borderRadius: 10,
                padding: '14px 18px',
                fontSize: fontSize,
                color: tv.text,
                lineHeight: 1.65,
              }}
            >
              {m.role === 'assistant' ? (
                m.content.length === 0 && loading && m._id ? (
                  <LoadingDots accent={accent} />
                ) : (
                  <MessageContent content={m.content} accent={accent} />
                )
              ) : (
                <span style={{ whiteSpace: 'pre-wrap' }}>{m.content}</span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          background: tv.surface,
          border: `1px solid ${tv.border}`,
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          padding: 14,
          display: 'flex',
          gap: 8,
          alignItems: 'flex-end',
        }}
      >
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={config.chat.placeholder}
          rows={isMobile ? 1 : 2}
          autoComplete="off"
          autoCorrect="on"
          autoCapitalize="sentences"
          spellCheck
          style={{
            flex: 1,
            background: tv.bg,
            border: `1px solid ${tv.border}`,
            borderRadius: 8,
            padding: '14px 16px',
            fontSize: 17, // ≥16px prevents iOS zoom; 17px for comfort
            color: tv.text,
            fontFamily: FONT_STACK,
            outline: 'none',
            resize: 'none',
            lineHeight: 1.5,
            minHeight: 56,
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          aria-label="Send message"
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: accent,
            border: 'none',
            cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            opacity: (!input.trim() || loading) ? 0.4 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <span style={{ fontSize: 18, color: tv.bg, fontWeight: 900 }}>↑</span>
        </button>
      </div>

      <div style={{ marginTop: 8, fontSize: isMobile ? 13 : 11, color: tv.gray, textAlign: 'center' }}>
        {config.poweredBy || 'Powered by AxiomStream Group'}
      </div>
    </div>
  )
}

function LoadingDots({ accent }: { accent: string }) {
  return (
    <span style={{ display: 'inline-flex', gap: 4 }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: accent,
            opacity: 0.5,
            animation: `asg-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </span>
  )
}
