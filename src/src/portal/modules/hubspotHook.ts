/**
 * HubSpot hook module.
 * Headless module — no UI. Logs chat exchanges to a configured endpoint.
 * The backend endpoint is responsible for actually hitting HubSpot's API with
 * the org's private app token — we never send the token client-side.
 *
 * Config:
 *   config.hubspot.contactId   — HubSpot contact the activity attaches to
 *   config.hubspot.logEvery    — 'message' (each exchange) | 'session' (TODO) | 'never'
 *   config.hubspot.endpoint    — defaults to '/api/hubspot/log-chat'
 *
 * Backend contract (POST):
 *   {
 *     contactId: string,
 *     slug: string,
 *     agentId: string,
 *     userMessage: string,
 *     assistantMessage: string,
 *     timestamp: string (ISO)
 *   }
 *
 * Failure is silent — this hook must never block the chat UX.
 */
import type { Module, ModuleContext } from '../types'

export const hubspotHookModule: Module = {
  id: 'hubspot-hook',
  // No Section, no Banner — headless
  onChatMessage: async (ctx: ModuleContext, exchange) => {
    const cfg = ctx.config.hubspot
    if (!cfg || !cfg.contactId) return
    if (cfg.logEvery === 'never') return
    if (cfg.logEvery !== 'message') return // 'session' not yet implemented

    const endpoint = cfg.endpoint || '/api/hubspot/log-chat'
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: cfg.contactId,
          slug: ctx.config.slug,
          agentId: ctx.config.agentId,
          userMessage: exchange.user,
          assistantMessage: exchange.assistant,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch {
      // Silent — logging must never break the chat
    }
  },
}
