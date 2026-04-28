/**
 * Cross-sell banner module.
 * Renders a small persistent banner above the main content. Options come from
 * moduleOptions['cross-sell-banner'] or fall back to config.crossSell.
 */
import { FONT_STACK } from '../theme'
import type { Module, ModuleContext } from '../types'

interface CrossSellOptions {
  message?: string
  href?: string
  accent?: string
  dismissible?: boolean
}

function CrossSellBanner({ config, accent, tv, options }: ModuleContext) {
  const opts = options as CrossSellOptions
  const message = opts.message || config.crossSell?.message
  const href = opts.href || config.crossSell?.href
  const color = opts.accent || config.crossSell?.accent || accent
  if (!message || !href) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 16px',
        background: `${color}10`,
        border: `1px solid ${color}30`,
        borderRadius: 8,
        fontSize: 13,
        color: tv.lightGray,
        textDecoration: 'none',
        fontFamily: FONT_STACK,
        lineHeight: 1.5,
      }}
    >
      <span style={{ fontSize: 14, flexShrink: 0 }}>✨</span>
      <span style={{ flex: 1 }}>{message}</span>
      <span style={{ color, fontWeight: 700, flexShrink: 0 }}>Learn more →</span>
    </a>
  )
}

export const crossSellBannerModule: Module = {
  id: 'cross-sell-banner',
  // No nav entry — renders as Banner only
  Banner: CrossSellBanner,
}
