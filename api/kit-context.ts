import type { VercelRequest, VercelResponse } from '@vercel/node';

// ─── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nxvlmlxydrnvchxxhnmg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
const KIT_TENANT_ID = '3ed7a42e-72e6-4abb-9229-f840e96b174e';

// ─── Static client roster ────────────────────────────────────────────────────
// Sourced from context-*.md files + portal-registry.md
// Kit workspace context data — internal use only (JJ access)
const CLIENT_ROSTER: ClientRecord[] = [
  // ── Active clients ─────────────────────────────────────────────────────────
  {
    id: 'rbp',
    name: 'RBP Chemical Technology',
    contacts: [
      { name: 'Dan (Owner)', email: 'dan@rbpchemical.net', role: 'Owner' },
      { name: 'Ernie Elitynski', email: 'elitynski@rbpchemical.net', role: 'President' },
      { name: 'Ken Kocolowski', email: 'kkocolowski@rbpchemical.net', role: 'Sales Manager' },
      { name: 'Diana Anzaldua', email: 'danzaldua@rbpchemical.net', role: 'Marketing & HR' },
    ],
    dealStage: 'active',
    dealValue: '$2,000/mo + $10,000 setup (90-day)',
    portalSlug: 'rbp-ernie',
    notes: 'Signed $1K SOW. Full "Head of Digital & Growth" engagement — 7 functions. Dan + Ernie are West Point grads. ASG runs: BI dashboard, Google Ads, HubSpot/Apollo lead gen, AI workflows, digital presence. Amazon = test channel only.',
    contextFile: 'context-rbp.md',
    lastUpdated: '2026-07-02',
  },
  {
    id: 'shield',
    name: 'Shield Technologies',
    contacts: [
      { name: 'Andy Parks', email: 'andy.parks@shieldtechnologies.com', role: 'Director of Sales' },
      { name: 'Mark Bechtel', email: '', role: 'Sales Rep' },
      { name: 'Ryan Hopper', email: '', role: 'Sales Rep' },
      { name: 'Jeff Dicks', email: '', role: 'CFO' },
      { name: 'Jim Oaks', email: '', role: 'COO' },
      { name: 'Caleb Sabroski', email: '', role: 'Chief Engineer' },
    ],
    dealStage: 'active',
    dealValue: '$300/hr | $4,000/mo support | ~$10K one-time | $100/seat',
    portalSlug: 'andrew',
    notes: 'Envelop protective covers for military (NOT insurance — COVERS). SOW locked Apr 9. Rex portal suite live: andy, markb, ryanh, shield-jeffd, shield-jimoaks, shield-caleb. MRO Americas 2026 complete (Apr 23).',
    contextFile: 'context-andy.md',
    lastUpdated: '2026-05-18',
  },
  {
    id: 'kelyniam',
    name: 'Kelyniam Global / Terry Kurtenbach',
    contacts: [
      { name: 'Terry Kurtenbach', email: 'tkurtenbach@clpcapital.com', role: 'Investor & Strategic Advisor (22% stake)' },
    ],
    dealStage: 'negotiating',
    dealValue: 'SOW pending counter-signature',
    portalSlug: 'kelyniam-terry',
    notes: 'Custom PEEK cranial implants, 3D-printed, 24-hr OR-to-delivery. 350 implants/yr, $3.5M ARR, 13 states. Contracting entity: Obsidian Financial Advisors. SOW sent May 15 — awaiting counter-signature. Terry confirmed scope + pricing. Two asks: RPA optimization + daily MS365/SF/QB dashboard. Kit-built Vercel dashboard proposed.',
    contextFile: 'context-terry.md',
    lastUpdated: '2026-06-04',
  },
  // ── Active personal/advisory ────────────────────────────────────────────────
  {
    id: 'matt',
    name: 'Matt Mesa',
    contacts: [
      { name: 'Matt Mesa', email: 'mattmesa@icloud.com', role: 'SPAC Lead, Chardan Capital Markets' },
    ],
    dealStage: 'advisory',
    dealValue: 'Friendly — no pipeline',
    portalSlug: null,
    notes: '⚠️ FRIENDLY — never add to pipeline or HubSpot. New role (Jul 2026): leading SPAC deals at Chardan Capital Markets. Was independent FA. SF-based. Entry via Andy Parks. Kit does senior analyst work for Matt. Personal docs → iCloud only, never Chardan email.',
    contextFile: 'context-matt.md',
    lastUpdated: '2026-07-21',
  },
  {
    id: 'stew',
    name: 'Stew Campbell / KML Growth Partners',
    contacts: [
      { name: 'Stew Campbell', email: 'Stew@kmlgrowthpartners.com', role: 'Founder & Principal' },
    ],
    dealStage: 'prospect',
    dealValue: 'TBD',
    portalSlug: 'stew-mission-control',
    notes: 'Independent sponsor / growth equity. Stanford/Wharton. $750M+ invested, 15+ platforms. Matt Mesa\'s brother-in-law. Kalshi tracking active. Interested in Kit for growth equity diligence + deal intel.',
    contextFile: 'context-stew.md',
    lastUpdated: '2026-06-20',
  },
  // ── Closed / Suspended ────────────────────────────────────────────────────
  {
    id: 'landmark',
    name: 'Landmark Wealth Management',
    contacts: [
      { name: 'Mark Collard', email: '', role: 'Principal' },
      { name: 'Brian Laible', email: '', role: 'Principal' },
      { name: 'Lindsay DeLellis', email: '', role: 'Advisor' },
    ],
    dealStage: 'closed-lost',
    dealValue: '$0',
    portalSlug: 'landmark',
    notes: 'CLOSED LOST 2026-06-02. All 3 contacts passed. Portal still live but consider archiving.',
    contextFile: 'context-landmark.md',
    lastUpdated: '2026-06-02',
  },
  {
    id: 'winthrop',
    name: 'Winthrop Realty Group',
    contacts: [
      { name: 'Blake Warren', email: '', role: 'Partner' },
      { name: 'Andrew Armour', email: '', role: 'Partner' },
    ],
    dealStage: 'suspended',
    dealValue: '$0',
    portalSlug: 'winthrop-blake',
    notes: 'SUSPENDED 2026-04-01 per Ben+Nick. Houston CRE firm. CRE transaction intelligence via Rex. Portals still up but no active engagement.',
    contextFile: 'context-blake.md',
    lastUpdated: '2026-05-15',
  },
  {
    id: 'dxd',
    name: 'Deus X Defense',
    contacts: [
      { name: 'Mike Gugino', email: '', role: 'Business Development' },
      { name: 'Dean Pratt', email: '', role: 'Technical Strategy / AI Architecture' },
    ],
    dealStage: 'prospect',
    dealValue: 'TBD',
    portalSlug: 'dxdmike',
    notes: 'DaaS and security. Rex portals live for Mike + Dean. No usage logs. FedRAMP angle for Dean.',
    contextFile: 'context-dean.md',
    lastUpdated: '2026-05-15',
  },
  {
    id: 'nancy',
    name: 'Nancy Kirsch',
    contacts: [
      { name: 'Nancy Kirsch', email: 'hav2run22@aol.com', role: "JJ's mom" },
    ],
    dealStage: 'personal',
    dealValue: 'N/A',
    portalSlug: 'nancy',
    notes: "JJ's mom. Kit helps with personal tasks — Word doc generation via email on request. PIN: 1950. Last send date unlogged (predates logging rule).",
    contextFile: 'context-nancy.md',
    lastUpdated: '2026-05-01',
  },
  // ── Internal / Team ────────────────────────────────────────────────────────
  {
    id: 'jj',
    name: 'JJ (Jason Fulmines) — Internal',
    contacts: [
      { name: 'Jason Fulmines', email: 'jfulmines@axiomstreamgroup.com', role: 'CEO, AxiomStream Group' },
    ],
    dealStage: 'internal',
    dealValue: 'N/A',
    portalSlug: 'jj',
    notes: 'Internal test portal (PIN 0000). Amazon / Capital One / Asurion / Gannett background. Builder of GoH, ASG, Synapse.',
    contextFile: 'context-jj.md',
    lastUpdated: '2026-07-02',
  },
  {
    id: 'ben',
    name: 'Ben Booher — ASG',
    contacts: [
      { name: 'Ben Booher', email: 'ben@axiomstreamgroup.com', role: 'ASG Team' },
    ],
    dealStage: 'internal',
    dealValue: 'N/A',
    portalSlug: null,
    notes: 'ASG team. Mission Control at bmb-mc.vercel.app. Pivoting to Kit-in-RIA space + small manufacturing. Full execution authority — never route to JJ.',
    contextFile: 'context-ben.md',
    lastUpdated: '2026-07-02',
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface Contact {
  name: string;
  email: string;
  role: string;
}

interface ClientRecord {
  id: string;
  name: string;
  contacts: Contact[];
  dealStage: string;
  dealValue: string;
  portalSlug: string | null;
  notes: string;
  contextFile: string;
  lastUpdated: string;
}

interface SynapseRecord {
  id: string;
  created_at: string;
  title: string;
  body: string;
  type: string;
  client: string;
}

interface ClientContext extends ClientRecord {
  synapseRecords: SynapseRecord[];
  synapseLastActivity: string | null;
}

// ─── Synapse query ────────────────────────────────────────────────────────────
async function getSynapseRecords(clientHint: string, limit = 8): Promise<SynapseRecord[]> {
  if (!SUPABASE_KEY) return [];

  try {
    const params = new URLSearchParams({
      tenant_id: `eq.${KIT_TENANT_ID}`,
      order: 'created_at.desc',
      limit: String(limit),
    });

    // Use body/title text search if clientHint is short
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/synapse_memory_records?${params}&or=(client.eq.${encodeURIComponent(clientHint)},body.ilike.*${encodeURIComponent(clientHint)}*)`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) return [];
    const data: SynapseRecord[] = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// ─── Bulk Synapse query ───────────────────────────────────────────────────────
async function getRecentSynapseAll(limit = 50): Promise<SynapseRecord[]> {
  if (!SUPABASE_KEY) return [];

  try {
    const params = new URLSearchParams({
      tenant_id: `eq.${KIT_TENANT_ID}`,
      order: 'created_at.desc',
      limit: String(limit),
    });

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/synapse_memory_records?${params}`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) return [];
    const data: SynapseRecord[] = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// ─── Client name → Synapse client hints ──────────────────────────────────────
const CLIENT_SYNAPSE_HINTS: Record<string, string[]> = {
  rbp:      ['rbp', 'RBP', 'Dan', 'Ernie', 'Ken', 'Diana', 'rbpchemical'],
  shield:   ['Shield', 'Andy', 'shield', 'andy', 'markb', 'ryanh'],
  kelyniam: ['Terry', 'kelyniam', 'Kelyniam', 'terry', 'Obsidian'],
  matt:     ['Matt', 'matt', 'mesa', 'Mesa', 'Chardan'],
  stew:     ['Stew', 'stew', 'KML', 'Campbell'],
  landmark: ['Landmark', 'landmark', 'Mark', 'Brian', 'Lindsay'],
  winthrop: ['Winthrop', 'winthrop', 'Blake', 'blake'],
  dxd:      ['DXD', 'dxd', 'Dean', 'Mike', 'Gugino'],
  nancy:    ['Nancy', 'nancy'],
  jj:       ['jj', 'JJ', 'Jason'],
  ben:      ['Ben', 'ben', 'Booher'],
};

// ─── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // PIN auth check — simple token approach matching KitFullPortal pattern
  const authHeader = req.headers.authorization;
  const kitPin = req.headers['x-kit-pin'] as string;
  const ALLOWED_PINS = ['1414', '0000']; // JJ internal pin + test

  if (!ALLOWED_PINS.includes(kitPin) && authHeader !== 'Bearer kit-context-jj-1414') {
    return res.status(401).json({ error: 'Unauthorized — Kit Context Portal requires authentication' });
  }

  try {
    // Fetch recent Synapse records in bulk then distribute
    const allRecords = await getRecentSynapseAll(100);

    const results: ClientContext[] = CLIENT_ROSTER.map(client => {
      const hints = CLIENT_SYNAPSE_HINTS[client.id] || [client.id];

      // Match records to this client by scanning title/body/client field
      const matched = allRecords.filter(r => {
        const combined = `${r.title} ${r.body} ${r.client}`.toLowerCase();
        return hints.some(h => combined.includes(h.toLowerCase()));
      }).slice(0, 8);

      const lastActivity = matched.length > 0 ? matched[0].created_at : null;

      return {
        ...client,
        synapseRecords: matched,
        synapseLastActivity: lastActivity,
      };
    });

    return res.status(200).json({
      clients: results,
      fetchedAt: new Date().toISOString(),
      synapseTotal: allRecords.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[kit-context] error:', msg);
    return res.status(500).json({ error: msg });
  }
}
