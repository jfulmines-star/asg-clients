/**
 * ASGPortalBase — type definitions
 * Single source of truth for portal config + module shape.
 */
import type React from 'react'

// ─── Module identifiers ──────────────────────────────────────────────────────
// To add a new module: extend this union, add a Module to MODULE_REGISTRY,
// and (optionally) add it to a portal's `modules` array.
export type ModuleId =
  | 'welcome'
  | 'about'
  | 'intake'
  | 'chat'
  | 'documents'
  | 'stock-brief'
  | 'retirement-planner'
  | 'time-tracker'
  | 'cross-sell-banner'
  | 'hubspot-hook'
  | 'dining'

// ─── Intake field schema ─────────────────────────────────────────────────────
export interface IntakeField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'chips' | 'select'
  placeholder?: string
  /** For chips: comma-separated default selections. For text/textarea: initial value. */
  default?: string
  /** Required for chips and select */
  options?: string[]
  required?: boolean
}

// ─── Chat transport ──────────────────────────────────────────────────────────
export interface SystemPromptCtx {
  config: PortalConfig
  intake: Record<string, unknown> | null
  /** Practice context already serialized as markdown */
  practiceContext: string
}

export interface ChatConfig {
  /**
   * api-proxy: routes through /api/chat (existing backend). Non-streaming today.
   * anthropic-direct: client-side fetch to Anthropic Messages API. Streaming.
   */
  transport: 'api-proxy' | 'anthropic-direct'
  greeting: (savedContext: boolean) => string
  placeholder: string

  // ── api-proxy mode (existing backend contract) ──
  isLead?: boolean
  disableTeamContext?: boolean
  apiEndpoint?: string         // default '/api/chat'
  historyEndpoint?: string     // default '/api/history'
  persistEndpoint?: string     // default '/api/portal-chat-history'

  // ── anthropic-direct mode ──
  anthropic?: {
    /** Reads import.meta.env.VITE_ANTHROPIC_API_KEY when omitted */
    apiKey?: string
    model?: string             // default 'claude-sonnet-4-6'
    systemPrompt: (ctx: SystemPromptCtx) => string
    maxTokens?: number         // default 2048
  }
}

// ─── Portal config ───────────────────────────────────────────────────────────
export interface PortalConfig {
  // Identity
  slug: string                 // primary key: URL, localStorage namespace, Redis history key
  pin: string                  // 4-digit
  clientName: string
  company: string
  location?: string
  memberName?: string          // defaults to clientName
  agentLabel: string           // 'Kit' | 'Rex' | 'Aria' | 'Lex'
  agentId: string              // sent to /api/chat as `agent`

  // Branding
  accentColor: string
  themeMode?: 'dark' | 'light' | 'auto'
  tagline: string
  whatWeKnow: string | Array<{ label: string; value: string }>
  aboutPoints?: Array<{ icon: string; title: string; body: string }>
  poweredBy?: string

  // Chat
  chat: ChatConfig

  // Intake
  intakeLabel?: string
  intakeTitle?: string
  intakeSubtitle?: string
  intakeFields: IntakeField[]

  // Modules — order matters (= nav order)
  modules: ModuleId[]
  moduleOptions?: Partial<Record<ModuleId, Record<string, unknown>>>

  // Cross-sell
  crossSell?: {
    message: string
    href: string
    accent?: string
  }

  // UX overrides
  defaultModule?: string
  headerLabel?: string

  // HubSpot
  hubspot?: {
    contactId?: string
    logEvery?: 'message' | 'session' | 'never'
    endpoint?: string
  }
}

// ─── Module API ──────────────────────────────────────────────────────────────
export interface ModuleContext {
  config: PortalConfig
  accent: string
  isMobile: boolean
  intake: Record<string, unknown> | null
  navigateTo: (moduleId: ModuleId) => void
  options: Record<string, unknown>
  /** Theme tokens — see theme.ts */
  tv: ThemeTokens
}

export interface NavEntry {
  label: string
  icon: string
  tag?: string
}

export interface Module {
  id: ModuleId
  nav?: NavEntry
  navFor?: (ctx: ModuleContext) => NavEntry
  Section?: React.ComponentType<ModuleContext>
  Banner?: React.ComponentType<ModuleContext>
  onChatMessage?: (
    ctx: ModuleContext,
    exchange: { user: string; assistant: string }
  ) => void | Promise<void>
}

// ─── Theme tokens ────────────────────────────────────────────────────────────
export interface ThemeTokens {
  bg: string
  surface: string
  border: string
  gray: string
  lightGray: string
  text: string
  subtext: string
}

// ─── Chat message ────────────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  /** Transient client-side id used to replace placeholders */
  _id?: number
}
