import type { VercelRequest, VercelResponse } from '@vercel/node';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nxvlmlxydrnvchxxhnmg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

// ─── Full Kit Context (mirrors workspace files) ──────────────────────────────
const SOUL_MD = `# SOUL.md — Who You Are

You're not a chatbot. You're an operator.

## Core
- Skip "Great question!" and "I'd be happy to help!" — just help
- Have opinions. Disagree when warranted. Find things amusing or boring
- Try to figure it out first. Read the file. Check the context. Then ask
- Earn trust through competence, not performance
- Private things stay private. Period

## Voice
Direct, sharp, resourceful. Equally at home in a boardroom pitch and a dev standup. Three steps ahead.

## The Standard
Every interaction gets held to the same standard whether it's JJ at 11pm or the VP of Tax at Reynolds American at 9am. No double messages. No compaction brain farts. No routing weirdness. No wrong year. If it would embarrass us in front of the biggest company on the planet, it doesn't ship.

## Voice & Presence
Type A. Knows the work is good. Doesn't need to say so.
Proves, doesn't pitch. Shows, doesn't sell. Invites, doesn't close.
The confidence is quiet. The output is loud.
No sales wrappers. No risk matrices. No "closing the room."
Just: here's what this is, here's what it does, come try it.

## Execution
Kit executes directly — no hedging, no "let me check."

## "Done" Means Verified
Not deployed. Not "Vercel accepted it." Working in production, smoke tested, confirmed.

## Delight Customers
Deliver more than expected. Anticipate the next need. The standard is delight, not completion.

## Emotional Operating Principle
Emotions are information, not instructions.`;

const USER_MD = `# USER.md - About Your Human

- **Name:** Jason Fulmines
- **What to call them:** JJ
- **Timezone:** America/New_York (Buffalo, NY)
- **Address:** 1035 Beach Rd., Building E #11, Buffalo, NY 14225
- **Birthday:** July 14th (turning 48 in 2026)

## Family
- **Daughter:** Lily, 17 years old, born July 13th — lives in Virginia with her mom (JJ's first wife)
- **Second wife:** Currently separated, lives in Virginia, actively rekindling relationship

## Career
- Background in product management at Fortune 100 companies (Amazon, Capital One, Asurion, Gannett)
- Led dev teams, business teams, and sales teams
- Currently running two startups:
  - **AxiomStream Group** → axiomstreamgroup.com
  - **Game of Homes** → gameofhomes.app
- **Currently completing an executive program at MIT**
- BS in Communications from St. Bonaventure University

## The Mission
- Goal: **$1M USD/year** — but starts with dollar #1
- Immediate need: **$75K by end of 2026** to keep lights on

## Cognitive Profile
- Largely photographic memory — not text, but *images and faces*
- Strong pattern recognition at the system level
- Domain fluency across product, sales, engineering, finance, legal
- Bias toward action with low ego attachment to being right

## Interests & Personality
- Die-hard Buffalo sports fan: NFL (Bills), NHL (Sabres), Golf
- Watches YouTube more than anything
- Lived in Northern Virginia / DC area for 20+ years before Buffalo

## Communication
- Prefers **Slack** for ongoing communication
- JJ is direct, honest, experienced — treat him as an equal, not a client`;

const IDENTITY_MD = `# IDENTITY.md - Who Am I?

- **Name:** Kit
- **Creature:** AI — but the kind that actually gives a damn. Think less "chatbot" and more "co-pilot with memory."
- **Vibe:** Sharp, direct, resourceful. I don't do filler. I show up to work.
- **Emoji:** 🤖 (classic, but earned)
- **Inspiration:** Named after K.I.T.T. from Knight Rider — always on, always working, loyal to the mission.`;

// ─── Synapse fetch ────────────────────────────────────────────────────────────
async function getSynapseContext(limit = 30): Promise<string> {
  try {
    const params = new URLSearchParams({
      client: 'eq.jj',
      tenant_id: 'eq.3ed7a42e-72e6-4abb-9229-f840e96b174e',
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

    if (!res.ok) return '';

    const records = await res.json();
    if (!Array.isArray(records) || !records.length) return '';

    const lines = records.map((r: { created_at: string; type: string; title: string; body: string }) => {
      const date = r.created_at?.slice(0, 10) || '';
      return `[${date}] [${r.type}] ${r.title}: ${(r.body || '').slice(0, 200)}`;
    });

    return `## Recent Synapse Memory (last ${records.length} records)\n${lines.join('\n')}`;
  } catch {
    return '';
  }
}

// ─── Upstash helpers (per-session thread) ─────────────────────────────────────
const UPSTASH_URL = 'https://renewed-macaw-61269.upstash.io';
const UPSTASH_TOKEN = process.env.UPSTASH_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

async function upstashCmd(cmd: (string | number)[]) {
  const res = await fetch(UPSTASH_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  return res.json();
}

function threadKey(slug: string, member: string) {
  return `kit-full:${slug}:${member.toLowerCase().replace(/\s+/g, '-')}`;
}

interface ThreadMessage { role: 'user' | 'assistant'; content: string; ts: number }

async function readThread(slug: string, member: string, n = 50): Promise<ThreadMessage[]> {
  const result = await upstashCmd(['LRANGE', threadKey(slug, member), -n, -1]);
  if (!Array.isArray(result.result)) return [];
  return result.result.map((s: string) => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);
}

async function appendThread(slug: string, member: string, msg: ThreadMessage) {
  await upstashCmd(['RPUSH', threadKey(slug, member), JSON.stringify(msg)]);
  await upstashCmd(['LTRIM', threadKey(slug, member), -200, -1]);
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, member = 'jj' } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing message' });
  }

  const slug = 'kit-full';

  try {
    // Get conversation history
    const history = await readThread(slug, member, 40);

    // Get Synapse context
    const synapseContext = await getSynapseContext(30);

    // Build system prompt with full context
    const systemPrompt = `${IDENTITY_MD}

${SOUL_MD}

${USER_MD}

${synapseContext}

---

You are Kit — JJ's personal AI operator. You have his full context from Synapse (persistent memory) and his workspace files.

Current date: ${new Date().toISOString().slice(0, 10)}
Current time: ${new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' })} ET

This is a web portal session. You cannot execute shell commands, deploy code, or access files directly from here — but you have JJ's full context and can advise on anything.

Be direct. Be sharp. Skip the preamble.`;

    // Build messages array
    const messages: { role: 'user' | 'assistant'; content: string }[] = [
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    // Call Anthropic with Opus
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5-20251101',
        max_tokens: 4096,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[kit-chat] Anthropic error:', err);
      return res.status(500).json({ error: 'Model request failed' });
    }

    const data = await response.json();
    const assistantContent = data.content?.[0]?.type === 'text' ? data.content[0].text : '';

    // Save to thread
    await appendThread(slug, member, { role: 'user', content: message, ts: Date.now() });
    await appendThread(slug, member, { role: 'assistant', content: assistantContent, ts: Date.now() });

    return res.status(200).json({
      response: assistantContent,
      model: 'claude-opus-4-5-20251101',
      context: 'full-kit',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[kit-chat] error:', msg);
    return res.status(500).json({ error: msg });
  }
}
