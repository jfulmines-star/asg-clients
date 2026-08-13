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

function clientFromSlug(slug: string): string {
  return SLUG_TO_CLIENT[slug] || slug;
}

// ─── Event → Synapse record mapping ──────────────────────────────────────────
type SynapseEvent = 'chat_message' | 'doc_sent' | 'email_sent' | 'session_start';

interface LogPayload {
  slug: string;
  event: SynapseEvent;
  detail?: string;
  // doc_sent / email_sent specific
  filename?: string;
  email?: string;
  subject?: string;
}

function buildRecord(payload: LogPayload): { title: string; body: string } {
  const { slug, event, detail, filename, email, subject } = payload;
  const ts = new Date().toISOString();

  switch (event) {
    case 'chat_message':
      return {
        title: `portal-chat: ${slug} sent message`,
        body: `slug=${slug} message=${(detail || '').slice(0, 200)} ts=${ts}`,
      };
    case 'doc_sent':
      return {
        title: `portal-doc-sent: ${slug} received ${filename || 'document'}`,
        body: `slug=${slug} file=${filename || 'unknown'} email=${email || 'unknown'} ts=${ts}`,
      };
    case 'email_sent':
      return {
        title: `portal-email-sent: ${slug}`,
        body: `slug=${slug} to=${email || 'unknown'} subject=${subject || 'unknown'} ts=${ts}`,
      };
    case 'session_start':
      return {
        title: `portal-session: ${slug} opened portal`,
        body: `slug=${slug} ts=${ts}`,
      };
    default:
      return {
        title: `portal-event: ${slug} ${event}`,
        body: `slug=${slug} detail=${detail || ''} ts=${ts}`,
      };
  }
}

// ─── Supabase insert ─────────────────────────────────────────────────────────
async function insertSynapseRecord(title: string, body: string, client: string): Promise<string> {
  const row = {
    tenant_id: '3ed7a42e-72e6-4abb-9229-f840e96b174e',
    agent_id: 'kit-portal',
    type: 'exchange',
    title,
    body,
    client,
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/synapse_memory_records`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase insert failed ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const id = Array.isArray(data) && data[0]?.id ? data[0].id : 'unknown';
  return id;
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Kit-Token');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth check
  const token = req.headers['x-kit-token'];
  if (KIT_SYNAPSE_TOKEN && token !== KIT_SYNAPSE_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { slug, event, detail, filename, email, subject } = req.body || {};

  if (!slug || !event) {
    return res.status(400).json({ error: 'Missing slug or event' });
  }

  try {
    const { title, body } = buildRecord({ slug, event, detail, filename, email, subject });
    const client = clientFromSlug(slug);
    const id = await insertSynapseRecord(title, body, client);
    return res.status(200).json({ ok: true, id, title });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[synapse-log] error:', msg);
    // Return 200 so callers don't fail — logging is non-critical
    return res.status(200).json({ ok: false, error: msg });
  }
}
