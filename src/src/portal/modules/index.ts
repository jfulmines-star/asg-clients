/**
 * Module registry.
 *
 * Maps ModuleId → Module. ASGPortalBase reads this to render nav entries,
 * section content, banners, and post-chat hooks.
 *
 * Built-in modules (welcome, about, intake, chat) provide nav metadata here
 * but their Section content is rendered directly by ASGPortalBase — they need
 * access to intake/chat state that lives in the base composition. Every
 * non-built-in module (documents, stock-brief, retirement-planner,
 * time-tracker, cross-sell-banner, hubspot-hook) is fully self-contained.
 *
 * To add a new module:
 *   1. Extend ModuleId in ../types.ts
 *   2. Create ./yourModule.tsx exporting a Module
 *   3. Register it here
 */
import type { Module, ModuleId } from '../types'

import { documentsModule } from './documents'
import { stockBriefModule } from './stockBrief'
import { retirementPlannerModule } from './retirementPlanner'
import { timeTrackerModule } from './timeTracker'
import { crossSellBannerModule } from './crossSellBanner'
import { hubspotHookModule } from './hubspotHook'
import { DiningSection } from './dining'

// ── Built-in module nav metadata ────────────────────────────────────────────
// Section components for these are rendered by ASGPortalBase because they need
// access to base-level state (intake storage, chat history, PIN).
const welcomeModule: Module = {
  id: 'welcome',
  nav: { label: 'Welcome', icon: '👋' },
}

const aboutModule: Module = {
  id: 'about',
  nav: { label: 'About', icon: 'ℹ️' },
}

const intakeModule: Module = {
  id: 'intake',
  navFor: ({ intake, config }) => ({
    label: intake ? 'My Pipeline' : (config.agentId === 'rex' ? 'My Pipeline' : 'Quick Context'),
    icon: config.agentId === 'rex' ? '📋' : '📝',
    tag: intake ? undefined : '2 min',
  }),
}

const chatModule: Module = {
  id: 'chat',
  navFor: ({ config }) => ({
    label: `Chat with ${config.agentLabel}`,
    icon: '💬',
  }),
}

// ── Registry ────────────────────────────────────────────────────────────────
export const MODULE_REGISTRY: Record<ModuleId, Module> = {
  welcome: welcomeModule,
  about: aboutModule,
  intake: intakeModule,
  chat: chatModule,
  documents: documentsModule,
  'stock-brief': stockBriefModule,
  'retirement-planner': retirementPlannerModule,
  'time-tracker': timeTrackerModule,
  'cross-sell-banner': crossSellBannerModule,
  'hubspot-hook': hubspotHookModule,
  dining: {
    id: 'dining',
    nav: { label: 'Dining', icon: '🍽️' },
    Section: DiningSection,
  },
}

export function getModule(id: ModuleId): Module | undefined {
  return MODULE_REGISTRY[id]
}
