/**
 * Time Tracker module.
 * Thin wrapper — the actual tracker is already built and hosted externally
 * (Lex agent for law firms). This module provides a nav entry + embed/handoff.
 *
 * Options:
 *   trackerUrl — URL to the hosted tracker (required to render)
 *   mode       — 'embed' (iframe) | 'link' (redirect card). Default: 'link'.
 *   heading    — headline copy. Default: 'Matter Time Tracking'.
 */
import { FONT_STACK, TOUCH } from '../theme'
import type { Module, ModuleContext } from '../types'

interface TimeTrackerOptions {
  trackerUrl?: string
  mode?: 'embed' | 'link'
  heading?: string
  description?: string
}

function TimeTrackerSection({ accent, tv, options, config }: ModuleContext) {
  const opts = options as TimeTrackerOptions
  const url = opts.trackerUrl
  const mode = opts.mode || 'link'
  const heading = opts.heading || 'Matter Time Tracking'
  const description = opts.description ||
    `Capture billable time as you work. ${config.agentLabel} helps categorize entries and draft narratives.`

  if (!url) {
    return (
      <div style={{ maxWidth: 640, fontFamily: FONT_STACK, color: tv.text, padding: '40px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏱️</div>
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Time Tracker</h2>
        <p style={{ fontSize: 15, color: tv.lightGray, lineHeight: 1.7 }}>
          The time tracker endpoint hasn't been configured yet. Set{' '}
          <code style={{ background: tv.surface, padding: '2px 6px', borderRadius: 4 }}>
            moduleOptions['time-tracker'].trackerUrl
          </code>{' '}
          on this portal's config.
        </p>
      </div>
    )
  }

  if (mode === 'embed') {
    return (
      <div style={{ fontFamily: FONT_STACK, color: tv.text }}>
        <div style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: accent, fontWeight: 700, marginBottom: 16 }}>
          {heading}
        </div>
        <iframe
          src={url}
          title="Time Tracker"
          style={{
            width: '100%',
            height: 'calc(100dvh - 180px)',
            minHeight: 520,
            border: `1px solid ${tv.border}`,
            borderRadius: 10,
            background: tv.surface,
          }}
        />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640, fontFamily: FONT_STACK, color: tv.text }}>
      <div style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: accent, fontWeight: 700, marginBottom: 16 }}>
        Time & Billing
      </div>
      <h2 style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 14, lineHeight: 1.1 }}>
        {heading}
      </h2>
      <p style={{ fontSize: 15, color: tv.lightGray, lineHeight: 1.7, marginBottom: 28 }}>
        {description}
      </p>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          background: accent,
          color: tv.bg,
          padding: '14px 26px',
          borderRadius: 10,
          fontWeight: 800,
          fontSize: 15,
          textDecoration: 'none',
          minHeight: TOUCH.minTarget,
          boxSizing: 'border-box',
        }}
      >
        Open Time Tracker →
      </a>
    </div>
  )
}

export const timeTrackerModule: Module = {
  id: 'time-tracker',
  nav: { label: 'Time Tracker', icon: '⏱️' },
  Section: TimeTrackerSection,
}
