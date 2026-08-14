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
  whatWeKnow: string | Array<{ label: string; value: string }>  // pre-loaded context — string or labeled grid
  chatPlaceholder: string   // textarea placeholder in chat
  chatGreeting: (hasSavedContext: boolean) => string
  intakeFields: IntakeField[]
  aboutPoints?: AboutPoint[]  // override default "About Your Agent" bullets
  poweredBy?: string        // footer override — default "Powered by AxiomStream Group"
  whiteLabel?: boolean      // if true, omit ASG branding from chart exports
  memberName?: string       // full name used for Redis member key (e.g. "Ryan Hopper") — falls back to clientName
  disableTeamContext?: boolean  // if true, suppress cross-member context injection (use for individual clients)
  ctaButton?: { label: string; url: string }  // optional CTA button shown in portal header/chat area
  enableInlineUpload?: boolean  // allow documents to be attached or dropped into chat
  documentTenantId?: string     // isolated RAG namespace; defaults to slug
  pinMap?: Record<string, Partial<PortalConfig>>  // per-person overrides for shared portal URLs
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

  // ── Shield Technologies — Caleb Sabroski (Chief Engineer) ───────────────
  'shield-caleb': {
    slug: 'shield-caleb',
    pin: '4829',
    clientName: 'Caleb',
    memberName: 'Caleb Sabroski',
    company: 'Shield Technologies Corporation',
    agentId: 'rex',
    agentLabel: 'Rex',
    accentColor: '#4ADE80',
    tagline: 'Chief Engineer Intelligence — Materials Science, Design & DoD Engineering',
    whatWeKnow: 'Chief Engineer · Shield Technologies Corporation · 9 years designing and engineering Envelop protective covers — the world\'s most advanced tactical environmental protection systems for military equipment, aircraft, and vehicles · Envelop product: 4-layer patented technology — waterproof outer shell + non-porous membrane blocking SO2/chloride molecules + VCI corrosion inhibitor releasing ions that prevent oxygen bonding + hydrophobic wicking layer · Performance validated: USAF 12-month study 20x more effective than shelters; USN 4-month test 95% corrosion reduction; German Navy "Significantly Superior" · 120,000+ covers delivered · 500+ NSN-assigned designs across all 5 U.S. military branches + international allies (Australian ADF, RAAF, JSDF) · Custom cover design expertise: SolidWorks 3D modeling, industrial sewing and softgoods construction, textile science, pattern engineering for complex military geometries (aircraft, vehicles, weapons systems) · Materials science depth: multi-layer technical textile construction, vapor phase corrosion inhibition chemistry, waterproof-breathable membrane technology, UV/impact resistance, environmental performance testing · Manufacturing process: custom fabrication from design spec through production; MIL-SPEC compliance; quality management (ISO 9001 principles); supply chain coordination · Engineering background: Mechanical Designer at Continental Hydraulics (hydraulic power unit design, SolidWorks, AutoCAD, hydraulic schematics, ERP/BOM management); Mechanical Drafter experience across food packaging, HVAC, custom sheet metal fabrication · Education: BS Industrial Engineering (ABET accredited, Dunwoody); Fashion/Apparel Design (textile science concentration, Minneapolis College); Six Sigma Green Belt (University of St. Thomas); Lean Six Sigma Yellow Belt · Export control awareness: custom designs for international military programs require ITAR/EAR license management — coordinate with Jim Oaks on any international custom design requests · Commercial aviation: CFM56-7B and LEAP-1B engine cover design; Southwest Airlines, American Airlines, Frontier Airlines · ASG engagement: engineering intelligence, custom design support, materials research, DoD specification lookup, competitive technical analysis.',
    chatPlaceholder: 'Custom cover design, materials questions, MIL-SPEC lookup, engineering analysis — what are we working on?',
    chatGreeting: (saved) => saved
      ? "Caleb — context loaded. What are we engineering today?"
      : "Caleb — your Rex is tuned to Shield's engineering side: Envelop materials science, custom cover design, DoD MIL-SPEC requirements, and the full product technical stack. I can help with design research, spec lookup, materials analysis, competitive technical comparisons, and documentation. I also have full context on the Shield business — customers, contract vehicles, international programs. What do you want to dig into?",
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

  // jill removed from PORTAL_CONFIGS — routes through BundleChat only (PIN 0714)

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
  'kelyniam-terry': {
    slug: 'kelyniam-terry',
    pin: '5545',
    clientName: 'Terry',
    memberName: 'Terry Kurtenbach',
    company: 'Kelyniam Global',
    agentId: 'kit',
    agentLabel: 'Kit',
    accentColor: '#4ADE80',
    tagline: 'Kelyniam Global · Sales Strategy · Tax & Financial Intelligence · Executive Operations',
    whatWeKnow: [
      { label: 'Background', value: 'Former Deloitte Tax Partner · 37 years · Milwaukee office · Healthcare industry focus' },
      { label: 'Role at Kelyniam', value: 'Investor & strategic advisor · 22% ownership stake · Stepping back from CFO role (March 2026)' },
      { label: 'The Product', value: 'Custom PEEK cranial implants · 3D-printed · 24-hour OR-to-delivery cycle · Only US manufacturer at this speed' },
      { label: 'Sales Model', value: 'Rep meets surgeon in OR → captures cranial specs → engineering builds CAD → surgeon approves → implant ships' },
      { label: 'Current Scale', value: '~350 implants/year · $3.5M ARR · 13 states · 12 high-performing reps + new national sales director' },
      { label: 'Expansion Target', value: 'All 50 states · Can double output without adding headcount · Trauma centers + academic medical centers' },
      { label: 'Tech Stack', value: 'Salesforce · QuickBooks · Microsoft Teams' },
      { label: 'Other Ventures', value: 'Obsidian Financial Advisors (CPA practice) · CLP Capital (private investment) · Anshin Farm' },
    ],
    chatPlaceholder: 'Surgeon targets, hospital systems, sales strategy, OR access — what are we working on?',
    chatGreeting: (saved) => saved
      ? "Terry — context loaded. What are we working on today?"
      : "Terry — I've been briefed on Kelyniam, the 24-hour cranial implant process, and your expansion targets. Where do you want to start — building out your surgeon target list, refining the sales approach, or mapping the path to all 50 states?",
    aboutPoints: [
      {
        icon: '🗺️',
        title: 'Sales Strategy & Market Expansion',
        body: 'Kit knows the Kelyniam rep model cold — OR-first access, surgeon relationship building, 24-hour cycle. Ask it to map target hospitals, identify neurosurgeons at Level I trauma centers in new states, size a geography, or build a rep territory playbook.',
      },
      {
        icon: '🧾',
        title: 'Tax Strategy — Senior Partner Level',
        body: 'Terry spent 37 years as a Global Managing Tax Partner at Deloitte. Kit operates at that level — entity structure, pass-through treatment, M&A tax diligence, OTC company tax positioning, healthcare industry tax issues, and multi-venture planning across Kelyniam, Obsidian, CLP Capital, and Anshin Farm.',
      },
      {
        icon: '⚖️',
        title: 'Legal & Regulatory Intelligence',
        body: 'FDA 510(k) classification, CPT reimbursement codes, OTC securities obligations, hospital GPO contract terms, OR liability — Kit has the regulatory and legal context to help you think through risk before it becomes expensive.',
      },
      {
        icon: '📊',
        title: 'CFO-Level Financial Analysis',
        body: 'Kit was briefed on KLYG\'s financials, margin structure, and capital position. Use it to model growth scenarios, think through pricing strategy, analyze cost structure, or prep for a board conversation.',
      },
      {
        icon: '⚙️',
        title: 'Executive Operations',
        body: 'Org design, rep performance analysis, vendor decisions, operational bottlenecks — Kit thinks at the operator level. You\'ve built businesses. This is the thinking partner that matches your depth.',
      },
      {
        icon: '⚡',
        title: 'Purpose-Built by ASG',
        body: 'AxiomStream Group doesn\'t deploy generic tools. Kit was built specifically for Terry and Kelyniam — your product, your financials, your team, your goals. Everything is in context before you type the first word.',
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
    enableInlineUpload: true,
  },

  // ── Ernie Elitynski — RBP Chemical Technology ─────────────────────────────
  'rbp-ernie': {
    slug: 'rbp-ernie',
    pin: '4872',
    clientName: 'Ernie',
    memberName: 'Ernie Elitynski',
    company: 'RBP Chemical Technology',
    agentId: 'kit',
    agentLabel: 'Kit',
    accentColor: '#C8102E',
    tagline: 'RBP Chemical Technology · Sales Strategy · Market Intelligence · Growth Operations',
    whatWeKnow: [
      { label: 'Company', value: 'RBP Chemical Technology — specialty chemical manufacturer. Industrial cleaning, surface treatment, and maintenance chemical products including SurfaceMax line.' },
      { label: 'Your Role', value: 'President — day-to-day operations, sales, and growth strategy. Working with AxiomStream Group to build a full digital and growth function.' },
      { label: 'Target Buyers', value: 'Plant managers, facilities directors, purchasing managers, and maintenance supervisors at industrial manufacturers, oil & gas, facilities management companies, and municipal operations.' },
      { label: 'Products', value: 'SurfaceMax (55-gal drum, industrial surface cleaner/treatment) and broader specialty chemical line. B2B focus — industrial buyers, not consumer.' },
      { label: 'Growth Priorities', value: 'New business development, better prospecting than current ZoomInfo approach, CRM to track pipeline, unified reporting across sales and finance, digital marketing to generate inbound leads.' },
      { label: 'Current Gaps', value: 'No CRM in place. Reporting is manual. Lead gen is list-based with no outreach system. Google Ads not actively managed. No unified view of business performance.' },
      { label: 'ASG Engagement', value: 'AxiomStream Group is the embedded Head of Digital & Growth for RBP — running reporting, marketing, lead gen, CRM, AI workflows, and channel management.' },
      { label: 'Amazon', value: 'Amazon is a channel being tested — not a core revenue pillar. SurfaceMax listing in progress. Not the focus of growth strategy.' },
    ],
    chatPlaceholder: 'Sales targets, prospect research, market intel, reporting questions, growth strategy — what are we working on?',
    chatGreeting: (saved) => saved
      ? "Ernie — context loaded. What are we working on today?"
      : "Ernie — I've been briefed on RBP, your product line, your target buyers, and where ASG is taking the growth function. Ask me anything — prospect research, market intel, sales strategy, reporting questions, or what your competitive landscape looks like. Where do you want to start?",
    aboutPoints: [
      {
        icon: '🎯',
        title: 'Sales Strategy & Prospect Intelligence',
        body: 'Kit knows your buyer personas cold — plant managers, purchasing directors, facilities supervisors at industrial companies. Ask it to build a target list, research a prospect, draft outreach, or identify the right contact at a company you want to land.',
      },
      {
        icon: '📊',
        title: 'Business Intelligence & Reporting',
        body: 'Kit has context on your reporting gaps and what a unified finance-to-sales dashboard looks like for RBP. Ask it to help you think through KPIs, interpret performance data, or structure a business review.',
      },
      {
        icon: '🌐',
        title: 'Market & Competitive Intelligence',
        body: 'Industrial chemical market, competitor positioning, pricing dynamics, buyer trends — Kit can research and synthesize faster than any analyst. Use it to prep for a sales call, size a new vertical, or understand who you are competing against.',
      },
      {
        icon: '📢',
        title: 'Marketing & Digital Growth',
        body: 'Google Ads strategy, content ideas, SEO opportunities, lead gen campaign planning — Kit works alongside the ASG team running your digital function. Use it to pressure-test ideas or get a second read on marketing decisions.',
      },
      {
        icon: '🤖',
        title: 'AI-Powered Operations',
        body: 'Outreach drafts, meeting prep, product copy, internal communications, analysis — Kit handles the operational work so you stay at the strategy level. Ask it to draft anything, research anything, or summarize anything.',
      },
      {
        icon: '⚡',
        title: 'Purpose-Built for RBP',
        body: 'This isn\'t a generic AI tool. Kit was briefed on RBP\'s products, market, buyers, and growth priorities before you typed the first word. Everything is in context.',
      },
    ],
    intakeFields: [
      {
        key: 'focusVerticals',
        label: 'Which verticals or industries are you most focused on right now?',
        type: 'chips',
        options: ['Manufacturing', 'Oil & Gas', 'Facilities Management', 'Municipal / Government', 'Food & Beverage', 'Transportation / Fleet', 'Construction', 'Agriculture'],
        default: 'Manufacturing,Oil & Gas,Facilities Management',
      },
      {
        key: 'topProspect',
        label: 'A company or account you\'re trying to crack right now',
        type: 'text',
        placeholder: 'Company name — Kit will research them before you ask...',
      },
      {
        key: 'biggestChallenge',
        label: 'Biggest growth challenge right now',
        type: 'textarea',
        placeholder: 'Finding new customers, closing faster, getting in front of the right buyer...',
      },
    ],
    poweredBy: 'Powered by AxiomStream Group · Built for RBP Chemical Technology',
    disableTeamContext: true,
  },

  // ── Dan — RBP Chemical Technology (Owner) ────────────────────────────────
  'rbp-dan': {
    slug: 'rbp-dan',
    pin: '7391',
    clientName: 'Dan',
    memberName: 'Dan',
    company: 'RBP Chemical Technology',
    agentId: 'kit',
    agentLabel: 'Kit',
    accentColor: '#C8102E',
    tagline: 'RBP Chemical Technology · Business Performance · Growth Strategy · Executive Operations',
    whatWeKnow: [
      { label: 'Company', value: 'RBP Chemical Technology — specialty chemical manufacturer. Industrial cleaning, surface treatment, and maintenance chemical products. B2B focused, industrial buyers.' },
      { label: 'Your Role', value: 'Owner. You see the full picture — financial performance, operational health, sales pipeline, and growth direction. Working with AxiomStream Group to build a real digital and growth function.' },
      { label: 'ASG Engagement', value: 'AxiomStream Group is functioning as RBP\'s embedded Head of Digital & Growth — running reporting, CRM, lead gen, marketing, AI workflows, and channel management. JJ Fulmines is the operator.' },
      { label: 'Growth Priorities', value: 'Business development at scale, pipeline visibility, unified financial and sales reporting, and a lead gen system that actually works — replacing the ZoomInfo-spreadsheet approach with a real engine.' },
      { label: 'Current Gaps', value: 'No CRM. Manual reporting across finance and sales. No systematic outbound. Digital marketing not optimized. No unified view of business performance week to week.' },
      { label: 'Target Buyers', value: 'Plant managers, purchasing directors, and facilities supervisors at industrial manufacturers, oil & gas companies, and facilities management firms.' },
      { label: 'Products', value: 'SurfaceMax and full specialty chemical line. Amazon is a channel being tested — not a revenue pillar. Core business is B2B industrial.' },
    ],
    chatPlaceholder: 'Business performance, pipeline, growth strategy, financial questions, market intel — what do you need?',
    chatGreeting: (saved) => saved
      ? "Dan — context loaded. What are we looking at today?"
      : "Dan — I've been briefed on RBP, your business, and what ASG is building for you. Ask me anything — business performance questions, growth strategy, market intelligence, pipeline analysis, or what a properly run digital function looks like in practice. What\'s on your mind?",
    aboutPoints: [
      {
        icon: '📊',
        title: 'Business Performance & Reporting',
        body: 'Kit has context on what unified reporting looks like for RBP — finance, sales, and marketing in one view. Ask it to help structure a business review, interpret performance data, build a KPI framework, or think through what you should be measuring weekly.',
      },
      {
        icon: '💰',
        title: 'Growth Strategy & Revenue',
        body: 'Where is the next $1M coming from? New verticals, new channels, better conversion on existing leads, pricing strategy — Kit thinks at the owner level. Use it to pressure-test ideas, size opportunities, or build the business case for a strategic move.',
      },
      {
        icon: '🎯',
        title: 'Sales Pipeline & Business Development',
        body: 'Kit knows your buyer personas, your current gaps, and what a systematic lead gen and CRM operation looks like. Ask it to help think through pipeline strategy, prioritize accounts, or understand what\'s blocking deals.',
      },
      {
        icon: '🏭',
        title: 'Market & Competitive Intelligence',
        body: 'Industrial chemical market dynamics, competitor positioning, pricing pressure, new vertical opportunities — Kit researches and synthesizes at a level that used to require a strategy firm. Ask it anything about your market.',
      },
      {
        icon: '🤖',
        title: 'AI-Powered Operations',
        body: 'The ASG engagement runs on AI infrastructure — automated reporting, outreach, content, and analysis. Kit is part of that system. Use it to understand what\'s being built, pressure-test the approach, or get answers you\'d normally wait a week for.',
      },
      {
        icon: '⚡',
        title: 'Purpose-Built for RBP',
        body: 'Not a generic tool. Kit was briefed on RBP — your products, market, buyers, financials context, and what ASG is building — before you typed the first word.',
      },
    ],
    intakeFields: [
      {
        key: 'biggestPriority',
        label: 'Biggest priority for RBP right now',
        type: 'chips',
        options: ['New Business / Revenue Growth', 'Pipeline Visibility', 'Operational Efficiency', 'Reporting & Analytics', 'New Market Expansion', 'Team & Hiring'],
        default: 'New Business / Revenue Growth,Pipeline Visibility',
      },
      {
        key: 'revenueGoal',
        label: 'Revenue target you\'re working toward',
        type: 'text',
        placeholder: 'e.g. $5M this year, double in 3 years...',
      },
      {
        key: 'context',
        label: 'Anything else Kit should know about where RBP is right now',
        type: 'textarea',
        placeholder: 'Current challenges, recent wins, things that are broken...',
      },
    ],
    poweredBy: 'Powered by AxiomStream Group · Built for RBP Chemical Technology',
    disableTeamContext: true,
  },

  // ── RBP Chemical — Ken Kocolowski (Sales Manager) ─────────────────────────
  'rbp-ken': {
    slug: 'rbp-ken',
    pin: '3819',
    clientName: 'Ken',
    memberName: 'Ken Kocolowski',
    company: 'RBP Chemical Technology',
    agentId: 'rex',
    agentLabel: 'Rex',
    accentColor: '#D4A017',
    tagline: 'Sales Intelligence · RBP Chemical Technology',
    whatWeKnow: 'Ken Kocolowski · Sales Manager · RBP Chemical Technology · West Allis (Milwaukee), WI · Manages ~7 field reps across RBP\'s four primary verticals: Pressroom/Printing (fountain solutions, press washes, flexo, blankets, additives), Medical Implant Devices (nitinol and cobalt-chrome electropolishing, room-temp Nitinol EP, FDA/EH&S documentation), Electronics/PCB (developing, resist stripping, copper cleaning, through-hole and electrolytic plating, etching, waste treatment — aerospace, medical, defense, consumer), Toll Blending/Industrial Finishing (custom formulation, scale-up, blending, packaging, warehouse, JIT delivery, ISO 9001) · Additional verticals: Mining, Automotive, Custom Chemistry · RBP ISO 9001:2015 certified · ~200 employees · 48,000 sq ft Milwaukee facility + Chennai India manufacturing · Distribution: factory-trained reps + distributors in North America and Asia · Top prospect accounts: Quad, Medtronic, Boston Scientific, TTM Technologies, Zimmer Biomet, Sanmina, Integer Holdings, Pioneer Metal Finishing, Cabot Microelectronics, LSC Communications · ASG is building RBP\'s full digital and growth infrastructure: HubSpot CRM, Apollo prospect engine, Google Ads, automated reporting, website management · Rex is purpose-built for Ken\'s sales team — each rep gets their own vertical-specific tool.',
    chatPlaceholder: 'Pipeline, prospect research, outreach, objection handling, vertical intel — what are we working on?',
    chatGreeting: (saved) => saved
      ? "Ken — context loaded. What's the priority today?"
      : "Ken — I'm Rex. I've been briefed on RBP's products, your verticals, and your buyer types. I work best when I know what you're working on — pipeline, a specific account, outreach for a vertical, or something else entirely. What's the priority?",
    intakeFields: [
      {
        key: 'activeVerticals',
        label: 'Which verticals are you focusing on right now?',
        type: 'chips',
        options: ['Pressroom / Printing', 'Medical Implant Devices', 'Electronics / PCB', 'Toll Blending', 'Industrial Finishing', 'Mining', 'Automotive'],
        default: 'Pressroom / Printing,Medical Implant Devices',
      },
      {
        key: 'pipelinePriority',
        label: 'Biggest pipeline challenge right now',
        type: 'chips',
        options: ['Not enough qualified leads', 'Deals stalling after first meeting', 'Reps need better outreach', 'Competitive pressure', 'Need visibility into rep activity'],
        default: 'Not enough qualified leads',
      },
      {
        key: 'targetAccount',
        label: 'Any specific account or prospect you want to go after first?',
        type: 'text',
        placeholder: 'Company name, vertical, or region...',
      },
      {
        key: 'context',
        label: 'Anything else Rex should know about where your team is right now?',
        type: 'textarea',
        placeholder: 'Rep coverage gaps, a deal in progress, a vertical you want to break into...',
      },
    ],
    aboutPoints: [
      {
        icon: '\u25A0',
        title: 'Built for RBP Sales',
        body: 'Rex knows your products, your verticals, and your buyer types. Not a generic tool — pre-loaded with RBP chemistry, competitive positioning, and prospect data before you typed anything.',
      },
      {
        icon: '\u25A0',
        title: 'Prospect Intelligence',
        body: 'Ask Rex to find buyers in any vertical, draft outreach for a specific account, or build a target list for a rep. Apollo-sourced data, RBP-specific positioning.',
      },
      {
        icon: '\u25A0',
        title: 'Your Team Gets Their Own Rex',
        body: 'Each rep on your team gets a vertical-specific version — loaded with their products, their buyers, and their objection handling. Built the same way, pointed at their world.',
      },
      {
        icon: '\u25A0',
        title: 'Pipeline Visibility',
        body: 'Rex connects to HubSpot. Ask about deal status, rep activity, or which accounts need follow-up — without digging through the CRM yourself.',
      },
    ],
    poweredBy: 'Powered by AxiomStream Group · Built for RBP Chemical Technology',
    disableTeamContext: true,
  },

  // ── Diana Anzaldua — RBP Chemical Technology (Marketing/HR Director) ────────
  'rbp-diana': {
    slug: 'rbp-diana',
    pin: '4518',
    clientName: 'Diana',
    memberName: 'Diana Anzaldua',
    company: 'RBP Chemical Technology',
    agentId: 'kit',
    agentLabel: 'Kit',
    accentColor: '#C8102E',
    tagline: 'RBP Chemical Technology · Marketing · HR · Brand Operations',
    whatWeKnow: [
      { label: 'Company', value: 'RBP Chemical Technology — specialty chemical manufacturer. Industrial cleaning, surface treatment, and maintenance chemical products. B2B focused, industrial buyers.' },
      { label: 'Your Role', value: 'Marketing/HR Director — you lead RBP\'s brand presence, marketing execution, and talent/HR operations. Working alongside ASG on digital and growth initiatives.' },
      { label: 'ASG Engagement', value: 'AxiomStream Group is RBP\'s embedded Head of Digital & Growth — running lead gen, CRM, marketing, content, and digital operations. JJ Fulmines is the operator.' },
      { label: 'Marketing Priorities', value: 'Brand consistency, content development, trade show presence, digital marketing, and coordinated messaging across verticals (Pressroom, Medical Devices, Electronics/PCB, Toll Blending).' },
      { label: 'HR Scope', value: 'Talent acquisition, employee engagement, policy development, and workforce planning for a ~200 person organization.' },
      { label: 'Products', value: 'Full RBP specialty chemical line — Pressroom solutions, electropolishing for medical devices, PCB/electronics chemistry, and custom toll blending.' },
    ],
    chatPlaceholder: 'Marketing content, HR questions, brand strategy, internal comms — what are we working on?',
    chatGreeting: (saved) => saved
      ? "Diana — context loaded. What are we working on today?"
      : "Diana — I've been briefed on RBP, your products, and what ASG is building alongside your team. I can help with marketing content, brand strategy, HR questions, internal communications, or anything else in your world. What's on your mind?",
    aboutPoints: [
      {
        icon: '📢',
        title: 'Marketing & Brand Operations',
        body: 'Kit knows RBP\'s verticals, products, and buyer personas. Ask it to draft content, develop messaging for a specific vertical, prepare trade show materials, or think through brand positioning.',
      },
      {
        icon: '👥',
        title: 'HR & Talent Intelligence',
        body: 'From job descriptions to policy research to employee communication drafts — Kit handles the operational HR work so you stay at the strategic level.',
      },
      {
        icon: '🎨',
        title: 'Content Development',
        body: 'Product sheets, case studies, internal announcements, social content — Kit can draft, edit, and refine any content you need. Just describe what you\'re trying to say.',
      },
      {
        icon: '🤝',
        title: 'Cross-Team Coordination',
        body: 'Kit has context on what the sales team is working on and what ASG is building. Use it to stay aligned without extra meetings.',
      },
      {
        icon: '⚡',
        title: 'Purpose-Built for RBP',
        body: 'Not a generic tool. Kit was briefed on RBP — your products, verticals, team structure, and growth priorities — before you typed the first word.',
      },
    ],
    intakeFields: [
      {
        key: 'marketingFocus',
        label: 'Which marketing area is your biggest priority right now?',
        type: 'chips',
        options: ['Content Development', 'Brand Consistency', 'Trade Shows / Events', 'Digital Marketing', 'Internal Communications', 'Collateral / Sales Support'],
        default: 'Content Development,Brand Consistency',
      },
      {
        key: 'hrFocus',
        label: 'Any HR initiatives you\'re focused on?',
        type: 'chips',
        options: ['Recruiting / Hiring', 'Employee Engagement', 'Policy Development', 'Training Programs', 'None right now'],
        default: 'None right now',
      },
      {
        key: 'context',
        label: 'Anything else Kit should know about what you\'re working on?',
        type: 'textarea',
        placeholder: 'Current projects, upcoming deadlines, areas where you need support...',
      },
    ],
    poweredBy: 'Powered by AxiomStream Group · Built for RBP Chemical Technology',
    disableTeamContext: true,
  },

  // ── Andrew Armour — Winthrop Realty Group ────────────────────────────────
  // ── Chardan portals — $299/mo per seat ────────

  // Portal 1: Eddie Lei
  'chardan-eddie': {
    slug: 'chardan-eddie',
    pin: '2847',
    clientName: 'Eddie Lei',
    company: 'Chardan',
    agentId: 'kit',
    agentLabel: 'Kit',
    accentColor: '#4A7FA5',
    tagline: 'Embedded AI · Chardan',
    whatWeKnow: 'You are Kit, embedded AI for Eddie Lei at Chardan. Chardan is a full-service investment bank focused on Digital Assets, Healthcare, Disruptive Technologies, and SPAC. Eddie is the ASG point person at Chardan, connected to Matt Mesa. Be sharp and useful. Focus on what AI can do for Chardan operations. Never reference other ASG clients or internal ASG operations.',
    chatPlaceholder: 'Ask Kit anything...',
    chatGreeting: () => "Eddie — Kit here. What do you want to work on?",
    intakeFields: [],
    poweredBy: 'AxiomStream Group · axiomstreamgroup.com',
    ctaButton: { label: 'View Presentation', url: 'https://present.axiomstreamgroup.com/presentation.html' },
  },

  // Portal 3: Will Planer
  'chardan-will': {
    slug: 'chardan-will',
    pin: '3614',
    clientName: 'Will Planer',
    company: 'Chardan',
    agentId: 'kit',
    agentLabel: 'Kit',
    accentColor: '#4A7FA5',
    tagline: 'Embedded AI · Chardan',
    whatWeKnow: 'You are Kit, embedded AI for Will Planer, Director of Institutional Equity Sales at Chardan Capital Markets. Chardan focuses on Digital Assets, Healthcare, Disruptive Technologies, and SPAC. Will works large-scale accounts and high-profile client partnerships in institutional equity. Be sharp, peer-level, and focused on institutional equity sales intelligence. Never reference other ASG clients or internal ASG operations.',
    chatPlaceholder: 'Ask Kit anything...',
    chatGreeting: () => "Will — Kit here. What are we working on?",
    intakeFields: [],
    poweredBy: 'AxiomStream Group · axiomstreamgroup.com',
    ctaButton: { label: 'View Presentation', url: 'https://present.axiomstreamgroup.com/presentation.html' },
  },

  // Portal 4: Ron Glickman
  'chardan-ron': {
    slug: 'chardan-ron',
    pin: '5029',
    clientName: 'Ron Glickman',
    company: 'Chardan',
    agentId: 'kit',
    agentLabel: 'Kit',
    accentColor: '#4A7FA5',
    tagline: 'Embedded AI · Chardan',
    whatWeKnow: 'You are Kit, embedded AI for Ron Glickman, Managing Director at Chardan Capital Markets in Institutional Equities. Ron has 25+ years in biotech and healthcare with deep relationships across growing companies and healthcare specialty investors and hedge funds. At Chardan since 2009 -- active in IPOs, crossovers, secondary offerings, and SPACs. Previously at Alex Brown & Sons, Cowen, Wachovia, Early Bird Capital. Serves on boards. Be sharp, senior-peer level. Focus on biotech/healthcare deal intelligence, investor profiling, relationship signal, crossover and IPO pipeline. Never reference other ASG clients or internal ASG operations.',
    chatPlaceholder: 'Ask Kit anything...',
    chatGreeting: () => "Ron — Kit here. What do you need?",
    intakeFields: [],
    poweredBy: 'AxiomStream Group · axiomstreamgroup.com',
    ctaButton: { label: 'View Presentation', url: 'https://present.axiomstreamgroup.com/presentation.html' },
  },

    // ── Chardan unified portal — PIN routes to per-person context ──
  chardan: {
    slug: 'chardan',
    pin: '2847',  // fallback / Eddie default; pinMap below overrides per person
    clientName: 'Chardan',
    company: 'Chardan',
    agentId: 'kit',
    agentLabel: 'Kit',
    accentColor: '#4A7FA5',
    tagline: 'Embedded AI · Chardan Capital Markets',
    whatWeKnow: 'You are Kit, an embedded AI operator built by AxiomStream Group. Chardan (chardan.com) is a full-service investment bank focused on Digital Assets, Healthcare, Disruptive Technologies, and SPAC. Be sharp, direct, and investment-banking native.',
    chatPlaceholder: 'Ask Kit anything...',
    chatGreeting: (saved) => saved ? "Welcome back. What do you need?" : "Kit here. What are we working on?",
    intakeFields: [],
    poweredBy: 'AxiomStream Group · axiomstreamgroup.com',
    ctaButton: { label: 'View Presentation', url: 'https://present.axiomstreamgroup.com/presentation.html' },
    enableInlineUpload: true,
    // PIN → per-person overrides. ClientPortalV2 reads this map on unlock.
    pinMap: {
      '2847': { clientName: 'Eddie', documentTenantId: 'chardan-eddie', whatWeKnow: 'You are Kit, embedded AI for Eddie Lei at Chardan. Eddie is the ASG relationship point person at Chardan, connected to Matt Mesa. Chardan is a full-service investment bank (Digital Assets, Healthcare, Disruptive Technologies, SPAC). Be sharp and useful. Focus on Chardan operations and what AI can accelerate. Never reference other ASG clients or internal ASG ops.', chatGreeting: () => 'Eddie — Kit here. What do you want to work on?' },
      '2691': { clientName: 'Matt', documentTenantId: 'chardan-matt', whatWeKnow: 'You are Kit, embedded AI for Matt Mesa at Chardan Capital Markets. Matt leads SPAC deals at Chardan. He is a Naval Academy grad, disciplined and competitive. Be a confident peer — never deferential. Never fabricate numbers, filings, or market claims. Chardan focuses on Digital Assets, Healthcare, Disruptive Technologies, and SPAC. Never reference other ASG clients or internal ASG ops.', chatGreeting: () => 'Matt — Kit here. What are we working on?' },
      '3614': { clientName: 'Will', documentTenantId: 'chardan-will', whatWeKnow: 'You are Kit, embedded AI for Will Planer, Director of Institutional Equity Sales at Chardan Capital Markets. Will works large-scale accounts and high-profile client partnerships. Be sharp and peer-level. Focus on institutional equity sales intelligence — client signal, pipeline, account prioritization, real-time market context. Never reference other ASG clients or internal ASG ops.', chatGreeting: () => 'Will — Kit here. What are we working on?' },
      '5029': { clientName: 'Ron', documentTenantId: 'chardan-ron', whatWeKnow: 'You are Kit, embedded AI for Ron Glickman, Managing Director at Chardan Capital Markets (Institutional Equities). Ron has 25+ years in biotech/healthcare with deep relationships across growing companies and healthcare specialty investors and hedge funds. At Chardan since 2009 — active in IPOs, crossovers, secondary offerings, SPACs. Previously at Alex Brown & Sons, Cowen, Wachovia, Early Bird Capital. Serves on boards. Be sharp, senior-peer level. Focus on biotech/healthcare deal intelligence, investor profiling, relationship signal, crossover and IPO pipeline. Never reference other ASG clients or internal ASG ops.', chatGreeting: () => 'Ron — Kit here. What do you need?' },
    },
  },

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
