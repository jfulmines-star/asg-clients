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

function memberKey(slug: string, member: string) {
  return `team:${slug}:member:${member.toLowerCase().replace(/\s+/g, '-')}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const slug = (req.query.slug as string || '').toLowerCase();
  const member = (req.query.member as string || '').toLowerCase();

  if (!slug || !member) return res.status(400).json({ error: 'Missing slug or member' });

  try {
    const result = await upstashCmd(['LRANGE', memberKey(slug, member), -100, -1]);
    const messages: { member: string; role: string; agent?: string; content: string; ts: number }[] = [];

    if (Array.isArray(result.result)) {
      for (const s of result.result) {
        try { messages.push(JSON.parse(s)); } catch { /* skip */ }
      }
    }

    res.json({ messages });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
}
