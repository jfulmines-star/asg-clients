import React, { useState } from 'react'

export default function MROLanding() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/mro-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (data.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0f1e',
      color: '#e2e8f0',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 20px 60px',
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #475569; }
        input:focus { outline: none; border-color: #4ADE80 !important; box-shadow: 0 0 0 3px rgba(74,222,128,0.15); }
        @media (max-width: 480px) {
          .stat-grid { grid-template-columns: 1fr !important; }
          .hero-h1 { font-size: 28px !important; }
          .hero-sub { font-size: 15px !important; }
        }
      `}</style>

      {/* Nav bar — minimal */}
      <div style={{
        width: '100%',
        maxWidth: '720px',
        padding: '24px 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#4ADE80' }}>
          REX
        </div>
        <div style={{ fontSize: '11px', color: '#334155', letterSpacing: '1px', textTransform: 'uppercase' }}>
          MRO Americas 2026
        </div>
      </div>

      {/* Hero */}
      <div style={{ width: '100%', maxWidth: '720px', marginTop: '72px' }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: '#4ADE80',
          marginBottom: '20px',
        }}>
          MRO Americas 2026
        </div>

        <h1 className="hero-h1" style={{
          fontSize: 'clamp(28px, 5vw, 48px)',
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          marginBottom: '24px',
        }}>
          Your competitors are<br />already calling.
        </h1>

        <p className="hero-sub" style={{
          fontSize: 'clamp(15px, 2vw, 18px)',
          color: '#94a3b8',
          lineHeight: 1.7,
          maxWidth: '560px',
        }}>
          Rex processes overnight intelligence and surfaces exactly what matters — contracts, contacts, competitive moves — before your day starts.
        </p>
      </div>

      {/* Stat cards */}
      <div
        className="stat-grid"
        style={{
          width: '100%',
          maxWidth: '720px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginTop: '56px',
        }}
      >
        {[
          { num: '5–10 days', label: 'faster sales cycle per account' },
          { num: 'Zero', label: 'manual CRM updates' },
          { num: '100%', label: 'pipeline visibility, before the workday starts' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: '#0d1527',
            border: '1px solid rgba(74,222,128,0.25)',
            borderTop: '2px solid #4ADE80',
            borderRadius: '8px',
            padding: '24px 20px',
          }}>
            <div style={{
              fontSize: 'clamp(20px, 2.5vw, 28px)',
              fontWeight: 800,
              color: '#4ADE80',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              marginBottom: '10px',
            }}>
              {stat.num}
            </div>
            <div style={{
              fontSize: '13px',
              color: '#64748b',
              lineHeight: 1.5,
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{
        width: '100%',
        maxWidth: '720px',
        height: '1px',
        background: 'linear-gradient(to right, transparent, #1e2d4a, transparent)',
        margin: '64px 0',
      }} />

      {/* Email capture */}
      <div style={{ width: '100%', maxWidth: '560px', textAlign: 'center' }}>
        <h2 style={{
          fontSize: 'clamp(22px, 3vw, 30px)',
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '-0.025em',
          marginBottom: '12px',
        }}>
          Watch Rex work.
        </h2>
        <p style={{
          fontSize: '15px',
          color: '#64748b',
          lineHeight: 1.6,
          marginBottom: '32px',
        }}>
          Drop your email — we'll send you the 90-second demo.
        </p>

        {status === 'success' ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '18px 24px',
            background: 'rgba(74,222,128,0.08)',
            border: '1px solid rgba(74,222,128,0.25)',
            borderRadius: '8px',
            fontSize: '15px',
            color: '#4ADE80',
            fontWeight: 500,
          }}>
            ✓ Check your inbox. The demo is on its way.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@company.com"
              required
              style={{
                width: '100%',
                padding: '14px 18px',
                background: '#0d1527',
                border: '1px solid #1e2d4a',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '16px',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                width: '100%',
                padding: '15px 24px',
                background: status === 'loading' ? '#2d7a4f' : '#4ADE80',
                color: '#0a0f1e',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 700,
                fontFamily: 'inherit',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                letterSpacing: '0.02em',
                transition: 'background 0.2s, transform 0.1s',
              }}
              onMouseEnter={e => { if (status !== 'loading') (e.target as HTMLButtonElement).style.background = '#22c55e' }}
              onMouseLeave={e => { if (status !== 'loading') (e.target as HTMLButtonElement).style.background = '#4ADE80' }}
            >
              {status === 'loading' ? 'Sending…' : 'Send me the demo →'}
            </button>
            {status === 'error' && (
              <div style={{ fontSize: '13px', color: '#f87171', textAlign: 'center' }}>
                Something went wrong — try{' '}
                <a href="mailto:jfulmines@axiomstreamgroup.com" style={{ color: '#f87171' }}>
                  jfulmines@axiomstreamgroup.com
                </a>
              </div>
            )}
          </form>
        )}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '80px',
        fontSize: '12px',
        color: '#334155',
        textAlign: 'center',
        letterSpacing: '0.05em',
      }}>
        AxiomStream Group · axiomstreamgroup.com
      </div>
    </div>
  )
}
