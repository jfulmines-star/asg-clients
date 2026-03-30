Zimport type { VercelRequest, VercelResponse } from '@vercel/node'

// ─── Market Data Fetcher for JJ Portal ───────────────────────────────────────
// Sources:
//   Crypto    → CoinGecko public API (no key)
//   Indices   → Yahoo Finance query API (no key)
//   Macro     → FRED CSV (no key)

const FRED_BASE = 'https://fred.stlouisfed.org/graph/fredgraph.csv'

async function fetchFredSeries(seriesId: string): Promise<{ value: number; date: string } | null> {
  try {
    const res = await fetch(`${FRED_BASE}?id=${seriesId}`, {
      headers: { 'User-Agent': 'curl/7.88.1' },
      signal: AbortSignal.timeout(6000),
    })
    const text = await res.text()
    const lines = text.trim().split('\n').filter(l => !l.startsWith('DATE'))
    if (!lines.length) return null
    const last = lines[lines.length - 1].split(',')
    return { date: last[0], value: parseFloat(last[1]) }
  } catch {
    return null
  }
}

async function fetchCrypto(): Promise<Record<string, { usd: number; usd_24h_change: number }>> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,cardano&vs_currencies=usd&include_24hr_change=true',
      { signal: AbortSignal.timeout(6000) }
    )
    return await res.json()
  } catch {
    return {}
  }
}

async function fetchYahooQuote(symbol: string): Promise<{ price: number; changePercent: number } | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=1d`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(6000),
      }
    )
    const data = await res.json()
    const meta = data?.chart?.result?.[0]?.meta
    if (!meta) return null
    const price = meta.regularMarketPrice
    const prev = meta.previousClose || meta.chartPreviousClose
    const changePercent = prev ? ((price - prev) / prev) * 100 : 0
    return { price, changePercent }
  } catch {
    return null
  }
}

export async function getMarketSnapshot(): Promise<string> {
  const [
    crypto,
    sp500,
    nasdaq,
    dow,
    vix,
    tenYr,
    fedFunds,
    cpi,
    unemployment,
  ] = await Promise.all([
    fetchCrypto(),
    fetchYahooQuote('SPY'),
    fetchYahooQuote('QQQ'),
    fetchYahooQuote('DIA'),
    fetchYahooQuote('^VIX'),
    fetchFredSeries('DGS10'),
    fetchFredSeries('FEDFUNDS'),
    fetchFredSeries('CPIAUCSL'),
    fetchFredSeries('UNRATE'),
  ])

  const now = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })

  const fmt = (n: number, decimals = 2) => n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  const pct = (n: number) => `${n >= 0 ? '+' : ''}${fmt(n)}%`

  const lines: string[] = [`## Live Market Data (as of ${now} ET)\n`]

  // Crypto
  lines.push('### Crypto')
  const cryptoMap: Record<string, string> = { bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL', ripple: 'XRP', cardano: 'ADA' }
  for (const [id, label] of Object.entries(cryptoMap)) {
    const c = crypto[id]
    if (c) lines.push(`- **${label}:** $${fmt(c.usd)} (${pct(c.usd_24h_change)} 24h)`)
  }

  // Indices
  lines.push('\n### Indices')
  if (sp500) lines.push(`- **S&P 500 (SPY):** $${fmt(sp500.price)} (${pct(sp500.changePercent)} today)`)
  if (nasdaq) lines.push(`- **Nasdaq 100 (QQQ):** $${fmt(nasdaq.price)} (${pct(nasdaq.changePercent)} today)`)
  if (dow) lines.push(`- **Dow (DIA):** $${fmt(dow.price)} (${pct(dow.changePercent)} today)`)
  if (vix) lines.push(`- **VIX:** ${fmt(vix.price)} (${pct(vix.changePercent)} today)`)

  // Macro
  lines.push('\n### Macro (FRED)')
  if (tenYr) lines.push(`- **10-Year Treasury:** ${fmt(tenYr.value)}% (${tenYr.date})`)
  if (fedFunds) lines.push(`- **Fed Funds Rate:** ${fmt(fedFunds.value)}% (${fedFunds.date})`)
  if (unemployment) lines.push(`- **Unemployment Rate:** ${fmt(unemployment.value)}% (${unemployment.date})`)
  if (cpi) lines.push(`- **CPI (index):** ${fmt(cpi.value)} (${cpi.date})`)

  return lines.join('\n')
}

// ─── API endpoint (optional — can call getMarketSnapshot() directly from chat.ts) ──

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const snapshot = await getMarketSnapshot()
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
  res.json({ snapshot })
}
