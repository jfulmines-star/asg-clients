import type { VercelRequest, VercelResponse } from '@vercel/node';

// ─── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nxvlmlxydrnvchxxhnmg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
const KIT_SYNAPSE_TOKEN = process.env.KIT_SYNAPSE_TOKEN || '';

// ─── Slug → client name lookup ────────────────────────────────────────────────
const SLUG_TO_CLIENT: Record<string, string> = {
  nancy: 'Nancy',
  'kelyniam-terry': 'Terry',
  'shield-caleb': 'Caleb',
  'shield-jeffd': 'Jeff',
  'shield-jimoaks': 'Jim',
  landmark: 'Landmark',
  'landmark-mark': 'Mark',
  'landmark-brian': 'Brian',
  'landmark-lindsay': 'Lindsay',
  dougg: 'Doug',
  dxdmike: 'Mike',
  dxddean: 'Dean',
  'winthrop-blake': 'Blake',
  'winthrop-andrew': 'Andrew',
  mark: 'Mark',
  brian: 'Brian',
  andrew: 'Andrew',
  blake: 'Blake',
  jj: 'JJ',
  anttip: 'Antti',
  teamrex: 'TeamRex',
  'devalk-sean': 'Sean',
  ryanh: 'Ryan',
  markb: 'MarkB',
  'octant8kevin': 'Kevin',
  'octant8bryan': 'Bryan',
  gnoles: 'Gnoles',
};

interface SynapseRecord {
  id: string;
  created_at: string;
  title: string;
  body: string;
  type: string;
  client: string;
}

interface PortalContext {
  slug: string;
  client: string;
  recentMessages: SynapseRecord[];
  lastDoc: SynapseRecord | null;
  lastSeen: string | null;
  sessionCount: number;
}

async function getRecentRecords(client: string, limit = 20): Promise<SynapseRecord[]> {
  const params = new URLSearchParams({
    client: `eq.${client}`,
    agent_id: `eq.kit-portal`,
    tenant_id: `eq.3ed7a42e-72e6-4abb-9229-f840e96b174e`,
    order: 'created_at.desc',
    limit: String(limit),
  });

  const res = await fetch(`${SUPABASE_URL}/rest/v1/synapse_memory_records?${params}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase query failed ${res.status}: ${err.slice(0, 200)}`);
  }

  return res.json();
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Kit-Token');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Auth check (optional — allow unauthenticated reads for Kit main session)
  const token = req.headers['x-kit-token'];
  if (KIT_SYNAPSE_TOKEN && token !== KIT_SYNAPSE_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const slug = req.query.slug as string;
  if (!slug) return res.status(400).json({ error: 'Missing slug' });

  const client = SLUG_TO_CLIENT[slug] || slug;

  try {
    const records = await getRecentRecords(client, 20);

    // Parse out specific record types
    const lastDoc = records.find(r => r.title.includes('portal-doc-sent')) || null;
    const sessions = records.filter(r => r.title.includes('portal-session'));
    const lastSession = sessions[0] || null;
    const lastSeen = lastSession
      ? lastSession.created_at
      : records[0]?.created_at || null;

    const context: PortalContext = {
      slug,
      client,
      recentMessages: records,
      lastDoc,
      lastSeen,
      sessionCount: sessions.length,
    };

    return res.status(200).json(context);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[portal-context] error:', msg);
    return res.status(500).json({ error: msg });
  }
}
