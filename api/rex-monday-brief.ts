/**
 * api/rex-monday-brief.ts — Level 3 proactivity: Monday morning pipeline brief
 * Sends a personalized Teams message to each Shield rep at 8am ET Monday.
 * Called by OpenClaw cron → isolated subagent → POST this endpoint.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

const ANTHROPIC_API_KEY   = process.env.ANTHROPIC_API_KEY || process.env.ANT_KEY || '';
const SHIELD_HS_TOKEN     = process.env.SHIELD_HUBSPOT_TOKEN || '';
const SHIELD_HS_BASE      = 'https://api.hubapi.com';
const SHIELD_GRAPH_TENANT = '9df00d69-3980-486c-b81e-d6ef8ab81b10';
const SHIELD_GRAPH_CLIENT = '3ae2aaaa-b799-4a54-963d-4d4497f0e330';
const SHIELD_GRAPH_SECRET = 'W.Chd9gudo.K.c5Amc0I5wL6Ec.-L8MUv-';
const SHIELD_GRAPH_BASE   = 'https://graph.microsoft.us/v1.0';
const BOT_APP_ID          = process.env.TEAMS_BOT_APP_ID || '';
const BOT_APP_SECRET      = process.env.TEAMS_BOT_APP_SECRET || '';
const CRON_SECRET         = process.env.CRON_SECRET || '';

const REPS = [
  { slug: 'andrew',    upn: 'andy.parks@shieldtechnologies.com',    name: 'Andy',  role: 'CRO', territory: 'Navy buying commands, Coast Guard, DoD depots' },
  { slug: 'ryanh',     upn: 'ryan.hopper@shieldtechnologies.com',   name: 'Ryan',  role: 'Sales', territory: 'Navy and Coast Guard accounts' },
  { slug: 'markb',     upn: 'mark.bechtel@shieldtechnologies.com',  name: 'Mark',  role: 'Sales', territory: 'Aviation MRO, Army, USAF' },
  { slug: 'shield-caleb',  upn: 'caleb.sabroski@shieldtechnologies.com', name: 'Caleb', role: 'Engineering', territory: 'MIL-SPEC, cover design, RFP support' },
  { slug: 'shield-jimoaks',upn: 'jim.oaks@shieldtechnologies.com',  name: 'Jim',   role: 'COO', territory: 'Operations, fulfillment, logistics' },
  { slug: 'shield-jeffd',  upn: 'jeff.dicks@shieldtechnologies.com',name: 'Jeff',  role: 'CFO', territory: 'Financial pipeline, contract values, forecast' },
];

// ─── Auth helpers ─────────────────────────────────────────────────────────────

async function getGraphToken(): Promise<string> {
  const r = await fetch(`https://login.microsoftonline.us/${SHIELD_GRAPH_TENANT}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: SHIELD_GRAPH_CLIENT, client_secret: SHIELD_GRAPH_SECRET, grant_type: 'client_credentials', scope: 'https://graph.microsoft.us/.default' }).toString(),
  });
  const d = await r.json() as { access_token?: string };
  return d.access_token || '';
}

async function getBotToken(): Promise<string> {
  const r = await fetch('https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: BOT_APP_ID, client_secret: BOT_APP_SECRET, grant_type: 'client_credentials', scope: 'https://api.botframework.com/.default' }).toString(),
  });
  const d = await r.json() as { access_token?: string };
  return d.access_token || '';
}

// ─── Data fetchers ────────────────────────────────────────────────────────────

async function getRepCalendar(upn: string, graphToken: string): Promise<string> {
  const now = new Date();
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const r = await fetch(`${SHIELD_GRAPH_BASE}/users/${encodeURIComponent(upn)}/calendarView?startDateTime=${now.toISOString()}&endDateTime=${end.toISOString()}&$select=subject,start,end,location&$top=8&$orderby=start/dateTime`, {
    headers: { Authorization: `Bearer ${graphToken}` },
  });
  const d = await r.json() as { value?: Array<{ subject: string; start: { dateTime: string }; location?: { displayName?: string } }> };
  if (!d.value?.length) return 'No meetings this week.';
  return d.value.map(e => {
    const dt = new Date(e.start.dateTime);
    const day = dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const time = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `• ${day} ${time} — ${e.subject}${e.location?.displayName ? ` (${e.location.displayName})` : ''}`;
  }).join('\n');
}

async function getRepDeals(): Promise<string> {
  const r = await fetch(`${SHIELD_HS_BASE}/crm/v3/objects/deals/search`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SHIELD_HS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit: 20, properties: ['dealname','amount','dealstage','closedate','notes_last_updated'], filterGroups: [{ filters: [{ propertyName: 'dealstage', operator: 'NEQ', value: 'closedwon' }, { propertyName: 'dealstage', operator: 'NEQ', value: 'closedlost' }] }] }),
  });
  const d = await r.json() as { results?: Array<Record<string,unknown>>; total?: number };
  if (!d.results?.length) return 'No open deals in the pipeline yet.';
  const now = Date.now();
  return d.results.map((deal: Record<string,unknown>) => {
    const p = deal.properties as Record<string,string>;
    const lastUpdate = p.notes_last_updated ? Math.round((now - new Date(p.notes_last_updated).getTime()) / 86400000) : null;
    const stale = lastUpdate && lastUpdate > 14 ? ` ⚠️ ${lastUpdate}d no activity` : '';
    return `• ${p.dealname || 'Untitled'} | ${p.dealstage || '—'} | $${p.amount || '0'}${stale}`;
  }).join('\n');
}

async function getStaleContacts(): Promise<string> {
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const r = await fetch(`${SHIELD_HS_BASE}/crm/v3/objects/contacts/search`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SHIELD_HS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit: 5, properties: ['firstname','lastname','company','notes_last_updated'], filterGroups: [{ filters: [{ propertyName: 'notes_last_updated', operator: 'LT', value: cutoff }] }] }),
  });
  const d = await r.json() as { results?: Array<Record<string,unknown>> };
  if (!d.results?.length) return '';
  return d.results.map((c: Record<string,unknown>) => {
    const p = c.properties as Record<string,string>;
    const days = p.notes_last_updated ? Math.round((Date.now() - new Date(p.notes_last_updated).getTime()) / 86400000) : '?';
    return `• ${p.firstname || ''} ${p.lastname || ''} at ${p.company || '—'} — ${days}d no activity`;
  }).join('\n');
}

// ─── Brief composer via Claude ────────────────────────────────────────────────

async function composeBrief(rep: typeof REPS[0], calendar: string, deals: string, stale: string): Promise<string> {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const prompt = `You are Rex, the Shield Technologies AI. Write a Monday morning brief for ${rep.name} (${rep.role}). Today is ${today}.

DATA:
Calendar this week:
${calendar}

Open pipeline:
${deals}

${stale ? `Contacts needing follow-up:\n${stale}` : ''}

Write a tight, direct Monday brief. Format:
- Open with "Good morning ${rep.name} —" 
- 3-4 short sections: This Week, Pipeline, Follow-Ups (if any), One Thing
- "One Thing" = the single most important action Rex recommends this week based on the data
- End with "— Rex" 
- Max 15 lines total. No fluff. Sound like a sharp colleague, not a bot.
- Use plain text only — no markdown, no asterisks. This goes into Teams.`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6-20250514', max_tokens: 600, messages: [{ role: 'user', content: prompt }] }),
  });
  const d = await r.json() as { content?: Array<{ type: string; text?: string }> };
  return d.content?.find(b => b.type === 'text')?.text || `Good morning ${rep.name} — Rex here. Pipeline and calendar are loaded. Have a strong week.\n\n— Rex`;
}

// ─── Teams DM sender ──────────────────────────────────────────────────────────

async function sendTeamsDM(upn: string, message: string, botToken: string): Promise<boolean> {
  // Create or get conversation with user
  const convR = await fetch('https://smba.trafficmanager.net/amer/v3/conversations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${botToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ bot: { id: BOT_APP_ID }, members: [{ id: upn }], channelData: { tenant: { id: SHIELD_GRAPH_TENANT } } }),
  });
  const conv = await convR.json() as { id?: string };
  if (!conv.id) return false;

  const msgR = await fetch(`https://smba.trafficmanager.net/amer/v3/conversations/${conv.id}/activities`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${botToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'message', text: message }),
  });
  return msgR.ok;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).end();

  const auth = req.headers['authorization'] || req.query.secret;
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}` && auth !== CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const results: string[] = [];

  try {
    const [graphToken, botToken, deals, stale] = await Promise.all([
      getGraphToken(),
      getBotToken(),
      getRepDeals(),
      getStaleContacts(),
    ]);

    for (const rep of REPS) {
      try {
        const calendar = await getRepCalendar(rep.upn, graphToken);
        const brief    = await composeBrief(rep, calendar, deals, stale);
        const sent     = await sendTeamsDM(rep.upn, brief, botToken);
        results.push(`${rep.name}: ${sent ? '✅ sent' : '❌ failed'}`);
      } catch (e) {
        results.push(`${rep.name}: ❌ error — ${e}`);
      }
    }

    return res.status(200).json({ ok: true, results });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
