/**
 * billing-ledger.ts — Per-client API spend tracking + cap enforcement
 *
 * Stores token usage in Upstash Redis.
 * Keys:
 *   billing:{client}:mtd_cents        — month-to-date spend in cents (resets monthly)
 *   billing:{client}:mtd_month        — YYYY-MM of current MTD window
 *   billing:{client}:prepay_cents     — prepay balance in cents
 *   billing:{client}:cap_cents        — hard cap in cents
 *   billing:{client}:alert_sent_80    — flag: 80% alert already sent this month
 *   billing:{client}:log:{timestamp}  — individual call log (TTL 90 days)
 */

const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL  || 'https://renewed-macaw-61269.upstash.io';
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';

// Anthropic pricing per million tokens (as of 2026-08)
const PRICING: Record<string, { inputCentsPerM: number; outputCentsPerM: number }> = {
  'claude-haiku-4-5-20251001':    { inputCentsPerM: 80,   outputCentsPerM: 400  },  // $0.80/$4.00 per M
  'claude-sonnet-4-6-20250514':   { inputCentsPerM: 300,  outputCentsPerM: 1500 },  // $3.00/$15.00 per M
  'claude-sonnet-4-6':            { inputCentsPerM: 300,  outputCentsPerM: 1500 },
};

async function redisCmd(...args: (string | number)[]): Promise<unknown> {
  const r = await fetch(`${UPSTASH_URL}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const d = await r.json() as { result: unknown };
  return d.result;
}

export function calcCents(model: string, inputTokens: number, outputTokens: number): number {
  const p = PRICING[model] || PRICING['claude-haiku-4-5-20251001'];
  return Math.ceil(
    (inputTokens  / 1_000_000) * p.inputCentsPerM +
    (outputTokens / 1_000_000) * p.outputCentsPerM
  );
}

export async function recordUsage(opts: {
  client: string;       // e.g. 'shield'
  slug: string;         // e.g. 'andrew'
  model: string;
  inputTokens: number;
  outputTokens: number;
  feature: string;      // e.g. 'chat', 'teams-bot'
}): Promise<{ cents: number; mtdCents: number; capCents: number; overCap: boolean; over80: boolean }> {
  const { client, slug, model, inputTokens, outputTokens, feature } = opts;
  const cents   = calcCents(model, inputTokens, outputTokens);
  const month   = new Date().toISOString().slice(0, 7); // YYYY-MM
  const mtdKey  = `billing:${client}:mtd_cents`;
  const monKey  = `billing:${client}:mtd_month`;
  const capKey  = `billing:${client}:cap_cents`;
  const a80Key  = `billing:${client}:alert_sent_80`;

  // Reset MTD if month changed
  const storedMonth = await redisCmd('GET', monKey);
  if (storedMonth !== month) {
    await redisCmd('SET', mtdKey, 0);
    await redisCmd('SET', monKey, month);
    await redisCmd('DEL', a80Key);
  }

  // Increment MTD
  const mtdCents = Number(await redisCmd('INCRBY', mtdKey, cents));

  // Get cap (default $100 = 10000 cents)
  const capRaw   = await redisCmd('GET', capKey);
  const capCents = capRaw ? Number(capRaw) : 10_000;

  // Log individual call (90 day TTL)
  const logKey = `billing:${client}:log:${Date.now()}`;
  await redisCmd('SET', logKey, JSON.stringify({ slug, model, inputTokens, outputTokens, cents, feature, ts: new Date().toISOString() }));
  await redisCmd('EXPIRE', logKey, 60 * 60 * 24 * 90);

  const over80  = mtdCents >= capCents * 0.8;
  const overCap = mtdCents >= capCents;

  return { cents, mtdCents, capCents, overCap, over80 };
}

export async function getClientSpend(client: string): Promise<{
  mtdCents: number; capCents: number; month: string; pctUsed: number;
}> {
  const mtdCents = Number(await redisCmd('GET', `billing:${client}:mtd_cents`) || 0);
  const capRaw   = await redisCmd('GET', `billing:${client}:cap_cents`);
  const capCents = capRaw ? Number(capRaw) : 10_000;
  const month    = String(await redisCmd('GET', `billing:${client}:mtd_month`) || new Date().toISOString().slice(0,7));
  return { mtdCents, capCents, month, pctUsed: Math.round((mtdCents / capCents) * 100) };
}

export async function setClientCap(client: string, capCents: number): Promise<void> {
  await redisCmd('SET', `billing:${client}:cap_cents`, capCents);
}

export async function hasAlert80BeenSent(client: string): Promise<boolean> {
  return !!(await redisCmd('GET', `billing:${client}:alert_sent_80`));
}

export async function markAlert80Sent(client: string): Promise<void> {
  await redisCmd('SET', `billing:${client}:alert_sent_80`, '1');
  await redisCmd('EXPIRE', `billing:${client}:alert_sent_80`, 60 * 60 * 24 * 35); // 35d TTL
}
