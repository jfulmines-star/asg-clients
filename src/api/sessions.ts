Z/**
 * Sessions API — groups a member's flat message history into browsable sessions.
 * GET  /api/sessions?slug=octant8kevin&member=kevin  → list of sessions
 * GET  /api/sessions?slug=octant8kevin&member=kevin&session=0  → full messages for one session
 * POST /api/sessions  { slug, member, sessionIndex, name }  → rename a session
 */
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

function namesKey(slug: string, member: string) {
  return `team:${slug}:member:${member.toLowerCase().replace(/\s+/g, '-')}:session-names`;
}

interface RawMsg { member: string; role: string; agent?: string; content: string; ts: number; }

interface Session {
  index: number;
  name: string | null;
  startTs: number;
  endTs: number;
  messageCount: number;
  preview: string; // first user message, truncated
}

// Gap of 90 minutes or more = new session
const SESSION_GAP_MS = 90 * 60 * 1000;
const SESSION_BREAK_MARKER = '___SESSION_BREAK___';

function groupIntoSessions(messages: RawMsg[]): RawMsg[][] {
  if (messages.length === 0) return [];
  const sessions: RawMsg[][] = [];
  let current: RawMsg[] = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    // Hard session break — start new group, don't include the marker itself
    if (msg.role === 'system' && msg.content === SESSION_BREAK_MARKER) {
      if (current.length > 0) sessions.push(current);
      current = [];
      continue;
    }
    // Time-gap break
    if (current.length > 0) {
      const gap = msg.ts - current[current.length - 1].ts;
      if (gap > SESSION_GAP_MS) {
        sessions.push(current);
        current = [];
      }
    }
    current.push(msg);
  }
  if (current.length > 0) sessions.push(current);
  return sessions;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const slug = ((req.query.slug || req.body?.slug) as string || '').toLowerCase().trim();
  const member = ((req.query.member || req.body?.member) as string || '').toLowerCase().trim();

  if (!slug || !member) return res.status(400).json({ error: 'Missing slug or member' });

  // ── POST: rename a session OR write a session-break marker ───────────────
  if (req.method === 'POST') {
    const { action, sessionIndex, name } = req.body || {};
    // Session break — write a hard boundary marker so the next messages start a new session
    if (action === 'break') {
      const memberKey = `team:${slug}:member:${member}`;
      await upstashCmd(['RPUSH', memberKey, JSON.stringify({ role: 'system', content: SESSION_BREAK_MARKER, ts: Date.now() })]);
      return res.json({ ok: true });
    }
    // Rename
    if (typeof sessionIndex !== 'number' || !name) return res.status(400).json({ error: 'Missing sessionIndex or name' });
    await upstashCmd(['HSET', namesKey(slug, member), String(sessionIndex), name.trim().slice(0, 80)]);
    return res.json({ ok: true });
  }

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Load all messages
    const result = await upstashCmd(['LRANGE', memberKey(slug, member), 0, -1]);
    const raw: RawMsg[] = [];
    if (Array.isArray(result.result)) {
      for (const s of result.result) {
        try { raw.push(JSON.parse(s)); } catch { /* skip */ }
      }
    }

    // Load session names
    const namesResult = await upstashCmd(['HGETALL', namesKey(slug, member)]);
    const names: Record<string, string> = {};
    if (Array.isArray(namesResult.result)) {
      for (let i = 0; i < namesResult.result.length - 1; i += 2) {
        names[namesResult.result[i]] = namesResult.result[i + 1];
      }
    }

    const groups = groupIntoSessions(raw);

    // If a specific session index was requested, return full messages
    const sessionParam = req.query.session;
    if (sessionParam !== undefined) {
      const idx = parseInt(sessionParam as string, 10);
      if (isNaN(idx) || idx < 0 || idx >= groups.length) return res.status(404).json({ error: 'Session not found' });
      return res.json({
        index: idx,
        name: names[String(idx)] || null,
        messages: groups[idx],
      });
    }

    // Return session list (most recent first)
    const sessions: Session[] = groups.map((msgs, idx) => {
      const firstUser = msgs.find(m => m.role === 'user');
      const preview = firstUser ? firstUser.content.slice(0, 120) : '(no messages)';
      return {
        index: idx,
        name: names[String(idx)] || null,
        startTs: msgs[0].ts,
        endTs: msgs[msgs.length - 1].ts,
        messageCount: msgs.length,
        preview,
      };
    }).reverse(); // most recent first

    return res.json({ sessions, totalSessions: groups.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: msg });
  }
}
