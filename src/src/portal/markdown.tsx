/**
 * MessageContent — minimal markdown renderer for chat output.
 * Handles: **bold**, *italic*, `inline code`, ```code blocks```, # headers,
 * - bullets, 1. numbered lists, [link](url), and \n line breaks.
 *
 * Zero dependencies. Replaces the trimmed-down version in ClientPortalV2.
 *
 * Why inline: chat is the only place markdown matters; pulling in
 * react-markdown + remark-gfm + rehype is ~80kb gzip for one feature.
 */
import type React from 'react'

type Token =
  | { type: 'text'; text: string }
  | { type: 'bold'; text: string }
  | { type: 'italic'; text: string }
  | { type: 'code'; text: string }
  | { type: 'link'; text: string; href: string }

const INLINE_RE = /(\*\*[^*\n]+?\*\*|\*[^*\n]+?\*|`[^`\n]+?`|\[[^\]]+?\]\([^)]+?\))/g

function tokenizeInline(line: string): Token[] {
  const out: Token[] = []
  let last = 0
  let m: RegExpExecArray | null
  INLINE_RE.lastIndex = 0
  while ((m = INLINE_RE.exec(line)) !== null) {
    if (m.index > last) out.push({ type: 'text', text: line.slice(last, m.index) })
    const tok = m[0]
    if (tok.startsWith('**')) out.push({ type: 'bold', text: tok.slice(2, -2) })
    else if (tok.startsWith('`')) out.push({ type: 'code', text: tok.slice(1, -1) })
    else if (tok.startsWith('[')) {
      const linkMatch = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (linkMatch) out.push({ type: 'link', text: linkMatch[1], href: linkMatch[2] })
      else out.push({ type: 'text', text: tok })
    } else if (tok.startsWith('*')) out.push({ type: 'italic', text: tok.slice(1, -1) })
    last = m.index + tok.length
  }
  if (last < line.length) out.push({ type: 'text', text: line.slice(last) })
  return out
}

function renderInline(line: string, keyPrefix: string, accent: string): React.ReactNode[] {
  return tokenizeInline(line).map((t, i) => {
    const k = `${keyPrefix}-${i}`
    switch (t.type) {
      case 'bold':   return <strong key={k}>{t.text}</strong>
      case 'italic': return <em key={k}>{t.text}</em>
      case 'code':   return <code key={k} style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 4, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.92em' }}>{t.text}</code>
      case 'link':   return <a key={k} href={t.href} target="_blank" rel="noreferrer" style={{ color: accent, textDecoration: 'underline' }}>{t.text}</a>
      default:       return <span key={k}>{t.text}</span>
    }
  })
}

interface Block {
  kind: 'paragraph' | 'heading' | 'bullet' | 'numbered' | 'codeblock'
  level?: number
  lines: string[]
  language?: string
}

function blockify(content: string): Block[] {
  const lines = content.split('\n')
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    // Code fence
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim()
      const code: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i])
        i++
      }
      i++ // skip closing fence
      blocks.push({ kind: 'codeblock', lines: code, language: lang })
      continue
    }
    // Heading
    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/)
    if (headingMatch) {
      blocks.push({ kind: 'heading', level: headingMatch[1].length, lines: [headingMatch[2]] })
      i++
      continue
    }
    // Bullet list (- or *)
    if (/^[\-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[\-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[\-*]\s+/, ''))
        i++
      }
      blocks.push({ kind: 'bullet', lines: items })
      continue
    }
    // Numbered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''))
        i++
      }
      blocks.push({ kind: 'numbered', lines: items })
      continue
    }
    // Paragraph (consume until blank line)
    const para: string[] = []
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].trim().startsWith('```') && !/^(#{1,3}\s|[\-*]\s|\d+\.\s)/.test(lines[i])) {
      para.push(lines[i])
      i++
    }
    if (para.length > 0) blocks.push({ kind: 'paragraph', lines: para })
    if (i < lines.length && lines[i].trim() === '') i++ // skip blank line
  }
  return blocks
}

export function MessageContent({ content, accent = '#E8B84B' }: { content: string; accent?: string }) {
  const blocks = blockify(content)
  return (
    <div style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
      {blocks.map((b, bi) => {
        const k = `b${bi}`
        if (b.kind === 'codeblock') {
          return (
            <pre key={k} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '12px 14px',
              margin: '10px 0',
              overflowX: 'auto',
              fontSize: '13px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              lineHeight: 1.5,
            }}>
              <code>{b.lines.join('\n')}</code>
            </pre>
          )
        }
        if (b.kind === 'heading') {
          const sizes = { 1: '20px', 2: '17px', 3: '15px' } as const
          const lvl = (b.level || 2) as 1 | 2 | 3
          return (
            <div key={k} style={{ fontSize: sizes[lvl], fontWeight: 800, margin: '14px 0 6px', lineHeight: 1.3 }}>
              {renderInline(b.lines[0], k, accent)}
            </div>
          )
        }
        if (b.kind === 'bullet') {
          return (
            <ul key={k} style={{ margin: '6px 0', paddingLeft: 22 }}>
              {b.lines.map((it, ii) => (
                <li key={`${k}-${ii}`} style={{ marginBottom: 4, lineHeight: 1.6 }}>
                  {renderInline(it, `${k}-${ii}`, accent)}
                </li>
              ))}
            </ul>
          )
        }
        if (b.kind === 'numbered') {
          return (
            <ol key={k} style={{ margin: '6px 0', paddingLeft: 22 }}>
              {b.lines.map((it, ii) => (
                <li key={`${k}-${ii}`} style={{ marginBottom: 4, lineHeight: 1.6 }}>
                  {renderInline(it, `${k}-${ii}`, accent)}
                </li>
              ))}
            </ol>
          )
        }
        // paragraph — preserve hard line breaks within
        return (
          <p key={k} style={{ margin: '6px 0', lineHeight: 1.7 }}>
            {b.lines.map((ln, li) => (
              <span key={`${k}-${li}`}>
                {renderInline(ln, `${k}-${li}`, accent)}
                {li < b.lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}
