/**
 * ASGPortalBase — shared hooks
 * Replaces the per-portal duplicated useIsMobile, intake state, PIN state,
 * and history preload logic.
 */
import { useState, useEffect, useCallback } from 'react'
import type React from 'react'
import { MOBILE_BREAKPOINT_PX } from './theme'
import type { PortalConfig, ChatMessage, IntakeField } from './types'

// ── useIsMobile ─────────────────────────────────────────────────────────────
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT_PX : false
  )
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT_PX)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

// ── Intake storage ──────────────────────────────────────────────────────────
function intakeKey(slug: string) {
  return `asg-portal-v2-${slug}`
}

function buildInitialIntake(fields: IntakeField[]): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const f of fields) {
    if (f.type === 'chips') {
      out[f.key] = f.default ? f.default.split(',').map(s => s.trim()).filter(Boolean) : []
    } else {
      out[f.key] = f.default ?? ''
    }
  }
  return out
}

export function useIntake(config: PortalConfig) {
  const [fields, setFields] = useState<Record<string, unknown>>(() => buildInitialIntake(config.intakeFields))
  const [saved, setSaved] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(intakeKey(config.slug))
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed?.fields) {
        setFields(parsed.fields)
        setSaved(true)
      }
    } catch {
      /* localStorage unavailable — graceful fallback */
    }
  }, [config.slug])

  const save = useCallback(() => {
    try {
      const payload = { fields, savedAt: new Date().toISOString() }
      localStorage.setItem(intakeKey(config.slug), JSON.stringify(payload))
    } catch { /* ignore */ }
    setSaved(true)
  }, [config.slug, fields])

  const clear = useCallback(() => {
    try { localStorage.removeItem(intakeKey(config.slug)) } catch { /* ignore */ }
    setFields(buildInitialIntake(config.intakeFields))
    setSaved(false)
  }, [config.slug, config.intakeFields])

  // Serialize intake as markdown for system prompt / extraContext
  const asMarkdown = useCallback(() => {
    if (!saved) return ''
    const lines = ['', '## Practice Context']
    for (const f of config.intakeFields) {
      const v = fields[f.key]
      const display = Array.isArray(v) ? v.join(', ') : (v || 'not specified')
      lines.push(`${f.label}: ${display}`)
    }
    return lines.join('\n')
  }, [saved, fields, config.intakeFields])

  return { fields, setFields, saved, save, clear, asMarkdown }
}

// ── PIN gate ────────────────────────────────────────────────────────────────
export function usePin(expectedPin: string) {
  const [unlocked, setUnlocked] = useState(false)
  const [digits, setDigits] = useState(['', '', '', ''])
  const [error, setError] = useState(false)

  function focusInput(i: number) {
    const el = document.getElementById(`asg-pin-${i}`) as HTMLInputElement | null
    el?.focus()
  }

  function check(d = digits) {
    if (d.join('') === expectedPin) {
      setUnlocked(true)
      setError(false)
    } else {
      setError(true)
      setDigits(['', '', '', ''])
      setTimeout(() => focusInput(0), 100)
    }
  }

  function handleDigit(i: number, val: string) {
    const d = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = d
    setDigits(next)
    setError(false)
    if (d && i < 3) focusInput(i + 1)
    if (next.every(v => v !== '') && i === 3) setTimeout(() => check(next), 80)
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      focusInput(i - 1)
      setDigits(prev => { const n = [...prev]; n[i - 1] = ''; return n })
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (text.length === 4) {
      const arr = text.split('')
      setDigits(arr)
      setTimeout(() => check(arr), 80)
    }
  }

  return { unlocked, digits, error, handleDigit, handleKeyDown, handlePaste, manualCheck: () => check() }
}

// ── Chat history preload (api-proxy mode) ───────────────────────────────────
export function useChatHistory(config: PortalConfig, enabled: boolean) {
  const [history, setHistory] = useState<ChatMessage[] | null>(null)

  useEffect(() => {
    if (!enabled || config.chat.transport !== 'api-proxy') {
      setHistory([])
      return
    }
    const member = config.memberName || config.clientName
    const endpoint = config.chat.historyEndpoint || '/api/history'
    const url = `${endpoint}?slug=${encodeURIComponent(config.slug)}&member=${encodeURIComponent(member)}`
    fetch(url)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) { setHistory([]); return }
        const msgs = (d.messages || d.history || []).slice(-60)
        setHistory(msgs.map((m: { role: string; content: string }) => ({
          role: (m.role === 'agent' ? 'assistant' : m.role) as ChatMessage['role'],
          content: m.content,
        })))
      })
      .catch(() => setHistory([]))
  }, [enabled, config.slug, config.chat.transport, config.chat.historyEndpoint, config.memberName, config.clientName])

  return history
}
