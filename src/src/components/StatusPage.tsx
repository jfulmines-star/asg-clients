import { useState, useEffect, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusLevel = 'operational' | 'degraded' | 'outage' | 'checking'

interface ServiceStatus {
  name: string
  description: string
  status: StatusLevel
  latency?: number
  lastChecked?: Date
  incidents?: string[]
}

interface StatusGroup {
  groupName: string
  services: ServiceStatus[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BRAND = {
  bg: '#0A0B0D',
  surface: '#12151A',
  surfaceHover: '#1A1F27',
  border: '#1E2530',
  accent: '#4A7FA5',
  accentLight: '#5A9BBF',
  textPrimary: '#F0F4F8',
  textSecondary: '#8899AA',
  green: '#22C55E',
  yellow: '#F59E0B',
  red: '#EF4444',
  greenBg: 'rgba(34,197,94,0.1)',
  yellowBg: 'rgba(245,158,11,0.1)',
  redBg: 'rgba(239,68,68,0.1)',
} as const

const STATUS_CONFIG: Record<StatusLevel, { label: string; color: string; bg: string; dot: string }> = {
  operational: { label: 'Operational',   color: BRAND.green,  bg: BRAND.greenBg,  dot: BRAND.green  },
  degraded:    { label: 'Degraded',      color: BRAND.yellow, bg: BRAND.yellowBg, dot: BRAND.yellow },
  outage:      { label: 'Outage',        color: BRAND.red,    bg: BRAND.redBg,    dot: BRAND.red    },
  checking:    { label: 'Checking…',     color: BRAND.textSecondary, bg: 'transparent', dot: BRAND.textSecondary },
}

// ─── Static service definitions ───────────────────────────────────────────────

const INITIAL_GROUPS: StatusGroup[] = [
  {
    groupName: 'Synapse Memory',
    services: [
      { name: 'Synapse API',         description: 'Core memory write/read layer',            status: 'checking' },
      { name: 'Synapse Search',      description: 'Semantic + keyword retrieval',             status: 'checking' },
      { name: 'Entity Router',       description: 'Context routing by person/company',        status: 'checking' },
      { name: 'Compact-State Flush', description: 'Pre-compact flush & restore pipeline',     status: 'checking' },
    ],
  },
  {
    groupName: 'Game of Homes',
    services: [
      { name: 'GoH Web App',         description: 'Next.js frontend (prod)',                  status: 'checking' },
      { name: 'GoH API',             description: 'Backend / serverless functions',           status: 'checking' },
      { name: 'GoH Database',        description: 'Neon Postgres (primary)',                  status: 'checking' },
      { name: 'GoH Auth',            description: 'Supabase auth layer',                      status: 'checking' },
    ],
  },
  {
    groupName: 'Kit Voice',
    services: [
      { name: 'Voice WebSocket',     description: 'Realtime voice relay server',             status: 'checking' },
      { name: 'Kit API Gateway',     description: 'Anthropic inference gateway',             status: 'checking' },
      { name: 'ElevenLabs TTS',      description: 'Text-to-speech synthesis',                status: 'checking' },
      { name: 'Voice Portals',       description: 'Client portal access layer',              status: 'checking' },
    ],
  },
  {
    groupName: 'ASG Infrastructure',
    services: [
      { name: 'VPS (openclaw-kit)',  description: 'Primary gateway — Linux 6.8',             status: 'checking' },
      { name: 'Vercel CDN',          description: 'Edge delivery for all web properties',    status: 'checking' },
      { name: 'Upstash Redis',       description: 'Rate limiting & caching layer',           status: 'checking' },
      { name: 'Slack Integration',   description: 'Kit ↔ Slack relay channel',              status: 'checking' },
    ],
  },
]

// ─── Simulate a health check (replace with real fetch in prod) ────────────────

function simulateCheck(service: ServiceStatus): ServiceStatus {
  // In production, replace with: const res = await fetch(`/api/health/${encodeURIComponent(service.name)}`)
  const rand = Math.random()
  const status: StatusLevel =
    rand > 0.10 ? 'operational' :
    rand > 0.03 ? 'degraded'    :
                  'outage'
  const latency = Math.round(40 + Math.random() * 180)
  return { ...service, status, latency, lastChecked: new Date() }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PulseDot({ color }: { color: string }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        backgroundColor: color, opacity: 0.4,
        animation: 'pulse 2s ease-in-out infinite',
      }} />
      <span style={{
        position: 'relative', display: 'block', width: 10, height: 10,
        borderRadius: '50%', backgroundColor: color,
      }} />
    </span>
  )
}

function StatusBadge({ status }: { status: StatusLevel }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '2px 10px', borderRadius: 20,
      backgroundColor: cfg.bg,
      border: `1px solid ${cfg.color}33`,
      fontSize: 12, fontWeight: 600, color: cfg.color,
      letterSpacing: '0.02em',
    }}>
      <PulseDot color={cfg.dot} />
      {cfg.label}
    </span>
  )
}

function ServiceRow({ service }: { service: ServiceStatus }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: `1px solid ${BRAND.border}`,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: BRAND.textPrimary }}>{service.name}</div>
        <div style={{ fontSize: 12, color: BRAND.textSecondary, marginTop: 2 }}>{service.description}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, marginLeft: 12 }}>
        {service.latency !== undefined && (
          <span style={{ fontSize: 11, color: BRAND.textSecondary, fontFamily: 'monospace' }}>
            {service.latency}ms
          </span>
        )}
        <StatusBadge status={service.status} />
      </div>
    </div>
  )
}

function GroupCard({ group }: { group: StatusGroup }) {
  const allOp = group.services.every(s => s.status === 'operational')
  const anyOut = group.services.some(s => s.status === 'outage')
  const anyDeg = group.services.some(s => s.status === 'degraded')
  const anyCheck = group.services.some(s => s.status === 'checking')

  const groupStatus: StatusLevel =
    anyCheck   ? 'checking'    :
    anyOut     ? 'outage'      :
    anyDeg     ? 'degraded'    :
    allOp      ? 'operational' :
                 'checking'

  return (
    <div style={{
      backgroundColor: BRAND.surface,
      border: `1px solid ${BRAND.border}`,
      borderRadius: 12,
      padding: '20px 20px 4px 20px',
      marginBottom: 16,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: BRAND.textPrimary }}>
          {group.groupName}
        </h3>
        <StatusBadge status={groupStatus} />
      </div>
      <div>
        {group.services.map(service => (
          <ServiceRow key={service.name} service={service} />
        ))}
      </div>
    </div>
  )
}

function OverallBanner({ groups }: { groups: StatusGroup[] }) {
  const allServices = groups.flatMap(g => g.services)
  const anyOut  = allServices.some(s => s.status === 'outage')
  const anyDeg  = allServices.some(s => s.status === 'degraded')
  const anyCheck = allServices.some(s => s.status === 'checking')
  const allOp   = allServices.every(s => s.status === 'operational')

  let label: string
  let color: string
  let bg: string
  let border: string

  if (anyCheck) {
    label = 'Checking system status…'
    color = BRAND.textSecondary
    bg = BRAND.surface
    border = BRAND.border
  } else if (anyOut) {
    label = 'Active incident detected'
    color = BRAND.red
    bg = BRAND.redBg
    border = `${BRAND.red}44`
  } else if (anyDeg) {
    label = 'Some systems degraded'
    color = BRAND.yellow
    bg = BRAND.yellowBg
    border = `${BRAND.yellow}44`
  } else if (allOp) {
    label = 'All systems operational'
    color = BRAND.green
    bg = BRAND.greenBg
    border = `${BRAND.green}44`
  } else {
    label = 'Status unknown'
    color = BRAND.textSecondary
    bg = BRAND.surface
    border = BRAND.border
  }

  return (
    <div style={{
      backgroundColor: bg,
      border: `1px solid ${border}`,
      borderRadius: 12,
      padding: '18px 20px',
      marginBottom: 28,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      {!anyCheck && <PulseDot color={color} />}
      <span style={{ fontSize: 16, fontWeight: 600, color }}>{label}</span>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StatusPage() {
  const [groups, setGroups] = useState<StatusGroup[]>(INITIAL_GROUPS)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const runChecks = useCallback(async () => {
    setRefreshing(true)
    // Stagger checks slightly so the UI feels live
    const updated: StatusGroup[] = []
    for (const group of INITIAL_GROUPS) {
      const checkedServices = group.services.map(simulateCheck)
      updated.push({ ...group, services: checkedServices })
    }
    setGroups(updated)
    setLastRefresh(new Date())
    setRefreshing(false)
  }, [])

  // Initial check on mount
  useEffect(() => {
    runChecks()
  }, [runChecks])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const id = setInterval(runChecks, 60_000)
    return () => clearInterval(id)
  }, [runChecks])

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50%       { transform: scale(2); opacity: 0; }
        }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        backgroundColor: BRAND.bg,
        color: BRAND.textPrimary,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        padding: '0 16px 48px',
      }}>
        {/* Header */}
        <div style={{ maxWidth: 680, margin: '0 auto', paddingTop: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: BRAND.textPrimary, letterSpacing: '-0.02em' }}>
                ASG Status
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: BRAND.textSecondary }}>
                Adaptive Strategy Group — system health dashboard
              </p>
            </div>
            <button
              onClick={runChecks}
              disabled={refreshing}
              aria-label="Refresh status"
              style={{
                background: 'none',
                border: `1px solid ${BRAND.border}`,
                borderRadius: 8,
                padding: '8px 14px',
                color: refreshing ? BRAND.textSecondary : BRAND.accentLight,
                fontSize: 13,
                fontWeight: 500,
                cursor: refreshing ? 'default' : 'pointer',
                transition: 'border-color 0.2s, color 0.2s',
              }}
            >
              {refreshing ? 'Checking…' : '↻ Refresh'}
            </button>
          </div>

          {lastRefresh && (
            <p style={{ fontSize: 12, color: BRAND.textSecondary, marginBottom: 28 }}>
              Last checked: {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          )}

          {/* Overall banner */}
          <OverallBanner groups={groups} />

          {/* Service groups */}
          {groups.map(group => (
            <GroupCard key={group.groupName} group={group} />
          ))}

          {/* Footer */}
          <div style={{
            marginTop: 32,
            paddingTop: 20,
            borderTop: `1px solid ${BRAND.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            <span style={{ fontSize: 12, color: BRAND.textSecondary }}>
              © {new Date().getFullYear()} Adaptive Strategy Group
            </span>
            <span style={{ fontSize: 12, color: BRAND.textSecondary }}>
              Auto-refreshes every 60s
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
