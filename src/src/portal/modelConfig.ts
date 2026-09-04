/**
 * modelConfig — single source of truth for model selection across all
 * ASG client portals (Kit + Rex/Shield).
 *
 * Rex 2.0 alignment (2026-09-04): centralizes what used to be ~10 scattered
 * hardcoded model string literals across api/chat.ts and portal/Chat.tsx.
 * Change a model here once; every portal picks it up.
 */

export const MODEL_DEFAULTS = {
  /** Primary conversational model — used for all standard chat replies. */
  primary: 'claude-sonnet-5',

  /** Light/fast model — quick replies, memory summarization, background jobs. */
  light: 'claude-haiku-4-5-20251001',

  /** Heavy-analysis model — escalated for long documents, RFPs, engineering
   *  review, or any message matching the heavy-task pattern in api/chat.ts. */
  heavy: 'claude-sonnet-5',

  /** Fallback if the primary provider errors or times out. */
  fallback: 'gemini-3.5-flash',
} as const

export type ModelTier = keyof typeof MODEL_DEFAULTS

/** Heavy-task detection — used to decide primary vs. heavy escalation. */
export const HEAVY_TASK_PATTERNS: RegExp[] = [
  /\b(analyz|review|summariz|evaluat|assess|break.?down|read.?through)/i,
  /\b(rfp|solicitation|sow|statement.?of.?work|spec(ification)?|technical|engineering|proposal|bid|nsn|mil.?spec)/i,
  /\b(draft|write|create|compose).{0,30}(report|proposal|response|analysis|brief|plan)/i,
  /\b(compar|versus|pros.?and.?cons|trade.?off|recommend|strateg)/i,
]

export function isHeavyMessage(message: string, slug?: string, engineeringSlugs: string[] = []): boolean {
  if (slug && engineeringSlugs.includes(slug)) return true
  if (HEAVY_TASK_PATTERNS.some(r => r.test(message))) return true
  if (message.length > 800) return true
  return false
}

export function resolveModel(message: string, opts: { slug?: string; engineeringSlugs?: string[] } = {}): string {
  return isHeavyMessage(message, opts.slug, opts.engineeringSlugs) ? MODEL_DEFAULTS.heavy : MODEL_DEFAULTS.light
}
