/**
 * ASGPortalBase — theme tokens
 * Single source of truth for colors, typography, spacing.
 * Replaces the per-portal duplicated GOLD/TEAL/BG/SURFACE constants.
 */
import type { ThemeTokens } from './types'

// ── ASG brand ───────────────────────────────────────────────────────────────
export const ASG_GOLD = '#E8B84B'
export const ASG_TEAL = '#27B5A3'

// ── Mobile spec — enforceable rules ──
export const MOBILE_BREAKPOINT_PX = 768

export const TOUCH = {
  minTarget: 44,        // 44x44 minimum tap area
  minSpacing: 8,        // 8px between targets
  inputFontSizeMobile: 16,  // prevents iOS auto-zoom
  bodyMinFontSize: 16,
} as const

export const FONT_SIZE: Record<'sm' | 'md' | 'lg', number> = {
  sm: 13,
  md: 15,
  lg: 18,
}

// ── Theme palettes ──────────────────────────────────────────────────────────
const DARK: ThemeTokens = {
  bg: '#0A0A0A',
  surface: '#111111',
  border: '#1F1F1F',
  gray: '#6B7280',
  lightGray: '#9CA3AF',
  text: '#FAFAFA',
  subtext: '#9CA3AF',
}

const LIGHT: ThemeTokens = {
  bg: '#F8F9FA',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  gray: '#6B7280',
  lightGray: '#4B5563',
  text: '#111827',
  subtext: '#6B7280',
}

export function getTheme(mode: 'dark' | 'light' | 'auto' = 'dark'): ThemeTokens {
  if (mode === 'light') return LIGHT
  if (mode === 'auto' && typeof window !== 'undefined') {
    const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches
    return prefersLight ? LIGHT : DARK
  }
  return DARK
}

// ── Common style fragments ──────────────────────────────────────────────────
export const FONT_STACK = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

/** Inject Inter font once — idempotent. */
export function ensureFontLoaded() {
  if (typeof document === 'undefined') return
  if (document.getElementById('asg-portal-font')) return
  const link = document.createElement('link')
  link.id = 'asg-portal-font'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
  document.head.appendChild(link)
}

/** Inject portal-wide CSS reset + animations once. */
export function ensureBaseStyles(bg: string) {
  if (typeof document === 'undefined') return
  let el = document.getElementById('asg-portal-base-style') as HTMLStyleElement | null
  const css = `
    html, body, #root { background: ${bg}; margin: 0; padding: 0; }
    body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    @keyframes asg-bounce { 0%,80%,100%{transform:scale(0.8);opacity:0.4} 40%{transform:scale(1.1);opacity:1} }
    @keyframes asg-shake  { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
  `
  if (!el) {
    el = document.createElement('style')
    el.id = 'asg-portal-base-style'
    document.head.appendChild(el)
  }
  el.textContent = css
}
