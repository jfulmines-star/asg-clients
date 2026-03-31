/**
 * portal-chat-history — simple per-slug chat history for ClientPortalV2
 * GET  ?slug=X          → { messages: [{role, content}] }
 * POST { slug, role, content }  → saves message
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

const UPSTASH_URL = 'https://renewed-macaw-61269.upstash.io'
const UPSTASH_TOKEN = process.env.UPSTASH_TOKEN || 'Ae9VAAIncDIzYWNmNzg3NGJjMDE0ZWFmYThmNWM2YzM4MzE5NTRjNHAyNjEyNjk'

async function upstash(cmd: (string | number)[]) {
  const res = await fetch(UPSTASH_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  })
  return res.json()
}

function historyKey(slug: string) {
  return `portal-v2-history:${slug}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    const slug = String(req.query.slug || '')
    if (!slug) return res.status(400).json({ error: 'slug required' })
    const result = await upstash(['LRANGE', historyKey(slug), -100, -1])
    const messages = (Array.isArray(result.result) ? result.result : [])
      .map((s: string) => { try { return JSON.parse(s) } catch { return null } })
      .filter(Boolean)
    return res.status(200).json({ messages })
  }

  if (req.method === 'POST') {
    const { slug, role, content } = req.body || {}
    if (!slug || !role || !content) return res.status(400).json({ error: 'slug, role, content required' })
    const entry = JSON.stringify({ role, content, ts: Date.now() })
    await upstash(['RPUSH', historyKey(slug), entry])
    await upstash(['LTRIM', historyKey(slug), -200, -1]) // keep last 200
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'method not allowed' })
}
