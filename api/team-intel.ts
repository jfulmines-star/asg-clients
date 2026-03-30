import type { VercelRequest, VercelResponse } from '@vercel/node';

const UPSTASH_URL = 'https://renewed-macaw-61269.upstash.io';
const UPSTASH_TOKEN = process.env.UPSTASH_TOKEN || 'Ae9VAAIncDJkZWUyNmM4NmJjOTA0ZjE1OWM2YjRjMTIxYTYzY2IzOXAyNjEyNjk';

async function upstashCmd(cmd: (string | number)[]) {
  const res = await fetch(UPSTASH_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  return res.json();
}

export interface IntelCapture {
  member: string;
  agent: string;
  content: string;
  ts: number;
}

export async function writeTeamIntel(slug: string, capture: IntelCapture) {
  const key = `team:${slug}:intel`;
  await upstashCmd(['LPUSH', key, JSON.stringify(capture)]);
  await upstashCmd(['LTRIM', key, 0, 49]); // keep last 50 captures
  await upstashCmd(['SET', `team:${slug}:intel:last_updated`, capture.ts]);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const slug = ((req.method === 'GET' ? req.query.slug : req.body?.slug) as string || '').toLowerCase();
  const member = ((req.method === 'GET' ? req.query.member : req.body?.member) as string || '').toLowerCase();
  if (!slug) return res.status(400).json({ error: 'Missing slug' });

  // GET — fetch intel + unread count for this member
  if (req.method === 'GET') {
    try {
      const [intelResult, lastUpdatedResult, lastSeenResult] = await Promise.all([
        upstashCmd(['LRANGE', `team:${slug}:intel`, 0, 19]),
        upstashCmd(['GET', `team:${slug}:intel:last_updated`]),
        member ? upstashCmd(['GET', `team:${slug}:member:${member}:intel_seen`]) : Promise.resolve({ result: null }),
      ]);

      const captures: IntelCapture[] = [];
      if (Array.isArray(intelResult.result)) {
        for (const s of intelResult.result) {
          try { captures.push(JSON.parse(s)); } catch { /* skip */ }
        }
      }

      const lastUpdated = parseInt(lastUpdatedResult.result ?? '0', 10);
      const lastSeen = parseInt(lastSeenResult.result ?? '0', 10);
      const hasNew = lastUpdated > lastSeen;
      const unreadCount = hasNew
        ? captures.filter(c => c.ts > lastSeen && (!member || c.member.toLowerCase() !== member)).length
        : 0;

      res.json({ captures, unreadCount, lastUpdated, lastSeen });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
    }
    return;
  }

  // POST — mark intel as seen for this member
  if (req.method === 'POST') {
    const action = req.body?.action;
    if (action === 'mark_seen' && member) {
      await upstashCmd(['SET', `team:${slug}:member:${member}:intel_seen`, Date.now()]);
      res.json({ ok: true });
    } else {
      res.status(400).json({ error: 'Unknown action' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
