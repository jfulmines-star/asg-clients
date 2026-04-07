import { useParams } from 'react-router-dom'

// ─── Client registry ────────────────────────────────────────────────────────
// Add a new client here when they're onboarded.
// products: array of product IDs the client has purchased.
// Each product ID maps to a URL at {id}.axiomstreamgroup.com/{slug}

const PRODUCT_META: Record<string, { name: string; tagline: string; color: string; description: string }> = {
  kit: {
    name: 'Kit',
    tagline: 'Your Personal AI',
    color: '#7C3AED',
    description: 'Built for you specifically - remembers everything, takes action, works in Finnish or English.',
  },
  aria: {
    name: 'Aria',
    tagline: 'Tax & Accounting AI',
    color: '#27B5A3',
    description: 'IRC research, memo drafting, and ASC 740 analysis - calibrated to your practice.',
  },
  lex: {
    name: 'Lex',
    tagline: 'Legal & Compliance AI',
    color: '#E8B84B',
    description: 'Case law research, motion drafting, and contract review - calibrated to your firm.',
  },
  rex: {
    name: 'Rex',
    tagline: 'Sales & Revenue AI',
    color: '#4ADE80',
    description: 'CRM-connected prospecting, follow-up sequences, and deal intelligence.',
  },
  atlas: {
    name: 'Atlas',
    tagline: 'Data & Engineering AI',
    color: '#E8724B',
    description: 'GL normalization, data pipeline automation, and analytical infrastructure.',
  },
}

interface ClientConfig {
  name: string
  tier: 'trial' | 'starter' | 'team' | 'enterprise'
  products: string[]
  contactEmail?: string
  bundleChat?: boolean  // if true, links to /slug/chat (Bundle Chat) instead of {product}.axiomstreamgroup.com/{slug}
}

const CLIENT_REGISTRY: Record<string, ClientConfig> = {
  // ── Demo / internal ──────────────────────────────────────────────────────
  demo: {
    name: 'Demo Account',
    tier: 'team',
    products: ['aria', 'lex', 'rex', 'atlas'],
  },
  // ── Shield Technologies ──────────────────────────────────────────────────
  shield: {
    name: 'Shield Technologies',
    tier: 'team',
    products: ['rex'],
  },
  // ── Octant8 ──────────────────────────────────────────────────────────────
  octant8kevin: {
    name: 'Kevin Gosa - Octant8',
    tier: 'trial',
    products: ['rex'],
    contactEmail: 'Kevin.gosa@octant8.com',
    bundleChat: true,
  },
  octant8bryan: {
    name: 'Bryan Horvath - Octant8',
    tier: 'trial',
    products: ['rex'],
    contactEmail: 'bryan.horvath@octant8.com',
    bundleChat: true,
  },
  // ── Personal / Family ────────────────────────────────────────────────────
  lilyg: {
    name: 'Lily Fulmines',
    tier: 'trial',
    products: ['aria', 'lex', 'rex'],
    bundleChat: true,
  },
  // ── Real clients (add as they onboard) ──────────────────────────────────
  blake: {
    name: 'Blake Warren - Winthrop Realty Group',
    tier: 'trial',
    products: ['rex'],
    bundleChat: true,
  },
  'winthrop-blake': {
    name: 'Blake Warren - Winthrop Realty Group',
    tier: 'trial',
    products: ['rex'],
    bundleChat: true,
  },
  'winthrop-andrew': {
    name: 'Andrew Armour - Winthrop Realty Group',
    tier: 'trial',
    products: ['rex'],
    bundleChat: true,
  },
  anttip: {
    name: 'Antti Pasila',
    tier: 'trial',
    products: ['kit'],
    contactEmail: 'antti@axiomstreamgroup.com',
    bundleChat: true,
  },
  ryanh: {
    name: 'Ryan Hopper - Shield Technologies',
    tier: 'trial',
    products: ['rex'],
    bundleChat: true,
  },
  markb: {
    name: 'Mark Bechtel - Shield Technologies',
    tier: 'trial',
    products: ['rex'],
    bundleChat: true,
  },
  'rex.asg': {
    name: 'Ken Kocolowski - RBP Chemical',
    tier: 'trial',
    products: ['rex'],
    bundleChat: true,
  },
  kenk: {
    name: 'Ken Kocolowski - RBP Chemical',
    tier: 'trial',
    products: ['rex'],
    bundleChat: true,
  },
  // rj: { name: 'RJ Genovese - Bonadio', tier: 'trial', products: ['aria'] },
  // jt: { name: 'John Touhey', tier: 'starter', products: ['lex'] },
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function tierBadge(tier: ClientConfig['tier']) {
  const map = {
    trial: { label: '14-Day Trial', color: '#888' },
    starter: { label: 'Starter', color: '#27B5A3' },
    team: { label: 'Team', color: '#A78BFA' },
    enterprise: { label: 'Enterprise', color: '#E8B84B' },
  }
  return map[tier]
}

// ─── Component ──────────────────────────────────────────────────────────────
// Ken's portal entry: kenk (PIN: 2847) - restored 2026-04-07
export default function Portal() {
  const { clientSlug } = useParams<{ clientSlug: string }>()
  const slug = (clientSlug ?? '').toLowerCase()
  const client = CLIENT_REGISTRY[slug]

  
  if (!client) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Access not found</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>This link doesn't match any active account. Check your onboarding email or contact your ASG representative.</p>
        <a href="mailto:kit@axiomstreamgroup.com" style={{ color: '#27B5A3', textDecoration: 'none', fontSize: '0.9rem' }}>kit@axiomstreamgroup.com</a>
      </div>
    )
  }

  const badge = tierBadge(client.tier)

  return (
    <div style={{ minHeight: '100vh', padding: '0' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '1.25rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>AxiomStream Group</span>
          <span style={{ color: '#444', fontSize: '0.8rem' }}>·</span>
          <span style={{ color: '#555', fontSize: '0.85rem' }}>Client Portal</span>
        </div>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: badge.color,
          border: `1px solid ${badge.color}40`,
          background: `${badge.color}10`,
          padding: '0.25rem 0.6rem',
          borderRadius: '4px',
        }}>
          {badge.label}
        </span>
      </header>

      {/* Main */}
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Welcome */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ color: '#555', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>
            Welcome
          </p>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
            {client.name}
          </h1>
          <p style={{ color: '#555', fontSize: '0.9rem' }}>
            Your {client.products.length === 1 ? 'agent is' : 'agents are'} ready. Select one below to get started.
          </p>
        </div>

        {/* Product cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem',
          marginBottom: '3rem',
        }}>
          {client.products.map(id => {
            const meta = PRODUCT_META[id]
            if (!meta) return null
            const url = client.bundleChat
              ? `/${slug}/chat`
              : `https://${id}.axiomstreamgroup.com/${slug}`
            return (
              <a
                key={id}
                href={url}
                style={{
                  display: 'block',
                  padding: '1.5rem',
                  border: `1px solid ${meta.color}25`,
                  borderRadius: '12px',
                  background: `${meta.color}06`,
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'border-color 0.15s, background 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${meta.color}55`
                  ;(e.currentTarget as HTMLElement).style.background = `${meta.color}0e`
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${meta.color}25`
                  ;(e.currentTarget as HTMLElement).style.background = `${meta.color}06`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.25rem', color: meta.color }}>{meta.name}</span>
                  <span style={{ color: meta.color, fontSize: '1.1rem', opacity: 0.6 }}>→</span>
                </div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555', marginBottom: '0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {meta.tagline}
                </p>
                <p style={{ fontSize: '0.82rem', color: '#555', lineHeight: 1.55 }}>
                  {meta.description}
                </p>
              </a>
            )
          })}
        </div>

        {/* Footer strip */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexDirection: 'column' as const,
          gap: '0.35rem',
        }}>
          <p style={{ color: '#3a3a3a', fontSize: '0.8rem' }}>
            Questions? Contact your ASG representative or email{' '}
            <a href="mailto:kit@axiomstreamgroup.com" style={{ color: '#27B5A3', textDecoration: 'none' }}>kit@axiomstreamgroup.com</a>
          </p>
          <p style={{ color: '#2a2a2a', fontSize: '0.75rem' }}>
            © {new Date().getFullYear()} AxiomStream Group · <a href="https://axiomstreamgroup.com" style={{ color: '#2a2a2a', textDecoration: 'none' }}>axiomstreamgroup.com</a>
          </p>
        </div>
      </main>
    </div>
  )
}
