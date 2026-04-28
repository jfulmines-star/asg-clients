/**
 * Welcome section — generic "Hey {clientName}, this is {agentLabel}" landing.
 * Rendered as a module via MODULE_REGISTRY['welcome'].
 */
import { FONT_STACK } from '../theme'
import type { ModuleContext } from '../types'

export function WelcomeSection({ config, accent, tv, navigateTo, intake }: ModuleContext) {
  const whatWeKnow = config.whatWeKnow
  const intakeSaved = Boolean(intake)

  return (
    <div style={{ maxWidth: 720, fontFamily: FONT_STACK, color: tv.text }}>
      <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: accent, fontWeight: 700, marginBottom: 16 }}>
        Private Access · {config.company}
      </div>
      <h1 style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-1.2px', marginBottom: 8, lineHeight: 1.05 }}>
        Hey {config.clientName.split(' ')[0]}.
      </h1>
      <h2 style={{ fontSize: 26, fontWeight: 700, color: tv.gray, letterSpacing: '-0.4px', marginBottom: 24 }}>
        This is {config.agentLabel}.
      </h2>

      <p style={{ fontSize: 16, color: tv.lightGray, lineHeight: 1.7, marginBottom: 28 }}>
        {config.tagline}
      </p>

      {/* What we already know */}
      <div
        style={{
          background: `${accent}08`,
          border: `1px solid ${accent}25`,
          borderRadius: 10,
          padding: '20px 22px',
          marginBottom: 32,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: accent, marginBottom: 12 }}>
          Your Context
        </div>
        {typeof whatWeKnow === 'string' ? (
          <div style={{ fontSize: 13, color: tv.lightGray, lineHeight: 1.7 }}>{whatWeKnow}</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
            {whatWeKnow.map(item => (
              <div key={item.label} style={{ background: tv.surface, borderRadius: 6, padding: '10px 12px', border: `1px solid ${tv.border}` }}>
                <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: accent, fontWeight: 700, marginBottom: 3 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 12, color: tv.lightGray, lineHeight: 1.5 }}>{item.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          onClick={() => navigateTo('chat')}
          style={{
            background: accent,
            color: tv.bg,
            border: 'none',
            borderRadius: 10,
            padding: '16px 28px',
            fontSize: 15,
            fontWeight: 800,
            minHeight: 44,
            cursor: 'pointer',
            fontFamily: FONT_STACK,
          }}
        >
          Chat with {config.agentLabel} →
        </button>
        {!intakeSaved && config.intakeFields.length > 0 && (
          <button
            onClick={() => navigateTo('intake')}
            style={{
              background: tv.surface,
              color: tv.lightGray,
              border: `1px solid ${tv.border}`,
              borderRadius: 10,
              padding: '16px 28px',
              fontSize: 15,
              fontWeight: 600,
              minHeight: 44,
              cursor: 'pointer',
              fontFamily: FONT_STACK,
            }}
          >
            Add Your Context
          </button>
        )}
      </div>
    </div>
  )
}
