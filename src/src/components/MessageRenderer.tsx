import ChartRenderer, { ChartSpec } from './ChartRenderer'

interface MessageRendererProps {
  content: string
  whiteLabel?: boolean
}

const CHART_REGEX = /<chart>([\s\S]*?)<\/chart>/g

export default function MessageRenderer({ content, whiteLabel = false }: MessageRendererProps) {
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  // Reset regex state
  CHART_REGEX.lastIndex = 0

  while ((match = CHART_REGEX.exec(content)) !== null) {
    // Text before this chart block
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index)
      if (text) parts.push(<span key={`text-${lastIndex}`} style={{ whiteSpace: 'pre-wrap' }}>{text}</span>)
    }

    // Parse chart JSON
    const raw = match[1].trim()
    try {
      const spec: ChartSpec = JSON.parse(raw)
      parts.push(<ChartRenderer key={`chart-${match.index}`} spec={spec} whiteLabel={whiteLabel} />)
    } catch {
      // Fallback: show raw block as code
      parts.push(
        <pre key={`raw-${match.index}`} style={{ background: '#0a0f1e', border: '1px solid #ffffff15', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#94a3b8', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {`<chart>${raw}</chart>`}
        </pre>
      )
    }

    lastIndex = match.index + match[0].length
  }

  // Remaining text after last chart block
  if (lastIndex < content.length) {
    const text = content.slice(lastIndex)
    if (text) parts.push(<span key={`text-${lastIndex}`} style={{ whiteSpace: 'pre-wrap' }}>{text}</span>)
  }

  // No chart blocks found — plain text
  if (parts.length === 0) {
    return <span style={{ whiteSpace: 'pre-wrap' }}>{content}</span>
  }

  return <>{parts}</>
}
