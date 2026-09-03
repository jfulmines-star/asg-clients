/**
 * Shield Technologies portal configs for ASGPortalBase.
 * Andrew Parks and Ryan Hopper — Rex agent, green accent.
 */
import type { PortalConfig } from '../portal/types'

// ─── ANDREW — Shield Technologies / Rex ─────────────────────────────────────
// clients.axiomstreamgroup.com/andrew
// Andy Parks — Shield Technologies rep portal. Rex agent, green accent.
export const ANDREW_CONFIG: PortalConfig = {
  slug: 'andrew',
  pin: '6291',
  clientName: 'Andy Parks',
  company: 'Shield Technologies',
  memberName: 'Andy',
  agentLabel: 'Rex',
  agentId: 'rex',
  accentColor: '#4ADE80',
  themeMode: 'dark',
  tagline:
    "Private access to Rex — your Shield Technologies AI, pre-loaded with your pipeline, " +
    "your accounts, and your territory. Every conversation starts from there.",
  whatWeKnow: [
    { label: 'Rep',       value: 'Andy Parks' },
    { label: 'Firm',      value: 'Shield Technologies' },
    { label: 'Territory', value: 'Navy buying commands · Coast Guard · DoD depots' },
    { label: 'Product',   value: 'Envelop engine protection covers — MRO & depot workflow' },
  ],
  poweredBy: 'AxiomStream Group · Rex',

  intakeLabel: 'My Pipeline — 2 Minutes',
  intakeTitle: 'Load Your Pipeline',
  intakeSubtitle: 'Give Rex your accounts, follow-ups, and territory. Takes 2 minutes. Every conversation after this starts smarter.',

  chat: {
    transport: 'api-proxy',
    placeholder: 'Ask Rex about an account, a follow-up, or a talking point…',
    greeting: (savedContext) =>
      savedContext
        ? "Andy — Rex here, your Shield context loaded. What are we working on?"
        : "Hey Andy. Rex here — your Shield instance. Drop into My Pipeline to load your accounts, or just ask me anything now.",
    apiEndpoint: '/api/chat',
    historyEndpoint: '/api/history',
    persistEndpoint: '/api/portal-chat-history',
  },

  intakeFields: [
    {
      key: 'topAccounts',
      label: 'Top 3 accounts right now',
      type: 'textarea',
      placeholder: 'Company, contact, where they are in the pipeline…',
    },
    {
      key: 'followUps',
      label: 'Follow-ups due this week',
      type: 'textarea',
      placeholder: 'Who, about what, by when',
    },
    {
      key: 'objections',
      label: 'Common objections you are hearing',
      type: 'chips',
      options: ['Price', 'Procurement timeline', 'Vendor approval process', 'Incumbent vendor', 'Proving ROI', 'Decision authority'],
    },
    {
      key: 'territory',
      label: 'Primary buying commands / depots',
      type: 'textarea',
      placeholder: 'Norfolk, Puget Sound, Cherry Point…',
    },
  ],

  modules: ['welcome', 'chat', 'documents', 'dining'],

  moduleOptions: {
    documents: {
      tenantId: 'andrew',
      description:
        'Upload Shield product sheets, MRO specs, meeting notes, or any file you want Rex to reference in account conversations.',
    },
  },

  aboutPoints: [
    {
      icon: '🛡️',
      title: 'Shield Context Loaded',
      body:
        'Rex opens already knowing Shield Technologies, the Envelop product line, your territory, ' +
        'and your pipeline. Skip the brief — start where the work is.',
    },
    {
      icon: '📋',
      title: 'Pipeline Ready',
      body:
        'Track your top accounts, follow-ups, and next actions. Rex keeps your pipeline organized ' +
        'without adding CRM overhead.',
    },
    {
      icon: '💬',
      title: 'Talking Points on Demand',
      body:
        'Ask Rex for objection handling, competitive positioning, or a quick brief on a buying ' +
        'command before you walk in the room.',
    },
    {
      icon: '📂',
      title: 'Docs in the Room',
      body:
        'Upload product sheets, specs, or meeting notes. Rex references them in every conversation.',
    },
  ],
}

// ─── RYANH — Shield Technologies / Rex ──────────────────────────────────────
// clients.axiomstreamgroup.com/ryanh
// Ryan Hopper — Shield Technologies rep portal. Rex agent, green accent.
export const RYANH_CONFIG: PortalConfig = {
  slug: 'ryanh',
  pin: '5506',
  clientName: 'Ryan Hopper',
  company: 'Shield Technologies',
  memberName: 'Ryan',
  agentLabel: 'Rex',
  agentId: 'rex',
  accentColor: '#4ADE80',
  themeMode: 'dark',
  tagline:
    "Private access to Rex — your Shield Technologies AI, pre-loaded with your pipeline " +
    "and territory. Every conversation starts from there.",
  whatWeKnow: [
    { label: 'Rep',       value: 'Ryan Hopper' },
    { label: 'Firm',      value: 'Shield Technologies' },
    { label: 'Territory', value: 'Navy buying commands · Coast Guard · DoD depots' },
    { label: 'Product',   value: 'Envelop engine protection covers — MRO & depot workflow' },
  ],
  poweredBy: 'AxiomStream Group · Rex',

  intakeLabel: 'My Pipeline — 2 Minutes',
  intakeTitle: 'Load Your Pipeline',
  intakeSubtitle: 'Give Rex your accounts, follow-ups, and territory. Takes 2 minutes. Every conversation after this starts smarter.',

  chat: {
    transport: 'api-proxy',
    placeholder: 'Ask Rex about an account, a follow-up, or a talking point…',
    greeting: (savedContext) =>
      savedContext
        ? "Ryan — Rex here, your Shield context loaded. What are we working on?"
        : "Hey Ryan. Rex here — your Shield instance. Drop into My Pipeline to load your accounts, or just ask me anything now.",
    apiEndpoint: '/api/chat',
    historyEndpoint: '/api/history',
    persistEndpoint: '/api/portal-chat-history',
  },

  intakeFields: [
    {
      key: 'topAccounts',
      label: 'Top 3 accounts right now',
      type: 'textarea',
      placeholder: 'Company, contact, where they are in the pipeline…',
    },
    {
      key: 'followUps',
      label: 'Follow-ups due this week',
      type: 'textarea',
      placeholder: 'Who, about what, by when',
    },
    {
      key: 'objections',
      label: 'Common objections you are hearing',
      type: 'chips',
      options: ['Price', 'Procurement timeline', 'Vendor approval process', 'Incumbent vendor', 'Proving ROI', 'Decision authority'],
    },
    {
      key: 'territory',
      label: 'Primary buying commands / depots',
      type: 'textarea',
      placeholder: 'Norfolk, Puget Sound, Cherry Point…',
    },
  ],

  modules: ['welcome', 'chat', 'documents', 'dining'],

  moduleOptions: {
    documents: {
      tenantId: 'ryanh',
      description:
        'Upload Shield product sheets, MRO specs, meeting notes, or any file you want Rex to reference in account conversations.',
    },
  },

  aboutPoints: [
    {
      icon: '🛡️',
      title: 'Shield Context Loaded',
      body:
        'Rex opens already knowing Shield Technologies, the Envelop product line, your territory, ' +
        'and your pipeline. Skip the brief — start where the work is.',
    },
    {
      icon: '📋',
      title: 'Pipeline Ready',
      body:
        'Track your top accounts, follow-ups, and next actions. Rex keeps your pipeline organized ' +
        'without adding CRM overhead.',
    },
    {
      icon: '💬',
      title: 'Talking Points on Demand',
      body:
        'Ask Rex for objection handling, competitive positioning, or a quick brief on a buying ' +
        'command before you walk in the room.',
    },
    {
      icon: '📂',
      title: 'Docs in the Room',
      body:
        'Upload product sheets, specs, or meeting notes. Rex references them in every conversation.',
    },
  ],
}

// ─── CALEB SABROSKI — Shield Technologies / Chief Engineer ───────────────────
// asg-clients.vercel.app/shield-caleb
// Caleb Sabroski — Chief Engineer, Shield Technologies. 9 years designing Envelop covers.
// SolidWorks, textile science, DoD MIL-SPEC, Six Sigma Green Belt. Full engineering + business context.

export const CALEB_CONFIG: PortalConfig = {
  slug: 'shield-caleb',
  pin: '4829',
  clientName: 'Caleb Sabroski',
  company: 'Shield Technologies',
  memberName: 'Caleb',
  agentLabel: 'Rex',
  agentId: 'rex',
  accentColor: '#4ADE80',
  themeMode: 'dark',
  tagline:
    "Private access to Rex — your Shield Engineering AI, pre-loaded with Envelop materials science, " +
    "DoD specifications, and design context. Every conversation starts from there.",
  whatWeKnow: [
    { label: 'Engineer',  value: 'Caleb Sabroski — Chief Engineer' },
    { label: 'Firm',      value: 'Shield Technologies Corporation' },
    { label: 'Focus',     value: 'Custom cover design · Materials science · DoD MIL-SPEC · SolidWorks' },
    { label: 'Product',   value: 'Envelop protective covers — 4-layer patented technology' },
  ],
  poweredBy: 'AxiomStream Group · Rex',

  intakeLabel: 'Current Projects — 2 Minutes',
  intakeTitle: 'Load Your Engineering Context',
  intakeSubtitle: 'Give Rex your active design projects, open specs, and technical priorities. Takes 2 minutes. Every conversation after this starts smarter.',

  chat: {
    transport: 'api-proxy',
    placeholder: 'Custom cover design, materials question, MIL-SPEC lookup, engineering analysis…',
    greeting: (savedContext) =>
      savedContext
        ? "Caleb — Rex here, your engineering context loaded. What are we working on?"
        : "Hey Caleb. Rex here — your Shield engineering instance. Load your current projects in the intake, or just ask me anything now. I've got full context on Envelop materials science, DoD specs, and the full product line.",
    apiEndpoint: '/api/chat',
    historyEndpoint: '/api/history',
    persistEndpoint: '/api/portal-chat-history',
  },

  intakeFields: [
    {
      key: 'activeDesigns',
      label: 'Active design projects',
      type: 'textarea',
      placeholder: 'Custom cover for X platform, spec request from Y, redesign of Z…',
    },
    {
      key: 'openSpecs',
      label: 'Open MIL-SPECs or RFPs you are working against',
      type: 'textarea',
      placeholder: 'Spec numbers, platform types, submission deadlines…',
    },
    {
      key: 'technicalChallenges',
      label: 'Current technical challenges',
      type: 'chips',
      options: ['Complex geometry', 'Material selection', 'VCI chemistry', 'ITAR coordination', 'Weight/bulk constraints', 'Custom color/marking', 'Production tooling', 'Testing requirements'],
    },
    {
      key: 'platforms',
      label: 'Platforms you are designing for right now',
      type: 'textarea',
      placeholder: 'Aircraft type, vehicle, weapons system, engine…',
    },
  ],

  modules: ['welcome', 'chat', 'documents', 'dining'],

  moduleOptions: {
    documents: {
      tenantId: 'shield-caleb',
      description:
        'Upload CAD specs, MIL-SPEC documents, material datasheets, or any file you want Rex to reference in engineering conversations.',
    },
  },

  aboutPoints: [
    {
      icon: '🔬',
      title: 'Engineering Context Loaded',
      body:
        'Rex opens already knowing Envelop\'s 4-layer materials science, DoD MIL-SPEC requirements, ' +
        'and the full product technical stack. Skip the background — start where the engineering is.',
    },
    {
      icon: '📐',
      title: 'Design Intelligence',
      body:
        'Ask Rex about material selection, geometric constraints, manufacturing considerations, ' +
        'or competitive technical analysis. It thinks like an engineer.',
    },
    {
      icon: '📋',
      title: 'Spec Lookup on Demand',
      body:
        'Get DoD MIL-SPEC references, NSN lookup support, ITAR/EAR framework guidance, ' +
        'and technical documentation — fast.',
    },
    {
      icon: '📂',
      title: 'Docs in the Room',
      body:
        'Upload datasheets, CAD specs, or meeting notes. Rex references them in every conversation.',
    },
  ],
}

// ─── GNOLES — Fiber Network Services / Kit ───────────────────────────────────
// clients.axiomstreamgroup.com/gnoles
// Greg Noles — Owner, Fiber Network Services. Kit agent, steel blue accent.
export const GNOLES_CONFIG: PortalConfig = {
  slug: 'gnoles',
  pin: '1996',
  clientName: 'Greg Noles',
  company: 'Fiber Network Services',
  memberName: 'Greg',
  agentLabel: 'Kit',
  agentId: 'kit',
  accentColor: '#4A7FA5',
  themeMode: 'dark',
  tagline:
    "Private access to Kit — your Fiber Network Services AI, pre-loaded with your Comcast/Cox " +
    "footprint, BEAD pipeline, and fleet operations. Every conversation starts from there.",
  whatWeKnow: [
    { label: 'Owner',     value: 'Greg Noles' },
    { label: 'Company',   value: 'Fiber Network Services (FNS)' },
    { label: 'Footprint', value: 'Eastern US — 14 offices, 200+ employees, 200+ fleet assets' },
    { label: 'Clients',   value: 'Comcast, Cox, Segra, Shentel, Windstream, RCN' },
  ],
  poweredBy: 'AxiomStream Group',

  intakeLabel: 'My Business — 2 Minutes',
  intakeTitle: 'Load Your Context',
  intakeSubtitle: "Give Kit your current priorities — MCA renewals, BEAD targets, fleet issues, hiring. Two minutes now means every conversation starts smarter.",

  chat: {
    transport: 'api-proxy',
    placeholder: 'Ask Kit anything…',
    greeting: (savedContext) =>
      savedContext
        ? "Greg — context loaded. What's the priority today?"
        : "Greg — Kit here. I'm briefed on FNS: your Comcast/Cox/Segra footprint, the eastern US office network, fleet operations, and where the BEAD opportunity sits. Where do you want to start?",
    apiEndpoint: '/api/chat',
    historyEndpoint: '/api/history',
    persistEndpoint: '/api/portal-chat-history',
  },

  intakeFields: [
    {
      key: 'mcaPriorities',
      label: 'Current MCA priorities (Comcast, Cox, others)',
      type: 'textarea',
      placeholder: 'Which contracts are up for renewal, any performance issues, new work coming…',
    },
    {
      key: 'beadTargets',
      label: 'BEAD / government buildout targets',
      type: 'textarea',
      placeholder: 'States you are pursuing, ISP primes you are talking to, certifications needed…',
    },
    {
      key: 'fleetOps',
      label: 'Fleet or crew issues right now',
      type: 'textarea',
      placeholder: 'Equipment problems, DOT audit prep, recruiting gaps, dispatch issues…',
    },
    {
      key: 'growthTargets',
      label: 'Growth targets this year',
      type: 'chips',
      options: ['New Comcast territory', 'Cox expansion', 'BEAD contracts', 'New state office', 'M&A / acquisition', 'New service line', 'Fleet expansion'],
    },
  ],

  defaultModule: 'chat',
  headerLabel: 'Kit - FNS',

  modules: ['welcome', 'chat', 'documents'],

  moduleOptions: {
    documents: {
      tenantId: 'gnoles',
      description:
        'Upload RFPs, MSA contracts, scope of work docs, or any file you want Rex to analyze. Drop it in and ask anything.',
    },
  },

  aboutPoints: [
    {
      icon: '📡',
      title: 'FNS Context Loaded',
      body:
        'Kit opens already knowing FNS — your Comcast/Cox/Segra footprint, eastern US offices, ' +
        'fleet operations, BEAD pipeline, and MCA landscape. Skip the brief, start where the work is.',
    },
    {
      icon: '🏗️',
      title: 'BEAD Pipeline Intelligence',
      body:
        'Track which states are awarding, which ISP primes to pursue, and what certifications ' +
        'FNS needs to be on approved contractor lists. ~$8B in your footprint.',
    },
    {
      icon: '💬',
      title: 'MCA Strategy on Demand',
      body:
        'Ask Rex about renewal leverage, scorecard positioning, competitive bids, or how to ' +
        'frame the next rate negotiation with Comcast or Cox.',
    },
    {
      icon: '📂',
      title: 'Contract & RFP Analysis',
      body:
        'Drop in any RFP, MSA, or scope of work. Rex reads it and gives you key terms, ' +
        'red flags, and negotiating leverage.',
    },
  ],
}
