/**
 * PinGate — shared 4-digit access PIN.
 * Replaces 3 copy-pasted implementations across MarkPortal, ClientPortalV2,
 * and WinthropRexPortal.
 *
 * Touch targets: 56x64 px PIN inputs, 44px min everywhere else.
 * Mobile-friendly: type=tel, inputMode=numeric, autoComplete=off.
 */
import { usePin } from './hooks'
import { FONT_STACK } from './theme'
import type { PortalConfig, ThemeTokens } from './types'

interface Props {
  config: PortalConfig
  tv: ThemeTokens
  onUnlock: () => void
}

export function PinGate({ config, tv, onUnlock }: Props) {
  const accent = config.accentColor
  const pin = usePin(config.pin)

  // Notify parent on unlock
  if (pin.unlocked) {
    queueMicrotask(onUnlock)
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: tv.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: FONT_STACK,
        boxSizing: 'border-box',
        color: tv.text,
      }}
    >
      <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>
        {/* ASG wordmark / product header */}
        {config.headerLabel ? (
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px', color: tv.text, marginBottom: 6, lineHeight: 1.2 }}>
              {config.headerLabel}
            </div>
            <div style={{ fontSize: 12, color: tv.gray, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              AxiomStream Group
            </div>
          </div>
        ) : (
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: tv.gray,
              marginBottom: 36,
            }}
          >
            AxiomStream Group
          </div>
        )}

        <div
          style={{
            background: tv.surface,
            border: `1px solid ${tv.border}`,
            borderRadius: 20,
            padding: '40px 32px 32px',
          }}
        >
          <div style={{ height: 3, width: 48, background: accent, borderRadius: 2, margin: '0 auto 24px' }} />

          <div
            style={{
              fontSize: 11,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: accent,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Made for {config.company}
          </div>

          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 6, color: tv.text }}>
            {config.clientName}
          </div>

          <div style={{ fontSize: 14, color: tv.gray, marginBottom: 32, lineHeight: 1.5 }}>
            {config.location && <>{config.location}<br /></>}
            <span style={{ fontSize: 12, color: tv.gray }}>Private Access</span>
          </div>

          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: tv.gray,
              marginBottom: 14,
            }}
          >
            Enter Access Code
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'center',
              marginBottom: 20,
              animation: pin.error ? 'asg-shake 0.35s ease' : 'none',
            }}
          >
            {pin.digits.map((d, i) => (
              <input
                key={i}
                id={`asg-pin-${i}`}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                autoFocus={i === 0}
                maxLength={1}
                value={d}
                aria-label={`Access code digit ${i + 1}`}
                onChange={e => pin.handleDigit(i, e.target.value)}
                onKeyDown={e => pin.handleKeyDown(i, e)}
                onPaste={i === 0 ? pin.handlePaste : undefined}
                style={{
                  width: 64,
                  height: 72,
                  background: tv.bg,
                  border: `2px solid ${pin.error ? '#ef4444' : d ? accent : tv.border}`,
                  borderRadius: 10,
                  fontSize: 32,
                  fontWeight: 700,
                  color: tv.text,
                  textAlign: 'center',
                  outline: 'none',
                  fontFamily: FONT_STACK,
                  transition: 'border-color 0.15s',
                  boxSizing: 'border-box',
                }}
              />
            ))}
          </div>

          {pin.error && (
            <div style={{ fontSize: 13, color: '#ef4444', marginBottom: 16 }}>
              Incorrect code. Try again.
            </div>
          )}

          <button
            onClick={pin.manualCheck}
            disabled={pin.digits.some(d => !d)}
            style={{
              width: '100%',
              minHeight: 44,
              padding: '14px',
              background: accent,
              color: tv.bg,
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: pin.digits.some(d => !d) ? 'not-allowed' : 'pointer',
              fontFamily: FONT_STACK,
              opacity: pin.digits.some(d => !d) ? 0.4 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            Unlock →
          </button>

          <div style={{ marginTop: 24, fontSize: 11, color: tv.gray, lineHeight: 1.6 }}>
            Access code provided by AxiomStream Group.
            <br />
            Questions?{' '}
            <a href="mailto:jfulmines@axiomstreamgroup.com" style={{ color: accent, textDecoration: 'none' }}>
              jfulmines@axiomstreamgroup.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
