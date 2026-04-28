// ─── Portal Config Registry ──────────────────────────────────────────────────
// One entry per client. No bespoke .tsx per client — the generic
// ClientPortalV2 component renders from this config.

export type AgentId = 'rex' | 'aria' | 'lex' | 'atlas' | 'kit'

export interface AboutPoint {
  icon: string
  title: string
  body: string
}

export interface IntakeField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'chips'
  placeholder?: string
  default?: string
  options?: string[]  // for chips
}

export interface PortalConfig {
  slug: string
  pin: string
  clientName: string        // first name — used in greeting ("Hey Blake.")
  company: string           // full company name
  agentId: AgentId
  agentLabel: string        // what to call the agent ("Rex", "Aria", etc.)
  accentColor: string       // primary accent hex
  tagline: string           // one line under the agent name on welcome
  whatWeKnow: string        // pre-loaded context blurb on welcome card
  chatPlaceholder: string   // textarea placeholder in chat
  chatGreeting: (hasSavedContext: boolean) => string
  intakeFields: IntakeField[]
  aboutPoints?: AboutPoint[]  // override default "About Your Agent" bullets
  poweredBy?: string        // footer override — default "Powered by AxiomStream Group"
  whiteLabel?: boolean      // if true, omit ASG branding from chart exports
  memberName?: string       // full name used for Redis member key (e.g. "Ryan Hopper") — falls back to clientName
  disableTeamContext?: boolean  // if true, suppress cross-member context injection (use for individual clients)
}

// ─── Client Configs ──────────────────────────────────────────────────────────

const REX_CRE_INTAKE: IntakeField[] = [
  {
    key: 'dealVolume',
    label: 'Typical deal volume — roughly how many transactions per year?',
    type: 'text',
    placeholder: 'e.g. 20–30 deals, $50M+ volume',
  },
  {
    key: 'docPain',
    label: 'Where does document review eat the most time?',
    type: 'text',
    placeholder: 'Lease review, PSA red-lining, LOI drafting...',
  },
  {
    key: 'dealTypes',
    label: 'Deal types you work most',
    type: 'chips',
    options: ['Office Leases', 'Industrial Leases', 'Retail Leases', 'Multifamily', 'PSA / Acquisition', 'Land', 'Investment / Disposition', 'Tenant Rep'],
    default: '',
  },
  {
    key: 'currentTools',
    label: 'Current tools you use for document review or deal management',
    type: 'text',
    placeholder: 'CoStar, DocuSign, CRE-specific software, none...',
  },
  {
    key: 'notes',
    label: 'Anything else about your practice or how you work?',
    type: 'textarea',
    placeholder: 'Client mix, standard deal structures, what makes your practice different...',
  },
]

export const PORTAL_CONFIGS: Record<string, PortalConfig> = {

  // ── JJ test — internal V2 UX validation ─────────────────────────────────
  jj: {
    slug: 'jj',
    pin: '0000',
    clientName: 'JJ',
    company: 'AxiomStream Group',
    agentId: 'rex',
    agentLabel: 'Rex',
    accentColor: '#4ADE80',
    tagline: 'CRE & Deal Intelligence — V2 Test',
    whatWeKnow: 'Jason Fulmines · CEO, AxiomStream Group · Builder of this product · Testing V2 portal architecture. Go through the full flow as if you were a real client.',
    chatPlaceholder: 'Ask anything, test the flow, paste a clause...',
    chatGreeting: (saved) => saved
      ? "Context loaded — you're back. What are you working on?"
      : "Hey JJ — you're testing the V2 portal. Walk through the intake, save your context, then come back to this chat and see what the returning-user experience looks like.",
    intakeFields: REX_CRE_INTAKE,
    poweredBy: 'AxiomStream Group · V2 Architecture Test',
  },

  // ── Shield Technologies — Andy Parks ────────────────────────────────────
  andrew: {
    slug: 'andrew',
    pin: '6291',
    clientName: 'Andy',
    company: 'Shield Technologies Corporation',
    agentId: 'rex',
    agentLabel: 'Rex',
    accentColor: '#4ADE80',
    tagline: 'Sales Strategy & Government Capture Intelligence',
    whatWeKnow: 'Director of Sales · Shield Technologies Corporation (Envelop Covers) · Marine Corps veteran, Iraq · DoD sales: Army, Marine Corps, Navy · Florida-based · NSN-assigned products on existing contract vehicles · $23B corrosion market · Southwest Airlines MRO expansion play in pipeline.',
    chatPlaceholder: 'Pipeline, capture strategy, account targeting, outreach — what are we working on?',
    chatGreeting: (saved) => saved
      ? "Andy — context loaded. What's the priority today?"
      : "Andy — I've been briefed on Shield, the Envelop line, and your government and commercial pipeline. Where do you want to start — pipeline hygiene, capture strategy, or the Southwest play?",
    intakeFields: [],
  },

  // ── Shield Technologies — Mark Bechtel ──────────────────────────────────
  markb: {
    slug: 'markb',
    pin: '9993',
    clientName: 'Mark',
    company: 'Shield Technologies — Aviation',
    agentId: 'rex',
    agentLabel: 'Rex',
    accentColor: '#4ADE80',
    tagline: 'Aviation Sales Strategy · Commercial & Military MRO',
    whatWeKnow: 'Field Services Rep, Aviation · Shield Technologies Corporation · Territory: commercial MROs, airline maintenance, military aviation depots · Key target: Southwest Airlines (800+ all-737 fleet) · Also: RAAF, JSDF F-35 MRO, US carrier expansion.',
    chatPlaceholder: 'Aviation accounts, MRO outreach, pitch strategy — what are we working on?',
    chatGreeting: (saved) => saved
      ? "Mark — context loaded. What's the aviation priority today?"
      : "Mark — I'm up to speed on your territory: Southwest, the commercial MRO pipeline, and military aviation. What are we working on?",
    intakeFields: [],
  },

  // ── Shield Technologies — Ryan Hopper ───────────────────────────────────
  ryanh: {
    slug: 'ryanh',
    pin: '5506',
    clientName: 'Ryan',
    memberName: 'Ryan Hopper',
    company: 'Shield Technologies — Navy & Coast Guard',
    agentId: 'rex',
    agentLabel: 'Rex',
    accentColor: '#4ADE80',
    tagline: 'Navy, Coast Guard & Commercial Aviation',
    whatWeKnow: 'Field Service Rep, Navy/Coast Guard/Commercial Aviation · Shield Technologies Corporation · Territory: NAVSEA, NAVAIR, NAVSUP, naval depots, USCG, Commercial MRO · CFM56 + CFM LEAP engine covers · Southwest Airlines active account (Jaime, Christopher Richardson, Megan Kahle) · MRO Americas April 21–23.',
    chatPlaceholder: 'Southwest pipeline, Navy/USCG capture, MRO accounts — what are we working on?',
    chatGreeting: (saved) => saved
      ? "Ryan — context loaded. What's the priority today?"
      : "Ryan — I'm briefed on your territory: Navy buying commands, Coast Guard, and the depot pipeline. What are we working on?",
    intakeFields: [],
  },

  // ── Shield Technologies — Jeff Dicks (CFO) ───────────────────────────────
  'shield-jeffd': {
    slug: 'shield-jeffd',
    pin: '7742',
    clientName: 'Jeff',
    memberName: 'Jeff Dicks',
    company: 'Shield Technologies Corporation',
    agentId: 'rex',
    agentLabel: 'Rex',
    accentColor: '#4ADE80',
    tagline: 'Your Rex — Shield business intelligence + advanced accounting',
    whatWeKnow: 'CFO · Shield Technologies Corporation · Manufacturer of Envelop protective covers — world\'s most advanced tactical environmental protection systems for military equipment, aircraft, and vehicles · Selected by all 5 U.S. military branches + international allies (German Navy, Australian Defence Force, Japan JSDF) since 2003 · 120,000+ covers delivered · 500+ NSN-assigned designs on DLA DIBBS, FEDMALL, GSA MAS, GWAC vehicles · SBIR Phase III status enables direct DoD contracting · Commercial aviation: CFM56-7B and LEAP-1B engine covers; Southwest Airlines, American Airlines, Frontier Airlines · Core value prop: 4-layer patented technology — waterproof + breathable + VCI corrosion inhibition — only system combining all three; up to 95% corrosion reduction · $23B annual DoD corrosion cost; ROI >20:1 per platform · CFO focus: DCAA audit readiness, Cost Accounting Standards (CAS) compliance, NSN-based margin analysis, government contract revenue recognition (DoD contract vehicles), DFARS accounting requirements, indirect cost rate structures (fringe/overhead/G&A), incurred cost submissions, SBIR Phase III financial implications · ASG engagement: AI-assisted financial intelligence, contract accounting, strategic CFO support.',
    chatPlaceholder: 'Contract accounting, DCAA prep, margin analysis, revenue recognition — what are we working on?',
    chatGreeting: (saved) => saved
      ? "Jeff — context loaded. What's the priority?"
      : "Jeff — your Rex is tuned specifically to Shield's business — the Envelop product line, government contract vehicles, DoD customers, and the commercial MRO pipeline. I'm also advanced on the accounting side: DCAA audit readiness, Cost Accounting Standards, government contract revenue recognition, indirect cost structures. Where do you want to start?",
    intakeFields: [],
  },

  // ── Shield Technologies — Jim Oaks (COO) ────────────────────────────────
  'shield-jimoaks': {
    slug: 'shield-jimoaks',
    pin: '3381',
    clientName: 'Jim',
    memberName: 'Jim Oaks',
    company: 'Shield Technologies Corporation',
    agentId: 'rex',
    agentLabel: 'Rex',
    accentColor: '#4ADE80',
    tagline: 'COO Intelligence — Operations, Compliance & Capture Strategy',
    whatWeKnow: 'COO · Shield Technologies Corporation · Manufacturer of Envelop protective covers — world\'s most advanced tactical environmental protection systems for military equipment, aircraft, and vehicles · Selected by all 5 U.S. military branches since 2003 · 120,000+ covers delivered · 500+ NSN-assigned designs · Product: 4-layer patented technology (waterproof outer layer + non-porous membrane blocking SO2/chloride molecules + VCI corrosion inhibitor releasing ions that prevent oxygen bonding + hydrophobic wicking layer) · Performance: USAF 12-month study: 20x more effective than shelters; USN 4-month test: 95% corrosion reduction; German Navy: "Significantly Superior" · Sole-source qualified Army spec PRF13051908 (M777/M119 howitzers) · Made in USA · SBIR Phase III status · International: Australian ADF (59-tank M1A1 fleet, $9.6M AUD 10-year savings), RAAF, JSDF F-35 MRO programs (export license management required under ITAR/EAR) · Commercial: CFM56-7B and LEAP-1B engine covers; Southwest Airlines, American Airlines, Frontier Airlines · COO operational scope: ITAR/EAR export compliance, CMMC 2.0 (NIST 800-171 controls), FAR/DFARS clause compliance, quality management (AS9100/ISO 9001), NSN entry/validation, supply chain (Made in USA) · ASG engagement: operational intelligence, compliance posture, process efficiency, capture support.',
    chatPlaceholder: 'Compliance, operations, export controls, capture strategy — what are we working on?',
    chatGreeting: (saved) => saved
      ? "Jim — context loaded. What's the priority?"
      : "Jim — I'm up to speed on Shield's operations: ITAR posture, CMMC 2.0 requirements, FAR/DFARS compliance, and the RAAF/JSDF programs. What do you want to dig into?",
    intakeFields: [],
  },

  // ── Nancy — JJ's Mom ─────────────────────────────────────────────────────
  nancy: {
    slug: 'nancy',
    pin: '1950',
    clientName: 'Nancy',
    company: 'Personal',
    agentId: 'kit',
    agentLabel: 'Kit',
    accentColor: '#E8B84B',
    tagline: 'Your personal AI from AxiomStream Group',
    whatWeKnow: '',
    chatPlaceholder: 'Type or speak your message...',
    chatGreeting: () => "Hi Nancy! Great to have you here — this is your own portal so you don't have to email back and forth anymore. You can ask me anything right here, and I can still email you documents whenever you'd like a copy. What's on your mind?",
    intakeFields: [],
    poweredBy: 'Built for you by AxiomStream Group · JJ\'s company',
  },

  // ── Jill — JJ's person ───────────────────────────────────────────────────
  jill: {
    slug: 'jill',
    pin: '3131',
    clientName: 'Jill',
    company: 'Personal',
    agentId: 'kit',
    agentLabel: 'Kit',
    accentColor: '#2563EB',
    tagline: 'Your personal AI from AxiomStream Group',
    whatWeKnow: '',
    chatPlaceholder: 'Type or speak your message...',
    chatGreeting: () => "Hi Jill! JJ set this up for you — think of it as your own personal assistant. You can ask me anything: travel planning, advice, research, whatever. I already know a bit about you, so no need to start from scratch. What's on your mind?",
    intakeFields: [],
    poweredBy: 'Built for you by AxiomStream Group · JJ\'s company',
  },

  // ── Doug Goeckel — Niagara Frontier Orthopaedic / DePuy Synthes ─────────
  dougg: {
    slug: 'dougg',
    pin: '6202',
    clientName: 'Doug',
    company: 'Niagara Frontier Orthopaedic Supplies',
    agentId: 'rex',
    agentLabel: 'Rex',
    accentColor: '#4ADE80',
    tagline: 'Medical Device Sales Intelligence · WNY Territory',
    whatWeKnow: 'Medical device sales professional at Niagara Frontier Orthopaedic Supplies LLC, the DePuy Synthes distributor for WNY. Full DePuy portfolio: joint reconstruction (ATTUNE Knee, CORAIL/PINNACLE Hip), spine, trauma, and sports med. Calls on orthopedic surgeons across Western New York. Long-time resident of Ransom Oaks in East Amherst — well-connected community member.',
    chatPlaceholder: 'Ask about a competitor, prep for a surgeon call, work through a deal...',
    chatGreeting: (saved) => saved
      ? "Hey Doug — good to have you back. What are you working on?"
      : "Hey Doug — I'm Rex. Before I get into it, do you mind if I ask you a few questions so I can be as useful as possible? Won't take long.",
    intakeFields: [],
    poweredBy: 'Powered by AxiomStream Group · Built for you',
  },

  // ── Deus X Defense — Mike Gugino ────────────────────────────────────────
  dxdmike: {
    slug: 'dxdmike',
    pin: '7731',
    clientName: 'Mike',
    company: 'Deus X Defense',
    agentId: 'rex',
    agentLabel: 'Your Agent',
    accentColor: '#3B82F6',
    tagline: 'Business Development & Revenue Strategy · DXD',
    whatWeKnow: 'CRO / Sales Lead · Deus X Defense · Army veteran, investment banking (Evercore, JPMorgan), tech (Axon) · Physical security: DaaS, manned guarding, remote monitoring, executive protection · Early stage, seed-funded, targeting 2027 round · Geographic focus: TX, FL, AZ · Current priority: zero-to-one product-market fit across key verticals.',
    chatPlaceholder: 'Market research, prospect lists, outreach strategy, deal planning — what are we working on?',
    chatGreeting: (saved) => saved
      ? "Mike — context loaded. What's the priority today?"
      : "Mike — I've been briefed on DXD, your verticals, and your go-to-market. Your number one priority is revenue — let's get to work. What do you want to tackle first?",
    aboutPoints: [
      {
        icon: '🚀',
        title: 'Built for Founders in Build Mode',
        body: 'Your Agent was designed for exactly where DXD is right now — early stage, building product-market fit, working every angle at once. It\'s a strategic partner that thinks with you, not just a tool that answers questions.',
      },
      {
        icon: '🎯',
        title: 'Market Diligence at Speed',
        body: 'Tell it a product idea — a new vertical, a new geography, a new segment. It will research the market, size the opportunity, identify the right buyers, surface the competition, and give you an honest assessment of where it fits in your strategy.',
      },
      {
        icon: '💡',
        title: 'From Idea to Business Case',
        body: 'Your Agent can take a half-formed idea and build it out — market analysis, customer definition, revenue model, go-to-market approach, risk assessment, and a proof-of-concept framework. The kind of work that used to take weeks.',
      },
      {
        icon: '📣',
        title: 'Brand Building and Market Presence',
        body: 'DXD wins trust before it wins contracts. Your Agent helps you build the brand — thought leadership content, messaging that lands with each buyer type, and a presence strategy that generates inbound before you make your first call.',
      },
      {
        icon: '🏗️',
        title: 'The ASG Model',
        body: 'AxiomStream Group builds purpose-specific AI for businesses in motion. An agent configured for DXD — your products, your market, your stage — that gets sharper the more you use it.',
      },
    ],
    intakeFields: [
      {
        key: 'topVertical',
        label: 'Which product vertical are you prioritizing right now?',
        type: 'chips',
        options: ['Drone-as-a-Service (DaaS)', 'Manned Guarding', 'Remote Monitoring & Response', 'Executive Protection', 'Training & Consulting'],
        default: 'Drone-as-a-Service (DaaS)',
      },
      {
        key: 'targetMarket',
        label: 'Which customer segment is highest priority for that vertical?',
        type: 'chips',
        options: ['Schools & Campuses', 'Critical Infrastructure', 'Private Estates / HNW', 'Construction Sites', 'Public Safety & Defense', 'Corporate / Executive'],
        default: 'Schools & Campuses,Critical Infrastructure',
      },
      {
        key: 'biggestChallenge',
        label: 'What is the hardest problem in your business right now?',
        type: 'text',
        placeholder: 'Finding the right buyers, proving the model, brand awareness, SEO/inbound...',
      },
      {
        key: 'geoFocus',
        label: 'Current geographic focus',
        type: 'chips',
        options: ['Texas', 'Florida', 'Arizona', 'National'],
        default: 'Texas,Florida,Arizona',
      },
      {
        key: 'notes',
        label: 'Anything else your agent should know about what you\'re working on?',
        type: 'textarea',
        placeholder: 'Current deals, ideas you want to explore, strategic questions on your mind...',
      },
    ],
    poweredBy: 'Powered by AxiomStream Group · Built for Deus X Defense',
  },

  // ── Deus X Defense — Dean Pratt ─────────────────────────────────────────
  dxddean: {
    slug: 'dxddean',
    pin: '9284',
    clientName: 'Dean',
    company: 'Deus X Defense',
    agentId: 'rex',
    agentLabel: 'Your Agent',
    accentColor: '#6366F1',
    tagline: 'Technical Strategy & AI Architecture · DXD',
    whatWeKnow: 'Principal Architect · Deus X Defense · Former Senior Architect of Intelligent Edge practice globally, Accenture · Also Kyndryl, Google, Dell · Deep expertise in AI security, agentic risk, responsible AI, enterprise architecture · FedRAMP compliance roadmap in progress · Google Cloud Assured Workloads · NeMo Guardrails (NVIDIA) advocate.',
    chatPlaceholder: 'Architecture decisions, compliance, AI governance, vendor evaluation — what are we working on?',
    chatGreeting: (saved) => saved
      ? "Dean — context loaded. What are you working through?"
      : "Dean — I've been briefed on your background and DXD's technical priorities. FedRAMP, agentic security, data governance, build vs. buy — let's get into it. What's most pressing?",
    intakeFields: [
      {
        key: 'topPriority',
        label: 'What is your most pressing technical challenge right now?',
        type: 'text',
        placeholder: 'FedRAMP roadmap, AI guardrails, platform architecture, data governance...',
      },
      {
        key: 'complianceTargets',
        label: 'Compliance frameworks you\'re working toward',
        type: 'chips',
        options: ['FedRAMP', 'CJIS', 'CMMC', 'SOC 2', 'ISO 27001', 'NIST 800-53'],
        default: 'FedRAMP,CJIS',
      },
      {
        key: 'aiStack',
        label: 'Current AI / ML stack or frameworks being evaluated',
        type: 'text',
        placeholder: 'NeMo Guardrails, LangChain, custom agents, Google Vertex...',
        default: 'NeMo Guardrails (NVIDIA)',
      },
      {
        key: 'notes',
        label: 'Anything else about your technical priorities or concerns?',
        type: 'textarea',
        placeholder: 'Data tenancy concerns, vendor evaluations, security architecture decisions...',
      },
    ],
    poweredBy: 'Powered by AxiomStream Group · Built for Deus X Defense',
  },

  // ── Blake Warren — Winthrop Realty Group ────────────────────────────────
  'winthrop-blake': {
    slug: 'winthrop-blake',
    pin: '4321',
    clientName: 'Blake',
    memberName: 'Blake Warren',
    company: 'Winthrop Realty Group',
    agentId: 'rex',
    agentLabel: 'Rex',
    accentColor: '#4ADE80',
    tagline: 'CRE Transaction Intelligence · Houston Metro',
    whatWeKnow: 'VP at Winthrop Realty Group · Houston TX · South Texas College of Law · $25M+ in acquisitions · 2.5M+ sq ft transacted across office, industrial, retail, multifamily, and land · Class B office and flex acquisition thesis · Small-to-mid-size tenant focus.',
    chatPlaceholder: 'Paste a clause, describe a deal, ask anything about a transaction...',
    chatGreeting: (saved) => saved
      ? "Hey Blake — your context is loaded. What are you working on?"
      : "Hey Blake — I'm Rex. I've been briefed on Winthrop and your background. What are you working on right now?",
    intakeFields: REX_CRE_INTAKE,
    poweredBy: 'Powered by AxiomStream Group · Built for Winthrop Realty Group',
    disableTeamContext: true,
  },

  // ── Terry Kurtenbach — Kelyniam Global ──────────────────────────────────
  terry: {
    slug: 'terry',
    pin: '5545',
    clientName: 'Terry',
    memberName: 'Terry Kurtenbach',
    company: 'Kelyniam Global',
    agentId: 'rex',
    agentLabel: 'Rex',
    accentColor: '#4ADE80',
    tagline: 'Kelyniam Global · Cranial Implant Sales Strategy & Market Expansion',
    whatWeKnow: `Terry Kurtenbach · Former Deloitte Tax Partner (37 years, Milwaukee) · Investor & operator across four ventures: Kelyniam Global (cranial implants), Obsidian Financial Advisors (CPA practice), CLP Capital (private investment), Anshin Farm · Kelyniam: custom PEEK cranial implants, OTC-traded (KLYG), 24-hour delivery from OR spec to implant in surgeon's hands · Sales model: rep meets surgeon in OR → captures cranial specs → engineering builds CAD model → surgeon approves → 3D-printed implant ships · Currently operating in 13 states; expansion target: all 50 states · 12 high-performing sales reps + new national sales director (onboarded April 2026) · Salesforce, QuickBooks, Teams stack · Sales focus: neurosurgeons and cranial/reconstructive surgeons at Level I trauma centers and academic medical centers nationwide`,
    chatPlaceholder: 'Surgeon targets, hospital systems, sales strategy, OR access — what are we working on?',
    chatGreeting: (saved) => saved
      ? "Terry — context loaded. What are we working on today?"
      : "Terry — I've been briefed on Kelyniam, the 24-hour cranial implant process, and your expansion targets. Where do you want to start — building out your surgeon target list, refining the sales approach, or mapping the path to all 50 states?",
    aboutPoints: [
      {
        icon: '🧠',
        title: 'Built for Kelyniam\'s Sales Motion',
        body: 'Rex was configured specifically for the Kelyniam rep model — OR-first access, surgeon relationship building, and the 24-hour implant cycle. It thinks like a sales strategist who knows your product cold.',
      },
      {
        icon: '🗺️',
        title: 'Market Expansion Intelligence',
        body: 'Ask Rex to map target hospitals, identify neurosurgeons at Level I trauma centers in new states, research competitive implant providers, or size the opportunity in a specific geography. Real research, fast.',
      },
      {
        icon: '📋',
        title: 'Account Strategy & Pipeline',
        body: 'From first OR introduction to closed account — Rex helps you plan the approach, draft outreach, prepare for surgeon conversations, and track what\'s working across your territory.',
      },
      {
        icon: '⚡',
        title: 'The ASG Model',
        body: 'AxiomStream Group builds purpose-specific AI for businesses in motion. Rex was built for Kelyniam\'s products, Kelyniam\'s sales process, and Kelyniam\'s expansion goals — not a generic tool.',
      },
    ],
    intakeFields: [
      {
        key: 'territory',
        label: 'Primary sales territory or target geography',
        type: 'text',
        placeholder: 'e.g. Midwest, Southeast, national...',
      },
      {
        key: 'surgeonTypes',
        label: 'Surgeon specialties you\'re targeting',
        type: 'chips',
        options: ['Neurosurgery', 'Cranial/Reconstructive', 'Maxillofacial', 'Trauma', 'Pediatric Neurosurgery', 'Plastic Surgery'],
        default: 'Neurosurgery,Cranial/Reconstructive,Trauma',
      },
      {
        key: 'facilityTypes',
        label: 'Facility types in your pipeline',
        type: 'chips',
        options: ['Level I Trauma Centers', 'Academic Medical Centers', 'Community Hospitals', 'VA Facilities', 'Military / DoD'],
        default: 'Level I Trauma Centers,Academic Medical Centers',
      },
      {
        key: 'currentAccounts',
        label: 'Current accounts or hospitals you\'re active in',
        type: 'textarea',
        placeholder: 'List hospitals, surgeons, or systems you\'re already working with...',
      },
      {
        key: 'notes',
        label: 'Anything else about your pipeline or priorities?',
        type: 'textarea',
        placeholder: 'Key accounts to break into, competitive situations, approval processes...',
      },
    ],
    poweredBy: 'Powered by AxiomStream Group · Built for Kelyniam Global',
    disableTeamContext: true,
  },

  // ── Andrew Armour — Winthrop Realty Group ────────────────────────────────
  'winthrop-andrew': {
    slug: 'winthrop-andrew',
    pin: '6847',
    clientName: 'Andrew',
    memberName: 'Andrew Armour',
    company: 'Winthrop Realty Group',
    agentId: 'rex',
    agentLabel: 'Rex',
    accentColor: '#4ADE80',
    tagline: 'CRE Transaction Intelligence · Houston Metro',
    whatWeKnow: 'Partner at Winthrop Realty Group · Houston TX · Winthrop is a full-service CRE firm operating across the Houston metro market · office, industrial, retail, multifamily, and land transactions.',
    chatPlaceholder: 'Paste a clause, describe a deal, ask anything about a transaction...',
    chatGreeting: (saved) => saved
      ? "Hey Andrew — your context is loaded. What are you working on?"
      : "Hey Andrew — I'm Rex. I've been briefed on Winthrop and your background. What are you working on right now?",
    intakeFields: REX_CRE_INTAKE,
    poweredBy: 'Powered by AxiomStream Group · Built for Winthrop Realty Group',
  },

}
