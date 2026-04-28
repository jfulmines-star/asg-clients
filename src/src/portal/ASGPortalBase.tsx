/**
 * ASGPortalBase — the locked baseline every ASG client portal extends.
 *
 * Responsibilities:
 *   1. Load Inter font + inject base CSS (once).
 *   2. Resolve theme from config.themeMode.
 *   3. Gate access via PinGate.
 *   4. Wire up intake, PIN, chat history hooks.
 *   5. Render desktop sidebar / mobile top bar + bottom tab bar.
 *   6. Iterate config.modules to build nav + section router.
 *   7. Render Banner modules above main content.
 *   8. Pass module onChatMessage hooks through to Chat.
 *
 * A portal file is now just:
 *     import { ASGPortalBase } from '@/portal/ASGPortalBase'
 *     import { JJF_CONFIG } from '@/config/portal-configs'
 *     export default function JJFPortal() { return <ASGPortalBase config={JJF_CONFIG} /> }
 */
import { useEffect, useMemo, useState } from 'react'
import { ensureFontLoaded, ensureBaseStyles, getTheme, FONT_STACK, TOUCH } from './theme'
import { useIsMobile, useIntake, useChatHistory } from './hooks'
import { PinGate } from './PinGate'
import { Chat } from './Chat'
import { MODULE_REGISTRY } from './modules'
import { WelcomeSection } from './sections/Welcome'
import { AboutSection } from './sections/About'
import { IntakeSection } from './sections/Intake'
import type {
  PortalConfig,
  ModuleId,
  ModuleContext,
  Module,
  NavEntry,
} from './types'

interface Props {
  config: PortalConfig
}

export function ASGPortalBase({ config }: Props) {
  // ── Theme toggle (user-controlled, overrides config default) ───────────────
  const defaultMode = config.themeMode || 'dark'
  const [themeOverride, setThemeOverride] = useState<'dark' | 'light'>(defaultMode === 'light' ? 'light' : 'dark')
  const tv = useMemo(() => getTheme(themeOverride), [themeOverride])
  const isMobile = useIsMobile()
  const accent = config.accentColor

  // ── Font size (user-controlled: 14–20px, default 20 on mobile / 16 on desktop) ──
  const [fontSize, setFontSize] = useState(isMobile ? 20 : 16)
  const fontSizeMin = 13
  const fontSizeMax = 20

  // ── Side effects: fonts + base CSS ─────────────────────────────────────────
  useEffect(() => { ensureFontLoaded() }, [])
  useEffect(() => { ensureBaseStyles(tv.bg) }, [tv.bg])

  // ── State ──────────────────────────────────────────────────────────────────
  const [unlocked, setUnlocked] = useState(false)
  const [active, setActive] = useState<ModuleId>((config.defaultModule as ModuleId) || 'welcome')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const intake = useIntake(config)
  const history = useChatHistory(config, unlocked)

  // Build module list in config order, skip unknown IDs
  const modules: Module[] = useMemo(
    () => config.modules.map(id => MODULE_REGISTRY[id]).filter(Boolean),
    [config.modules],
  )

  // ── Module context builder ────────────────────────────────────────────────
  function buildCtx(moduleId: ModuleId): ModuleContext {
    const options = (config.moduleOptions?.[moduleId] as Record<string, unknown>) || {}
    return {
      config,
      accent,
      isMobile,
      intake: intake.saved ? intake.fields : null,
      navigateTo: (id: ModuleId) => {
        setActive(id)
        setSidebarOpen(false)
      },
      options,
      tv,
    }
  }

  // ── Pin gate ──────────────────────────────────────────────────────────────
  if (!unlocked) {
    return <PinGate config={config} tv={tv} onUnlock={() => setUnlocked(true)} />
  }

  // ── Build nav entries (in config order) ───────────────────────────────────
  const navEntries: Array<{ id: ModuleId; entry: NavEntry }> = []
  for (const m of modules) {
    const ctx = buildCtx(m.id)
    const entry = m.navFor ? m.navFor(ctx) : m.nav
    if (entry) navEntries.push({ id: m.id, entry })
  }

  // ── Banners (modules that export a Banner component) ──────────────────────
  const banners = modules.filter(m => m.Banner)

  // ── Render active section ─────────────────────────────────────────────────
  function renderSection() {
    const ctx = buildCtx(active)
    switch (active) {
      case 'welcome':
        return <WelcomeSection {...ctx} />
      case 'about':
        return <AboutSection {...ctx} />
      case 'intake':
        return (
          <IntakeSection
            {...ctx}
            fields={intake.fields}
            setFields={intake.setFields}
            saved={intake.saved}
            onSave={intake.save}
          />
        )
      case 'chat':
        return (
          <Chat
            config={config}
            tv={tv}
            isMobile={isMobile}
            preloadedHistory={history}
            intake={intake.saved ? intake.fields : null}
            intakeAsMarkdown={intake.asMarkdown()}
            modules={modules}
            moduleCtx={(id) => buildCtx(id as ModuleId)}
            fontSize={fontSize}
          />
        )
      default: {
        const m = MODULE_REGISTRY[active]
        if (m?.Section) {
          const Section = m.Section
          return <Section {...ctx} />
        }
        return (
          <div style={{ padding: 40, color: tv.lightGray, fontFamily: FONT_STACK }}>
            Module "{active}" has no Section.
          </div>
        )
      }
    }
  }

  // ── Layout ────────────────────────────────────────────────────────────────
  const SIDEBAR_WIDTH = 260

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: tv.bg,
        color: tv.text,
        fontFamily: FONT_STACK,
        fontSize: fontSize,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
      }}
    >
      {/* ── Mobile top bar ── */}
      {isMobile && (
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            background: tv.bg,
            borderBottom: `1px solid ${tv.border}`,
            padding: '12px 16px',
            paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <Wordmark accent={accent} tv={tv} compact label={config.headerLabel} />
          <button
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Toggle menu"
            style={{
              minWidth: TOUCH.minTarget,
              minHeight: TOUCH.minTarget,
              border: `1px solid ${tv.border}`,
              background: 'transparent',
              color: tv.text,
              borderRadius: 8,
              fontSize: 18,
              cursor: 'pointer',
              fontFamily: FONT_STACK,
            }}
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
        </header>
      )}

      {/* ── Sidebar (desktop) / drawer (mobile) ── */}
      {(!isMobile || sidebarOpen) && (
        <aside
          style={{
            width: isMobile ? '100%' : SIDEBAR_WIDTH,
            background: tv.surface,
            borderRight: isMobile ? 'none' : `1px solid ${tv.border}`,
            borderBottom: isMobile ? `1px solid ${tv.border}` : 'none',
            padding: isMobile ? '16px' : '28px 18px',
            position: isMobile ? 'sticky' : 'sticky',
            top: isMobile ? 61 : 0,
            height: isMobile ? 'auto' : '100dvh',
            overflowY: 'auto',
            boxSizing: 'border-box',
            zIndex: 30,
            flexShrink: 0,
          }}
        >
          {!isMobile && (
            <div style={{ marginBottom: 28 }}>
              <Wordmark accent={accent} tv={tv} label={config.headerLabel} />
              <div style={{ fontSize: 10, color: tv.gray, letterSpacing: 2, textTransform: 'uppercase', marginTop: 10 }}>
                {config.company}
              </div>
            </div>
          )}

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navEntries.map(({ id, entry }) => {
              const isActive = active === id
              return (
                <button
                  key={id}
                  onClick={() => { setActive(id); setSidebarOpen(false) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '10px 12px',
                    minHeight: TOUCH.minTarget,
                    background: isActive ? `${accent}15` : 'transparent',
                    color: isActive ? accent : tv.lightGray,
                    border: 'none',
                    borderRadius: 8,
                    textAlign: 'left',
                    fontFamily: FONT_STACK,
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'background 0.12s, color 0.12s',
                  }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{entry.icon}</span>
                  <span style={{ flex: 1 }}>{entry.label}</span>
                  {entry.tag && (
                    <span
                      style={{
                        fontSize: 9,
                        letterSpacing: 1.5,
                        textTransform: 'uppercase',
                        color: accent,
                        background: `${accent}20`,
                        padding: '3px 8px',
                        borderRadius: 10,
                        fontWeight: 800,
                      }}
                    >
                      {entry.tag}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* ── Theme + Font controls ── */}
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Light/Dark toggle */}
            <button
              onClick={() => setThemeOverride(m => m === 'dark' ? 'light' : 'dark')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'transparent', border: `1px solid ${tv.border}`,
                borderRadius: 8, padding: '7px 10px', cursor: 'pointer',
                color: tv.gray, fontSize: 12, fontFamily: FONT_STACK, width: '100%',
              }}
            >
              <span style={{ fontSize: 14 }}>{themeOverride === 'dark' ? '☀️' : '🌙'}</span>
              {themeOverride === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            {/* Font size control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 2px' }}>
              <span style={{ fontSize: 11, color: tv.gray, flex: 1 }}>Text size</span>
              <button
                onClick={() => setFontSize(s => Math.max(fontSizeMin, s - 1))}
                disabled={fontSize <= fontSizeMin}
                style={{ width: 26, height: 26, border: `1px solid ${tv.border}`, borderRadius: 6, background: 'transparent', color: tv.gray, cursor: fontSize > fontSizeMin ? 'pointer' : 'default', fontSize: 14, fontFamily: FONT_STACK, opacity: fontSize <= fontSizeMin ? 0.4 : 1 }}
              >−</button>
              <span style={{ fontSize: 11, color: tv.text, minWidth: 22, textAlign: 'center' }}>{fontSize}</span>
              <button
                onClick={() => setFontSize(s => Math.min(fontSizeMax, s + 1))}
                disabled={fontSize >= fontSizeMax}
                style={{ width: 26, height: 26, border: `1px solid ${tv.border}`, borderRadius: 6, background: 'transparent', color: tv.gray, cursor: fontSize < fontSizeMax ? 'pointer' : 'default', fontSize: 14, fontFamily: FONT_STACK, opacity: fontSize >= fontSizeMax ? 0.4 : 1 }}
              >+</button>
            </div>
          </div>

          {!isMobile && (
            <div style={{ marginTop: 16, fontSize: 10, color: tv.gray, letterSpacing: 1, lineHeight: 1.6 }}>
              {config.poweredBy || 'AxiomStream Group'}
            </div>
          )}
        </aside>
      )}

      {/* ── Main content ── */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: isMobile ? '20px 16px' : '40px 48px',
          paddingBottom: isMobile ? 'calc(20px + env(safe-area-inset-bottom, 0px))' : 48,
          boxSizing: 'border-box',
        }}
      >
        {/* Banner slot */}
        {banners.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {banners.map(m => {
              const BannerCmp = m.Banner!
              const ctx = buildCtx(m.id)
              return <BannerCmp key={m.id} {...ctx} />
            })}
          </div>
        )}

        {renderSection()}
      </main>
    </div>
  )
}

// ── ASG Wordmark ────────────────────────────────────────────────────────────
function Wordmark({ accent, tv, compact = false, label }: { accent: string; tv: { text: string }; compact?: boolean; label?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONT_STACK }}>
      <div
        style={{
          width: compact ? 28 : 32,
          height: compact ? 28 : 32,
          borderRadius: 6,
          background: accent,
          color: '#0A0A0A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: compact ? 14 : 16,
          letterSpacing: -0.5,
          flexShrink: 0,
        }}
      >
        A
      </div>
      <div style={{ color: tv.text, fontSize: compact ? 13 : 15, fontWeight: 800, letterSpacing: -0.3 }}>
        {label || 'AxiomStream'}
      </div>
    </div>
  )
}
