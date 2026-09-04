/**
 * modelConfig — single source of truth for model selection across the
 * asg-clients API layer (api/chat.ts and any future API routes).
 *
 * Rex 2.0 alignment (2026-09-04): replaces ~10 scattered hardcoded model
 * string literals. Change a model here once; every call site picks it up.
 *
 * Mirrors src/src/portal/modelConfig.ts (frontend) — keep both in sync
 * when updating defaults.
 */

export const MODEL_DEFAULTS = {
  /** Primary conversational model for standard chat replies. */
  primary: 'claude-sonnet-5',

  /** Light/fast model — quick replies, memory summarization, background jobs,
   *  opener generation, and other latency-sensitive short calls. */
  light: 'claude-haiku-4-5-20251001',

  /** Heavy-analysis model — escalated for long documents, RFPs, engineering
   *  review, or any message matching the heavy-task pattern. */
  heavy: 'claude-sonnet-5',
} as const

/** Heavy-task detection patterns — shared across Shield/Rex routing logic. */
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
