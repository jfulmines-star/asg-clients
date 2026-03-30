import { useRef, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import html2canvas from 'html2canvas'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ChartType = 'bar' | 'line' | 'donut' | 'table' | 'comparison'

interface BarDataItem    { label: string; value: number }
interface LineDataItem   { x: string; y: number }
interface DonutDataItem  { name: string; value: number; color?: string }
interface ComparisonItem { label: string; value1: number; value2: number; label1?: string; label2?: string }
interface TableData      { headers: string[]; rows: string[][] }

export interface ChartSpec {
  type: ChartType
  title: string
  subtitle?: string
  unit?: string
  color?: string
  data?: BarDataItem[] | LineDataItem[] | DonutDataItem[] | ComparisonItem[] | TableData
}

interface ChartRendererProps {
  spec: ChartSpec
  whiteLabel?: boolean
}

// ─── Unit formatting ─────────────────────────────────────────────────────────

const PREFIX_UNITS = ['$', '£', '€', '¥']

function formatNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000) return (value / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 1 }) + 'M'
  if (Math.abs(value) >= 1_000) return (value / 1_000).toLocaleString('en-US', { maximumFractionDigits: 1 }) + 'K'
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function formatValue(value: number | undefined, unit?: string, compact = false): string {
  if (value === undefined || value === null) return ''
  const u = unit || ''
  const formatted = compact ? formatNumber(value) : value.toLocaleString('en-US')
  if (PREFIX_UNITS.some(p => u.startsWith(p))) {
    const prefix = u[0]
    const suffix = u.slice(1)
    return `${prefix}${formatted}${suffix}`
  }
  return `${formatted}${u}`
}

function yAxisTickFormatter(unit?: string) {
  return (value: number) => formatValue(value, unit, true)
}

// ─── Palette ─────────────────────────────────────────────────────────────────

const DEFAULT_PALETTE = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, unit }: { active?: boolean; payload?: { name?: string; value?: number }[]; label?: string; unit?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1e293b', border: '1px solid #ffffff20', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#fff' }}>
      {label && <div style={{ color: '#94a3b8', marginBottom: '4px' }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span>{p.name || 'Value'}:</span>
          <strong>{formatValue(p.value, unit, false)}</strong>
        </div>
      ))}
    </div>
  )
}

// ─── Download helper ──────────────────────────────────────────────────────────

async function downloadChart(el: HTMLDivElement, title: string, whiteLabel: boolean) {
  const canvas = await html2canvas(el, { backgroundColor: '#0a0f1e', scale: 3, useCORS: true })

  if (!whiteLabel) {
    // Overlay ASG branding on a second canvas
    const branded = document.createElement('canvas')
    branded.width = canvas.width
    branded.height = canvas.height + 28
    const ctx = branded.getContext('2d')!
    ctx.fillStyle = '#0a0f1e'
    ctx.fillRect(0, 0, branded.width, branded.height)
    ctx.drawImage(canvas, 0, 0)
    ctx.fillStyle = '#ffffff30'
    ctx.font = `${12 * 2}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText('Powered by AxiomStream Group', branded.width / 2, canvas.height + 20)

    const link = document.createElement('a')
    link.download = `chart-${title.toLowerCase().replace(/\s+/g, '-')}.png`
    link.href = branded.toDataURL()
    link.click()
  } else {
    const link = document.createElement('a')
    link.download = `chart-${title.toLowerCase().replace(/\s+/g, '-')}.png`
    link.href = canvas.toDataURL()
    link.click()
  }
}

// ─── Chart rendering helpers ──────────────────────────────────────────────────

function renderBar(spec: ChartSpec) {
  const data = (spec.data as BarDataItem[]).map(d => ({ name: d.label, value: d.value }))
  const color = spec.color || DEFAULT_PALETTE[0]
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
        <XAxis dataKey="name" stroke="#ffffff40" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <YAxis stroke="#ffffff40" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={yAxisTickFormatter(spec.unit)} />
        <Tooltip content={<CustomTooltip unit={spec.unit} />} />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function renderLine(spec: ChartSpec) {
  const data = (spec.data as LineDataItem[]).map(d => ({ name: d.x, value: d.y }))
  const color = spec.color || DEFAULT_PALETTE[0]
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
        <XAxis dataKey="name" stroke="#ffffff40" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <YAxis stroke="#ffffff40" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={yAxisTickFormatter(spec.unit)} />
        <Tooltip content={<CustomTooltip unit={spec.unit} />} />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ fill: color, r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function renderDonut(spec: ChartSpec) {
  const data = spec.data as DonutDataItem[]
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
          {data.map((entry, i) => (
            <Cell key={`cell-${i}`} fill={entry.color || DEFAULT_PALETTE[i % DEFAULT_PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip unit={spec.unit} />} />
        <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '11px' }}>{value}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}

function renderComparison(spec: ChartSpec) {
  const items = spec.data as ComparisonItem[]
  const data = items.map(d => ({ name: d.label, [d.label1 || 'Series 1']: d.value1, [d.label2 || 'Series 2']: d.value2 }))
  const label1 = items[0]?.label1 || 'Series 1'
  const label2 = items[0]?.label2 || 'Series 2'
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
        <XAxis dataKey="name" stroke="#ffffff40" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <YAxis stroke="#ffffff40" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={yAxisTickFormatter(spec.unit)} />
        <Tooltip content={<CustomTooltip unit={spec.unit} />} />
        <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '11px' }}>{value}</span>} />
        <Bar dataKey={label1} fill={DEFAULT_PALETTE[0]} radius={[4, 4, 0, 0]} />
        <Bar dataKey={label2} fill={DEFAULT_PALETTE[1]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function renderTable(spec: ChartSpec) {
  const { headers, rows } = spec.data as TableData
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{ textAlign: 'left', padding: '8px 12px', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #ffffff15' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid #ffffff08' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: '8px 12px', color: '#ffffff', lineHeight: '1.5' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChartRenderer({ spec, whiteLabel = false }: ChartRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!containerRef.current || downloading) return
    setDownloading(true)
    try {
      await downloadChart(containerRef.current, spec.title, whiteLabel)
    } finally {
      setDownloading(false)
    }
  }

  let chart: React.ReactNode = null
  try {
    switch (spec.type) {
      case 'bar':        chart = renderBar(spec);        break
      case 'line':       chart = renderLine(spec);       break
      case 'donut':      chart = renderDonut(spec);      break
      case 'comparison': chart = renderComparison(spec); break
      case 'table':      chart = renderTable(spec);      break
    }
  } catch {
    chart = <div style={{ color: '#94a3b8', fontSize: '13px' }}>Unable to render chart.</div>
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: '12px',
        border: '1px solid #ffffff15',
        padding: '20px',
        margin: '12px 0',
        background: 'transparent',
      }}
    >
      {/* Download button */}
      <button
        onClick={handleDownload}
        title="Download chart"
        data-html2canvas-ignore="true"
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: '#ffffff15',
          border: '1px solid #ffffff20',
          borderRadius: '6px',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '4px 8px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.15s ease',
          pointerEvents: hovered ? 'auto' : 'none',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 1v7M3.5 5.5L6 8l2.5-2.5M1 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {downloading ? '…' : 'PNG'}
      </button>

      {/* Title & subtitle */}
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>{spec.title}</div>
      {spec.subtitle && (
        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>{spec.subtitle}</div>
      )}

      {chart}
    </div>
  )
}
