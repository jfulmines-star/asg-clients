/**
 * Conversations API — UUID-based conversation management.
 * Conversations are pure UI organizers. Rex sees the full flat message history regardless.
 *
 * GET  ?slug=X&member=Y              → list all conversations
 * GET  ?slug=X&member=Y&convId=UUID  → messages for a specific conversation
 * POST { action: "create", slug, member, name }   → create new conversation, returns { convId, name }
 * POST { action: "rename", slug, member, convId, name } → rename conversation
 * POST { action: "delete", slug, member, convId }       → soft-delete conversation
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';

const UPSTASH_URL = 'https://renewed-macaw-61269.upstash.io';
const UPSTASH_TOKEN = process.env.UPSTASH_TOKEN || 'Ae9VAAIncDIzYWNmNzg3NGJjMDE0ZWFmYThmNWM2YzM4MzE5NTRjNHAyNjEyNjk';

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

interface RawMsg {
  member?: string;
  role: string;
  type?: string;
  convId?: string;
  name?: string;
  agent?: string;
  content: string;
  ts: number;
  deleted?: boolean;
}

async function readAllMessages(slug: string, member: string, n = 500): Promise<RawMsg[]> {
  const result = await upstashCmd(['LRANGE', memberKey(slug, member), -n, -1]);
  if (!Array.isArray(result.result)) return [];
  return result.result
    .map((s: string) => { try { return JSON.parse(s) as RawMsg; } catch { return null; } })
    .filter(Boolean) as RawMsg[];
}

interface Conversation {
  convId: string;
  name: string;
  ts: number;
  messageCount: number;
  preview: string;
  listIndex: number; // position in flat list where conv_start lives
}

function buildConversationList(messages: RawMsg[]): { conversations: Conversation[]; legacyMessages: RawMsg[] } {
  const conversations: Conversation[] = [];
  const legacyMessages: RawMsg[] = [];

  let hasConvMarkers = false;
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === 'system' && msg.type === 'conv_start' && msg.convId && !msg.deleted) {
      hasConvMarkers = true;
      // Find messages until next conv_start or end
      const convMsgs: RawMsg[] = [];
      let j = i + 1;
      while (j < messages.length) {
        const next = messages[j];
        if (next.role === 'system' && (next.type === 'conv_start' || next.content === '___SESSION_BREAK___')) break;
        if (next.role !== 'system' && next.content !== '___SESSION_BREAK___') {
          convMsgs.push(next);
        }
        j++;
      }
      const userMsgs = convMsgs.filter(m => m.role === 'user');
      const preview = userMsgs[0]?.content?.slice(0, 80) || msg.name || 'Empty conversation';
      conversations.push({
        convId: msg.convId!,
        name: msg.name || 'Untitled',
        ts: msg.ts,
        messageCount: convMsgs.length,
        preview,
        listIndex: i,
      });
    }
  }

  if (!hasConvMarkers) {
    // Legacy mode — no conv_start markers exist; return messages as a single "legacy" conversation
    for (const msg of messages) {
      if (msg.role !== 'system' && msg.content !== '___SESSION_BREAK___') {
        legacyMessages.push(msg);
      }
    }
  }

  return { conversations: conversations.reverse(), legacyMessages }; // newest first
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const slug = ((req.query.slug || req.body?.slug) as string || '').toLowerCase().trim();
  const member = ((req.query.member || req.body?.member) as string || '').toLowerCase().trim();

  if (!slug || !member) return res.status(400).json({ error: 'Missing slug or member' });

  // ── POST ─────────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { action, convId, name } = req.body || {};

    if (action === 'create') {
      const newConvId = randomUUID();
      const convName = (name || 'New conversation').trim().slice(0, 80);
      const marker: RawMsg = { role: 'system', type: 'conv_start', convId: newConvId, name: convName, content: '', ts: Date.now() };
      await upstashCmd(['RPUSH', memberKey(slug, member), JSON.stringify(marker)]);
      return res.json({ convId: newConvId, name: convName });
    }

    if (action === 'rename') {
      if (!convId || !name) return res.status(400).json({ error: 'Missing convId or name' });
      // Read all messages, find and rewrite the conv_start marker
      const result = await upstashCmd(['LRANGE', memberKey(slug, member), 0, -1]);
      if (!Array.isArray(result.result)) return res.status(404).json({ error: 'Not found' });
      const entries: string[] = result.result;
      for (let i = entries.length - 1; i >= 0; i--) {
        try {
          const parsed = JSON.parse(entries[i]) as RawMsg;
          if (parsed.role === 'system' && parsed.type === 'conv_start' && parsed.convId === convId) {
            parsed.name = name.trim().slice(0, 80);
            await upstashCmd(['LSET', memberKey(slug, member), i, JSON.stringify(parsed)]);
            return res.json({ ok: true, name: parsed.name });
          }
        } catch { /* skip */ }
      }
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (action === 'delete') {
      if (!convId) return res.status(400).json({ error: 'Missing convId' });
      const result = await upstashCmd(['LRANGE', memberKey(slug, member), 0, -1]);
      if (!Array.isArray(result.result)) return res.status(404).json({ error: 'Not found' });
      const entries: string[] = result.result;
      for (let i = entries.length - 1; i >= 0; i--) {
        try {
          const parsed = JSON.parse(entries[i]) as RawMsg;
          if (parsed.role === 'system' && parsed.type === 'conv_start' && parsed.convId === convId) {
            parsed.deleted = true;
            await upstashCmd(['LSET', memberKey(slug, member), i, JSON.stringify(parsed)]);
            return res.json({ ok: true });
          }
        } catch { /* skip */ }
      }
      return res.status(404).json({ error: 'Conversation not found' });
    }

    return res.status(400).json({ error: 'Unknown action' });
  }

  // ── GET ──────────────────────────────────────────────────────────────────
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const messages = await readAllMessages(slug, member, 500);
    const convId = req.query.convId as string | undefined;

    if (convId) {
      // Return messages for a specific conversation
      let inConv = false;
      const convMsgs: RawMsg[] = [];
      for (const msg of messages) {
        if (msg.role === 'system' && msg.type === 'conv_start' && msg.convId === convId) {
          inConv = true;
          continue;
        }
        if (inConv) {
          if (msg.role === 'system' && (msg.type === 'conv_start' || msg.content === '___SESSION_BREAK___')) break;
          if (msg.role !== 'system') convMsgs.push(msg);
        }
      }
      return res.json({ convId, messages: convMsgs });
    }

    // Return conversation list
    const { conversations, legacyMessages } = buildConversationList(messages);

    // If no conv_start markers, return legacy mode
    if (conversations.length === 0 && legacyMessages.length > 0) {
      return res.json({ conversations: [], legacy: true, legacyMessages });
    }

    return res.json({ conversations, legacy: false });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: msg });
  }
}
