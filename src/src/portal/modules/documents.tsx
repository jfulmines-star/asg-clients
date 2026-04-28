/**
 * Documents module.
 * Port of MarkPortal's DocumentsSection. Uploads to /api/rag-upload, lists
 * via /api/rag-documents. Tenant namespace comes from moduleOptions.tenantId
 * (defaults to config.slug).
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { FONT_STACK, TOUCH } from '../theme'
import type { Module, ModuleContext } from '../types'

interface DocumentsOptions {
  /** Namespace for RAG docs. Defaults to config.slug. */
  tenantId?: string
  /** Upload endpoint. Default /api/rag-upload */
  uploadEndpoint?: string
  /** List/delete endpoint. Default /api/rag-documents */
  listEndpoint?: string
  /** Accepted MIME types. Default 'application/pdf,.pdf,.txt,.md,.docx' */
  accept?: string
  /** Copy beneath the heading */
  description?: string
}

interface DocEntry {
  id: string
  name: string
  size?: number
  uploadedAt?: string
  pages?: number
}

function DocumentsSection({ config, accent, tv, options }: ModuleContext) {
  const opts = options as DocumentsOptions
  const tenantId = opts.tenantId || config.slug
  const uploadEndpoint = opts.uploadEndpoint || '/api/rag-upload'
  const listEndpoint = opts.listEndpoint || '/api/rag-documents'
  const accept = opts.accept || 'application/pdf,.pdf,.txt,.md,.docx'

  const [docs, setDocs] = useState<DocEntry[] | null>(null)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${listEndpoint}?tenantId=${encodeURIComponent(tenantId)}`)
      if (!r.ok) throw new Error('list failed')
      const data = await r.json()
      const raw = Array.isArray(data) ? data : (data.documents || data.docs || [])
      setDocs(raw.map((d: any) => ({
        id: d.id,
        name: d.name || d.filename,
        size: d.size || d.file_size_bytes,
        uploadedAt: d.uploadedAt || d.created_at,
        pages: d.pages || d.chunk_count,
      })))
    } catch {
      setDocs([])
    }
  }, [listEndpoint, tenantId])

  useEffect(() => { load() }, [load])

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    setStatus(null)
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('tenantId', tenantId)
        const r = await fetch(uploadEndpoint, { method: 'POST', body: fd })
        if (!r.ok) throw new Error(`upload failed for ${file.name}`)
      }
      setStatus(`Uploaded ${files.length} file${files.length > 1 ? 's' : ''}.`)
      await load()
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Upload failed.')
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function remove(id: string) {
    if (!confirm('Remove this document from the knowledge base?')) return
    try {
      await fetch(`${listEndpoint}?tenantId=${encodeURIComponent(tenantId)}&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      await load()
    } catch {
      setStatus('Could not remove document.')
    }
  }

  return (
    <div style={{ maxWidth: 760, fontFamily: FONT_STACK, color: tv.text }}>
      <div style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: accent, fontWeight: 700, marginBottom: 16 }}>
        Knowledge Base
      </div>
      <h2 style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 14, lineHeight: 1.1 }}>
        Documents
      </h2>
      <p style={{ fontSize: 15, color: tv.lightGray, lineHeight: 1.7, marginBottom: 24 }}>
        {opts.description || `Upload documents that ${config.agentLabel} should reference. Contracts, meeting notes, product sheets — any file you want on hand.`}
      </p>

      {/* Upload control */}
      <div
        style={{
          border: `1px dashed ${tv.border}`,
          borderRadius: 10,
          padding: 20,
          marginBottom: 24,
          background: tv.surface,
        }}
      >
        <input
          ref={fileRef}
          type="file"
          multiple
          accept={accept}
          onChange={e => upload(e.target.files)}
          style={{ display: 'none' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              background: accent,
              color: tv.bg,
              border: 'none',
              borderRadius: 8,
              padding: '10px 18px',
              fontSize: 14,
              fontWeight: 700,
              minHeight: TOUCH.minTarget,
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontFamily: FONT_STACK,
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? 'Uploading…' : '+ Upload Files'}
          </button>
          <div style={{ fontSize: 13, color: tv.gray }}>
            {status || `Accepted: ${accept}`}
          </div>
        </div>
      </div>

      {/* Doc list */}
      {docs === null && (
        <div style={{ fontSize: 14, color: tv.gray }}>Loading documents…</div>
      )}
      {docs && docs.length === 0 && (
        <div
          style={{
            padding: 20,
            fontSize: 14,
            color: tv.gray,
            background: tv.surface,
            border: `1px solid ${tv.border}`,
            borderRadius: 10,
            textAlign: 'center',
          }}
        >
          No documents yet. Upload your first file to give {config.agentLabel} reference material.
        </div>
      )}
      {docs && docs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {docs.map(d => (
            <div
              key={d.id}
              style={{
                background: tv.surface,
                border: `1px solid ${tv.border}`,
                borderRadius: 10,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                minHeight: TOUCH.minTarget,
              }}
            >
              <div style={{ fontSize: 20, flexShrink: 0 }}>📄</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: tv.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {d.name}
                </div>
                <div style={{ fontSize: 11, color: tv.gray, marginTop: 3 }}>
                  {d.uploadedAt && new Date(d.uploadedAt).toLocaleDateString()}
                  {d.pages && ` · ${d.pages} pages`}
                  {d.size && ` · ${formatSize(d.size)}`}
                </div>
              </div>
              <button
                onClick={() => remove(d.id)}
                aria-label="Remove document"
                style={{
                  background: 'transparent',
                  color: tv.gray,
                  border: `1px solid ${tv.border}`,
                  borderRadius: 6,
                  padding: '6px 10px',
                  fontSize: 12,
                  cursor: 'pointer',
                  minHeight: 36,
                  fontFamily: FONT_STACK,
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export const documentsModule: Module = {
  id: 'documents',
  nav: { label: 'Documents', icon: '📂' },
  Section: DocumentsSection,
}
