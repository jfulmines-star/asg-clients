/**
 * Intake section — fully driven by config.intakeFields.
 * Field types: text, textarea, chips, select.
 * Persisted to localStorage via the useIntake hook (managed by ASGPortalBase).
 */
import { useState } from 'react'
import type React from 'react'
import { FONT_STACK, TOUCH } from '../theme'
import type { ModuleContext, IntakeField } from '../types'

interface Props extends ModuleContext {
  fields: Record<string, unknown>
  setFields: (next: Record<string, unknown>) => void
  saved: boolean
  onSave: () => void
}

export function IntakeSection({ config, accent, tv, navigateTo, fields, setFields, saved, onSave }: Props) {
  const [justSaved, setJustSaved] = useState(false)

  if (saved && !justSaved) {
    // If they navigate back here after saving, show a confirmation
    return (
      <div style={{ maxWidth: 540, textAlign: 'center', padding: '40px 0', fontFamily: FONT_STACK, color: tv.text }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12 }}>
          Got it, {config.clientName.split(' ')[0]}.
        </h2>
        <p style={{ fontSize: 15, color: tv.lightGray, lineHeight: 1.7, marginBottom: 24 }}>
          Your context is saved. {config.agentLabel} now knows your practice.
          Every conversation starts from there.
        </p>
        <button
          onClick={() => navigateTo('chat')}
          style={{
            background: accent,
            color: tv.bg,
            border: 'none',
            borderRadius: 10,
            padding: '14px 28px',
            fontSize: 15,
            fontWeight: 700,
            minHeight: TOUCH.minTarget,
            cursor: 'pointer',
            fontFamily: FONT_STACK,
          }}
        >
          Chat with {config.agentLabel} →
        </button>
      </div>
    )
  }

  function toggleChip(key: string, val: string) {
    const cur = (fields[key] as string[]) || []
    setFields({
      ...fields,
      [key]: cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val],
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave()
    setJustSaved(true)
    setTimeout(() => navigateTo('chat'), 600)
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: tv.gray,
    display: 'block',
    marginBottom: 10,
  }
  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: tv.surface,
    border: `1px solid ${tv.border}`,
    borderRadius: 8,
    padding: '12px 16px',
    fontSize: 16, // 16px to prevent iOS zoom
    color: tv.text,
    fontFamily: FONT_STACK,
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: TOUCH.minTarget,
  }

  return (
    <div style={{ maxWidth: 600, fontFamily: FONT_STACK, color: tv.text }}>
      <div style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: '#A78BFA', fontWeight: 700, marginBottom: 16 }}>
        {(config as any).intakeLabel || 'Quick Context — 2 Minutes'}
      </div>
      <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 12, lineHeight: 1.1 }}>
        {(config as any).intakeTitle || <span>Tell Us About<br />Your Practice</span>}
      </h2>
      <p style={{ fontSize: 15, color: tv.lightGray, lineHeight: 1.7, marginBottom: 28 }}>
        {(config as any).intakeSubtitle || `We've pre-loaded what we already know about ${config.company}. Review it, correct anything off, and add what only you know.`}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {config.intakeFields.map((field: IntakeField) => (
          <div key={field.key}>
            <label style={labelStyle}>{field.label}{field.required && ' *'}</label>
            {field.type === 'text' && (
              <input
                type="text"
                placeholder={field.placeholder}
                value={(fields[field.key] as string) || ''}
                onChange={e => setFields({ ...fields, [field.key]: e.target.value })}
                required={field.required}
                style={inputStyle}
              />
            )}
            {field.type === 'textarea' && (
              <textarea
                placeholder={field.placeholder}
                value={(fields[field.key] as string) || ''}
                onChange={e => setFields({ ...fields, [field.key]: e.target.value })}
                required={field.required}
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            )}
            {field.type === 'select' && field.options && (
              <select
                value={(fields[field.key] as string) || ''}
                onChange={e => setFields({ ...fields, [field.key]: e.target.value })}
                required={field.required}
                style={{ ...inputStyle, appearance: 'none' }}
              >
                <option value="">Select…</option>
                {field.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
            {field.type === 'chips' && field.options && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {field.options.map(opt => {
                  const active = ((fields[field.key] as string[]) || []).includes(opt)
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleChip(field.key, opt)}
                      style={{
                        background: active ? `${accent}20` : tv.surface,
                        border: `1px solid ${active ? accent : tv.border}`,
                        borderRadius: 20,
                        padding: '8px 14px',
                        minHeight: 36,
                        fontSize: 13,
                        cursor: 'pointer',
                        color: active ? accent : tv.gray,
                        fontFamily: FONT_STACK,
                        transition: 'all 0.15s',
                      }}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        <button
          type="submit"
          style={{
            background: accent,
            color: tv.bg,
            border: 'none',
            borderRadius: 10,
            padding: '14px 28px',
            fontSize: 15,
            fontWeight: 700,
            minHeight: TOUCH.minTarget,
            cursor: 'pointer',
            fontFamily: FONT_STACK,
            alignSelf: 'flex-start',
          }}
        >
          Save My Context →
        </button>
      </form>
    </div>
  )
}
