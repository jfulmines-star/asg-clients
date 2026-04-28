/**
 * Stock Brief module.
 * Port of MarkPortal's StockBriefSection, generalized.
 * The ticker watchlist is config-driven via moduleOptions['stock-brief'].tickers.
 */
import { FONT_STACK } from '../theme'
import type { Module, ModuleContext } from '../types'

interface StockBriefOptions {
  /** URL to the brief viewer, e.g. https://axiomstreamgroup.com/stock-brief.html */
  briefUrl?: string
  /** Ticker tiles to show. Empty = just the CTA button. */
  tickers?: Array<{ ticker: string; label: string; note?: string }>
  /** Headline copy for the "Landmark Lens" style callout */
  lensTitle?: string
  lensBody?: string
  /** Primary CTA highlight — pre-populate the brief with a specific ticker */
  primarySuggestion?: { ticker: string; reason: string }
}

function StockBriefSection({ config, accent, tv, options }: ModuleContext) {
  const opts = options as StockBriefOptions
  const briefUrl = opts.briefUrl || 'https://axiomstreamgroup.com/stock-brief.html'
  const tickers = opts.tickers || []
  const primary = opts.primarySuggestion

  return (
    <div style={{ maxWidth: 720, fontFamily: FONT_STACK, color: tv.text }}>
      <div style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: accent, fontWeight: 700, marginBottom: 16 }}>
        Instant 10-K Analysis
      </div>
      <h2 style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 14, lineHeight: 1.1 }}>
        Stock Brief
      </h2>
      <p style={{ fontSize: 16, color: tv.lightGray, lineHeight: 1.7, marginBottom: 20 }}>
        Enter any public company ticker. Get real financials, AI-synthesized catalysts, key risk factors —
        and a read through the lens of {config.company}.
      </p>

      {primary && (
        <div
          style={{
            background: `${accent}08`,
            border: `1px solid ${accent}20`,
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 24,
            fontSize: 13,
            color: tv.lightGray,
            lineHeight: 1.6,
          }}
        >
          <span style={{ color: accent, fontWeight: 700 }}>Start with {primary.ticker}.</span>{' '}
          {primary.reason}
        </div>
      )}

      <a
        href={primary ? `${briefUrl}?ticker=${encodeURIComponent(primary.ticker)}` : briefUrl}
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
          letterSpacing: 0.3,
          marginBottom: 28,
          minHeight: 44,
          boxSizing: 'border-box',
        }}
      >
        Open Stock Brief →
      </a>

      {tickers.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 24 }}>
          {tickers.map(t => (
            <a
              key={t.ticker}
              href={`${briefUrl}?ticker=${encodeURIComponent(t.ticker)}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'block',
                background: tv.surface,
                border: `1px solid ${tv.border}`,
                borderRadius: 8,
                padding: 14,
                textDecoration: 'none',
                transition: 'border-color 0.15s',
                minHeight: 44,
              }}
            >
              <div style={{ fontSize: 10, color: tv.gray, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
                {t.label}
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: accent }}>{t.ticker}</div>
              {t.note && <div style={{ fontSize: 12, color: tv.gray, marginTop: 4 }}>{t.note}</div>}
            </a>
          ))}
        </div>
      )}

      {opts.lensTitle && (
        <div
          style={{
            background: `${accent}08`,
            border: `1px solid ${accent}20`,
            borderRadius: 10,
            padding: '18px 22px',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: accent, marginBottom: 8 }}>
            {opts.lensTitle}
          </div>
          <p style={{ fontSize: 13, color: tv.lightGray, lineHeight: 1.7, margin: 0 }}>
            {opts.lensBody}
          </p>
        </div>
      )}
    </div>
  )
}

export const stockBriefModule: Module = {
  id: 'stock-brief',
  nav: { label: 'Stock Brief', icon: '📈', tag: 'Try it' },
  Section: StockBriefSection,
}
