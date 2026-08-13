import { useState, useEffect, useMemo } from 'react'

// ─── Design tokens ─────────────────────────────────────────────────────────
const BG = '#0A0A0A'
const SURFACE = '#111111'
const SURFACE2 = '#161616'
const BORDER = '#1F1F1F'
const BORDER2 = '#2A2A2A'
const GRAY = '#6B7280'
const LIGHT_GRAY = '#9CA3AF'
const WHITE = '#F9FAFB'
const BLUE = '#2563EB'
const GOLD = '#F59E0B'
const GREEN = '#10B981'
const RED = '#EF4444'
const ORANGE = '#F97316'
const PURPLE = '#8B5CF6'

const PIN = '1414'

// ─── Types ────────────────────────────────────────────────────────────────
interface Contact {
  name: string
  email: string
  role: string
}

interface SynapseRecord {
  id: string
  created_at: string
  title: string
  body: string
  type: string
  client: string
}

interface ClientRecord {
  id: string
  name: string
  contacts: Contact[]
  dealStage: string
  dealValue: string
  portalSlug: string | null
  notes: string
  contextFile: string
  lastUpdated: string
  synapseRecords: SynapseRecord[]
  synapseLastActivity: string | null
}

interface ApiResponse {
  clients: ClientRecord[]
  fetchedAt: string
  synapseTotal: number
}

// ─── Stage config ─────────────────────────────────────────────────────────
const STAGE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:       { label: 'Active',       color: GREEN,  bg: '#10B98118' },
  negotiating:  { label: 'Negotiating',  color: GOLD,   bg: '#F59E0B18' },
  prospect:     { label: 'Prospect',     color: BLUE,   bg: '#2563EB18' },
  advisory:     { label: 'Advisory',     color: PURPLE, bg: '#8B5CF618' },
  'closed-lost':{ label: 'Closed Lost',  color: RED,    bg: '#EF444418' },
  suspended:    { label: 'Suspended',    color: ORANGE, bg: '#F9731618' },
  personal:     { label: 'Personal',     color: PURPLE, bg: '#8B5CF618' },
  internal:     { label: 'Internal',     color: GRAY,   bg: '#6B728018' },
}

const STAGE_ORDER = ['active', 'negotiating', 'prospect', 'advisory', 'suspended', 'closed-lost', 'personal', 'internal']

function stageCfg(stage: string) {
  return STAGE_CONFIG[stage] || { label: stage, color: GRAY, bg: '#6B728018' }
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return iso }
}

function timeAgo(iso: string | null) {
  if (!iso) return null
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'today'
    if (days === 1) return '1d ago'
    if (days < 7) return `${days}d ago`
    if (days < 30) return `${Math.floor(days / 7)}w ago`
    if (days < 365) return `${Math.floor(days / 30)}mo ago`
    return `${Math.floor(days / 365)}y ago`
  } catch { return null }
}

// ─── PIN screen ────────────────────────────────────────────────────────────
function PinScreen({ onUnlock }: { onUnlock: () => void }) {
  const [digits, setDigits] = useState(['', '', '', ''])
  const [pinError, setPinError] = useState(false)

  function handleDigit(i: number, val: string) {
    const d = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = d
    setDigits(next)
    setPinError(false)
    if (d && i < 3) {
      const el = document.getElementById(`kcp-pin-${i + 1}`)
      if (el) (el as HTMLInputElement).focus()
    }
    if (next.every(v => v !== '') && i === 3) {
      setTimeout(() => checkPin(next), 80)
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      const el = document.getElementById(`kcp-pin-${i - 1}`)
      if (el) (el as HTMLInputElement).focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    const next = [...digits]
    for (let i = 0; i < 4; i++) next[i] = text[i] || ''
    setDigits(next)
    if (text.length === 4) setTimeout(() => checkPin(next), 80)
  }

  function checkPin(d = digits) {
    if (d.join('') === PIN) {
      onUnlock()
    } else {
      setPinError(true)
      setDigits(['', '', '', ''])
      setTimeout(() => {
        const el = document.getElementById('kcp-pin-0')
        if (el) (el as HTMLInputElement).focus()
      }, 100)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#333', marginBottom: '48px' }}>
          KIT — CLIENT CONTEXT
        </div>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '20px', padding: '44px 40px 40px' }}>
          <div style={{ height: '3px', width: '48px', background: BLUE, borderRadius: '2px', margin: '0 auto 28px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: WHITE, margin: '0 0 8px' }}>Enter PIN</h2>
          <p style={{ fontSize: '13px', color: GRAY, margin: '0 0 28px' }}>Internal access only</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
            {digits.map((d, i) => (
              <input
                key={i}
                id={`kcp-pin-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                autoFocus={i === 0}
                style={{
                  width: '56px', height: '64px', textAlign: 'center', fontSize: '26px', fontWeight: 600,
                  background: '#1A1A1A', border: `2px solid ${pinError ? RED : BORDER}`,
                  borderRadius: '12px', color: WHITE, outline: 'none', caretColor: BLUE,
                }}
              />
            ))}
          </div>
          {pinError && <p style={{ fontSize: '13px', color: RED, margin: 0 }}>Incorrect PIN</p>}
        </div>
        <p style={{ fontSize: '12px', color: '#444', marginTop: '32px' }}>
          Kit Context Portal · ASG Internal
        </p>
      </div>
    </div>
  )
}

// ─── Client card ────────────────────────────────────────────────────────────
function ClientCard({ client, onClick, isSelected }: { client: ClientRecord; onClick: () => void; isSelected: boolean }) {
  const stage = stageCfg(client.dealStage)
  const lastSynapse = client.synapseLastActivity
  const activityAge = timeAgo(lastSynapse || client.lastUpdated)

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? SURFACE2 : SURFACE,
        border: `1px solid ${isSelected ? BLUE + '60' : BORDER}`,
        borderRadius: '12px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        marginBottom: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: WHITE, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {client.name}
          </div>
          <div style={{ fontSize: '12px', color: GRAY }}>
            {client.contacts[0]?.name}{client.contacts.length > 1 ? ` +${client.contacts.length - 1}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
            color: stage.color, background: stage.bg, borderRadius: '6px', padding: '3px 8px',
          }}>
            {stage.label}
          </span>
          {activityAge && (
            <span style={{ fontSize: '11px', color: GRAY }}>{activityAge}</span>
          )}
        </div>
      </div>
      {client.dealValue !== 'N/A' && client.dealValue !== '$0' && (
        <div style={{ fontSize: '12px', color: GOLD, marginTop: '8px', fontWeight: 500 }}>
          {client.dealValue}
        </div>
      )}
    </div>
  )
}

// ─── Client detail panel ────────────────────────────────────────────────────
function ClientDetail({ client, onClose }: { client: ClientRecord; onClose: () => void }) {
  const stage = stageCfg(client.dealStage)

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: '24px', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: WHITE, margin: '0 0 6px' }}>{client.name}</h2>
          <span style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
            color: stage.color, background: stage.bg, borderRadius: '6px', padding: '3px 10px',
          }}>
            {stage.label}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: `1px solid ${BORDER}`, borderRadius: '8px', color: GRAY, padding: '6px 12px', cursor: 'pointer', fontSize: '13px' }}
        >
          ✕
        </button>
      </div>

      {/* Deal value */}
      {client.dealValue && client.dealValue !== 'N/A' && (
        <div style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: GRAY, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Deal Value</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: GOLD }}>{client.dealValue}</div>
        </div>
      )}

      {/* Contacts */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: GRAY, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Contacts</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {client.contacts.map((c, i) => (
            <div key={i} style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '10px 14px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: WHITE }}>{c.name}</div>
              <div style={{ fontSize: '12px', color: GRAY, marginTop: '2px' }}>{c.role}</div>
              {c.email && (
                <div style={{ fontSize: '12px', color: BLUE, marginTop: '2px' }}>
                  <a href={`mailto:${c.email}`} style={{ color: BLUE, textDecoration: 'none' }}>{c.email}</a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: GRAY, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Kit Notes</div>
        <div style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '14px 16px', fontSize: '13px', color: LIGHT_GRAY, lineHeight: '1.6' }}>
          {client.notes}
        </div>
      </div>

      {/* Portal link */}
      {client.portalSlug && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: GRAY, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Portal</div>
          <a
            href={`https://clients.axiomstreamgroup.com/${client.portalSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: '8px',
              padding: '8px 14px', color: BLUE, fontSize: '13px', textDecoration: 'none', fontWeight: 500,
            }}
          >
            ↗ clients.axiomstreamgroup.com/{client.portalSlug}
          </a>
        </div>
      )}

      {/* Synapse activity */}
      {client.synapseRecords.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', color: GRAY, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            Recent Synapse Activity ({client.synapseRecords.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {client.synapseRecords.slice(0, 6).map((r, i) => (
              <div key={i} style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '10px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: WHITE, flex: 1 }}>{r.title}</div>
                  <div style={{ fontSize: '11px', color: GRAY, flexShrink: 0 }}>{fmtDate(r.created_at)}</div>
                </div>
                <div style={{ fontSize: '12px', color: LIGHT_GRAY, lineHeight: '1.5' }}>
                  {r.body.length > 200 ? r.body.slice(0, 200) + '…' : r.body}
                </div>
                <div style={{ marginTop: '6px', display: 'flex', gap: '6px' }}>
                  <span style={{ fontSize: '10px', color: GRAY, background: '#1F1F1F', borderRadius: '4px', padding: '2px 6px' }}>
                    {r.type || 'record'}
                  </span>
                  {r.client && (
                    <span style={{ fontSize: '10px', color: GRAY, background: '#1F1F1F', borderRadius: '4px', padding: '2px 6px' }}>
                      {r.client}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meta */}
      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: `1px solid ${BORDER}`, display: 'flex', gap: '16px', fontSize: '12px', color: GRAY }}>
        <span>Context file: <span style={{ color: LIGHT_GRAY }}>{client.contextFile}</span></span>
        <span>Updated: <span style={{ color: LIGHT_GRAY }}>{fmtDate(client.lastUpdated)}</span></span>
      </div>
    </div>
  )
}

// ─── Main portal ──────────────────────────────────────────────────────────
export default function KitContextPortal() {
  const [unlocked, setUnlocked] = useState(false)
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null)

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/kit-context', {
        headers: {
          'x-kit-pin': PIN,
          'Authorization': 'Bearer kit-context-jj-1414',
        },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'API error' }))
        throw new Error(err.error || `HTTP ${res.status}`)
      }
      const json: ApiResponse = await res.json()
      setData(json)
      // Auto-select first active client
      if (!selectedClient && json.clients.length > 0) {
        const first = json.clients.find(c => c.dealStage === 'active') || json.clients[0]
        setSelectedClient(first)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (unlocked) fetchData()
  }, [unlocked])

  const filteredClients = useMemo(() => {
    if (!data) return []
    let list = [...data.clients]

    // Stage filter
    if (stageFilter !== 'all') {
      list = list.filter(c => c.dealStage === stageFilter)
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.notes.toLowerCase().includes(q) ||
        c.contacts.some(ct => ct.name.toLowerCase().includes(q) || ct.role.toLowerCase().includes(q)) ||
        c.dealValue.toLowerCase().includes(q)
      )
    }

    // Sort by stage order
    list.sort((a, b) => {
      const ai = STAGE_ORDER.indexOf(a.dealStage)
      const bi = STAGE_ORDER.indexOf(b.dealStage)
      if (ai !== bi) return ai - bi
      // Within stage: sort by last activity desc
      const aDate = a.synapseLastActivity || a.lastUpdated || ''
      const bDate = b.synapseLastActivity || b.lastUpdated || ''
      return bDate.localeCompare(aDate)
    })

    return list
  }, [data, search, stageFilter])

  // Stage counts
  const stageCounts = useMemo(() => {
    if (!data) return {}
    const counts: Record<string, number> = {}
    for (const c of data.clients) {
      counts[c.dealStage] = (counts[c.dealStage] || 0) + 1
    }
    return counts
  }, [data])

  if (!unlocked) {
    return <PinScreen onUnlock={() => setUnlocked(true)} />
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Inter', -apple-system, sans-serif", color: WHITE }}>
      {/* Top bar */}
      <div style={{
        height: '56px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${BLUE}, ${GOLD})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
          }}>🤖</div>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: WHITE }}>Kit</span>
            <span style={{ fontSize: '14px', color: GRAY }}> / Context Portal</span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {data && (
          <span style={{ fontSize: '12px', color: GRAY }}>
            {data.clients.length} clients · {data.synapseTotal} synapse records · {fmtDate(data.fetchedAt)}
          </span>
        )}

        <button
          onClick={fetchData}
          disabled={loading}
          style={{
            background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: '8px',
            color: loading ? GRAY : LIGHT_GRAY, padding: '6px 12px', cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          {loading ? '⟳ Loading…' : '↻ Refresh'}
        </button>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>

        {/* Left sidebar */}
        <div style={{
          width: selectedClient && !isMobile ? '360px' : '100%',
          borderRight: `1px solid ${BORDER}`,
          display: 'flex', flexDirection: 'column', flexShrink: 0,
          ...(selectedClient && isMobile ? { display: 'none' } : {}),
        }}>
          {/* Search + filter */}
          <div style={{ padding: '16px', borderBottom: `1px solid ${BORDER}` }}>
            <input
              type="text"
              placeholder="Search clients, contacts, notes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', background: SURFACE2,
                border: `1px solid ${BORDER2}`, borderRadius: '10px', color: WHITE,
                fontSize: '13px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Stage filters */}
          <div style={{ padding: '10px 16px 0', borderBottom: `1px solid ${BORDER}`, display: 'flex', gap: '6px', flexWrap: 'wrap', paddingBottom: '10px' }}>
            {[{ id: 'all', label: 'All', count: data?.clients.length || 0 }, ...STAGE_ORDER.map(s => ({ id: s, label: stageCfg(s).label, count: stageCounts[s] || 0 }))].filter(f => f.id === 'all' || f.count > 0).map(f => (
              <button
                key={f.id}
                onClick={() => setStageFilter(f.id)}
                style={{
                  background: stageFilter === f.id ? (f.id === 'all' ? BLUE + '22' : stageCfg(f.id).bg) : 'transparent',
                  border: `1px solid ${stageFilter === f.id ? (f.id === 'all' ? BLUE : stageCfg(f.id).color) + '60' : BORDER}`,
                  borderRadius: '20px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer',
                  color: stageFilter === f.id ? (f.id === 'all' ? BLUE : stageCfg(f.id).color) : GRAY,
                  fontWeight: stageFilter === f.id ? 600 : 400,
                }}
              >
                {f.label} {f.count > 0 && <span style={{ opacity: 0.7 }}>({f.count})</span>}
              </button>
            ))}
          </div>

          {/* Client list */}
          <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px' }}>
            {loading && !data && (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: GRAY }}>
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>⟳</div>
                Loading client context…
              </div>
            )}

            {error && (
              <div style={{ background: '#1A0A0A', border: `1px solid ${RED}40`, borderRadius: '10px', padding: '16px', color: RED, fontSize: '13px' }}>
                <strong>Error:</strong> {error}
                <div style={{ marginTop: '8px' }}>
                  <button onClick={fetchData} style={{ background: 'none', border: `1px solid ${RED}`, borderRadius: '6px', color: RED, padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>
                    Retry
                  </button>
                </div>
              </div>
            )}

            {filteredClients.map(client => (
              <ClientCard
                key={client.id}
                client={client}
                onClick={() => setSelectedClient(selectedClient?.id === client.id ? null : client)}
                isSelected={selectedClient?.id === client.id}
              />
            ))}

            {data && filteredClients.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: GRAY, fontSize: '13px' }}>
                No clients match your search.
              </div>
            )}
          </div>
        </div>

        {/* Right detail panel */}
        {selectedClient && (
          <div style={{
            flex: 1, background: SURFACE, overflow: 'hidden',
            ...(isMobile ? { position: 'fixed', inset: '56px 0 0 0', zIndex: 10, background: SURFACE } : {}),
          }}>
            <ClientDetail
              client={selectedClient}
              onClose={() => setSelectedClient(null)}
            />
          </div>
        )}

        {/* Empty state */}
        {!selectedClient && data && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GRAY, flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '48px' }}>📋</div>
            <div style={{ fontSize: '15px', color: LIGHT_GRAY }}>Select a client to view context</div>
            <div style={{ fontSize: '13px' }}>{filteredClients.length} clients loaded</div>
          </div>
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; }
        input::placeholder { color: #4B5563; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 2px; }
      `}</style>
    </div>
  )
}
