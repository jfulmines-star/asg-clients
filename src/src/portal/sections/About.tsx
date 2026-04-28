/**
 * About section — agent-specific story.
 * Reads config.aboutPoints; falls back to a generic four-point story.
 */
import { FONT_STACK } from '../theme'
import type { ModuleContext } from '../types'

export function AboutSection({ config, accent, tv }: ModuleContext) {
  const points = config.aboutPoints && config.aboutPoints.length > 0
    ? config.aboutPoints
    : [
        { icon: '🎯', title: `Built for ${config.company}`, body: `${config.agentLabel} was configured for how you operate. The intake context loads into every conversation — not generic advice, advice calibrated to your practice.` },
        { icon: '🔍', title: 'Research That Goes Deep', body: `Ask ${config.agentLabel} to find the right contacts, understand a market, draft documents, or pressure-test a thesis. Real research, structured and ready to use.` },
        { icon: '⚙️', title: 'It Learns You', body: 'Every implementation builds context around your practice. That context never gets lost. The longer you use it, the more useful it becomes.' },
        { icon: '🏗️', title: 'The ASG Model', body: 'AxiomStream Group builds purpose-specific AI for professionals. A tool built for one practice, configured for one team.' },
      ]

  return (
    <div style={{ maxWidth: 720, fontFamily: FONT_STACK, color: tv.text }}>
      <div style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: accent, fontWeight: 700, marginBottom: 16 }}>
        The Technology
      </div>
      <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 24, lineHeight: 1.1 }}>
        {config.agentLabel} — How It Works
      </h2>
      {points.map((p, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: 18,
            alignItems: 'flex-start',
            padding: '20px 0',
            borderBottom: `1px solid ${tv.border}`,
          }}
        >
          <div style={{ fontSize: 26, flexShrink: 0 }}>{p.icon}</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{p.title}</div>
            <div style={{ fontSize: 14, color: tv.gray, lineHeight: 1.7 }}>{p.body}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
