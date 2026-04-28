import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IncomingForm, File as FormidableFile } from 'formidable';
import * as fs from 'fs';
import * as path from 'path';

export const config = { api: { bodyParser: false } };

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

function chunkText(text: string, chunkSize = 600, overlap = 100): string[] {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 50) chunks.push(chunk.trim());
    i += chunkSize - overlap;
  }
  return chunks;
}

async function createEmbedding(text: string): Promise<number[]> {
  const r = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text.slice(0, 8000) }),
  });
  if (!r.ok) throw new Error(`Embedding failed: ${await r.text()}`);
  const d = await r.json();
  return d.data[0].embedding;
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Use pdf-parse if available, otherwise fall back to raw text extraction
  try {
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch {
    // Fallback: extract printable ASCII text from buffer
    return buffer.toString('latin1').replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s{3,}/g, '\n').trim();
  }
}

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tiff', '.tif'];

function isImageFile(filename: string): boolean {
  return IMAGE_EXTENSIONS.includes(path.extname(filename).toLowerCase());
}

async function extractTextFromImage(buffer: Buffer, filename: string): Promise<string> {
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  const mimeMap: Record<string, string> = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
    gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp',
    tiff: 'image/tiff', tif: 'image/tiff',
  };
  const mimeType = mimeMap[ext] || 'image/png';
  const base64 = buffer.toString('base64');

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract ALL text from this image exactly as it appears. Include every word, number, label, and piece of text visible. If it is a table or spreadsheet, preserve the structure. If it is a chart or diagram, describe what it shows and include any text labels. Output only the extracted content — no preamble, no commentary.',
            },
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'high' },
            },
          ],
        },
      ],
    }),
  });

  if (!r.ok) throw new Error(`OCR vision call failed: ${await r.text()}`);
  const d = await r.json();
  const text = d.choices?.[0]?.message?.content || '';
  if (!text || text.trim().length < 5) throw new Error('No text extracted from image');
  return text;
}

async function extractText(buffer: Buffer, filename: string): Promise<string> {
  const ext = path.extname(filename).toLowerCase();
  if (isImageFile(filename)) return extractTextFromImage(buffer, filename);
  if (ext === '.pdf') return extractTextFromPDF(buffer);
  if (['.txt', '.md', '.csv'].includes(ext)) return buffer.toString('utf-8');
  if (['.doc', '.docx'].includes(ext)) {
    try {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    } catch {
      return buffer.toString('utf-8');
    }
  }
  return buffer.toString('utf-8');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Parse multipart form
  const form = new IncomingForm({ maxFileSize: 20 * 1024 * 1024, keepExtensions: true });

  let fields: Record<string, string> = {};
  let file: FormidableFile | null = null;

  try {
    await new Promise<void>((resolve, reject) => {
      form.parse(req, (err, parsedFields, parsedFiles) => {
        if (err) return reject(err);
        for (const [k, v] of Object.entries(parsedFields)) {
          fields[k] = Array.isArray(v) ? v[0] : (v || '');
        }
        const f = parsedFiles.file;
        file = Array.isArray(f) ? f[0] : (f || null);
        resolve();
      });
    });
  } catch (err: any) {
    return res.status(400).json({ error: `Form parse error: ${err.message}` });
  }

  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const tenantId = fields.tenantId || 'default';
  const filename = (file as any).originalFilename || (file as any).name || 'upload';
  const fileBuffer = fs.readFileSync((file as any).filepath || (file as any).path);
  const fileSizeBytes = fileBuffer.length;
  const fileType = path.extname(filename).replace('.', '').toLowerCase() || 'unknown';

  // Extract text
  let extractedText = '';
  try {
    extractedText = await extractText(fileBuffer, filename);
  } catch (err: any) {
    return res.status(500).json({ error: `Text extraction failed: ${err.message}` });
  }

  if (!extractedText || extractedText.trim().length < 10) {
    return res.status(422).json({ error: 'Could not extract content from file. For images, ensure the image contains readable text. For documents, try PDF or DOCX format.' });
  }

  // Create document record in Supabase
  const docResp = await fetch(`${SUPABASE_URL}/rest/v1/rag_documents`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      tenant_id: tenantId,
      filename,
      file_type: fileType,
      file_size_bytes: fileSizeBytes,
      status: 'processing',
      chunk_count: 0,
    }),
  });

  if (!docResp.ok) {
    const errText = await docResp.text();
    return res.status(500).json({ error: `Database error: ${errText}` });
  }

  const docData = await docResp.json();
  const documentId = Array.isArray(docData) ? docData[0]?.id : docData?.id;

  if (!documentId) {
    return res.status(500).json({ error: 'Failed to create document record' });
  }

  // Chunk and embed in background (don't await — return success immediately)
  (async () => {
    try {
      const chunks = chunkText(extractedText);
      let successCount = 0;

      for (let i = 0; i < chunks.length; i++) {
        try {
          const embedding = await createEmbedding(chunks[i]);
          await fetch(`${SUPABASE_URL}/rest/v1/rag_document_chunks`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              document_id: documentId,
              tenant_id: tenantId,
              content: chunks[i],
              embedding,
              chunk_index: i,
            }),
          });
          successCount++;
        } catch {
          // Skip failed chunks, continue
        }
      }

      // Update document status to ready
      await fetch(`${SUPABASE_URL}/rest/v1/rag_documents?id=eq.${documentId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'ready', chunk_count: successCount }),
      });
    } catch {
      // Mark as failed
      await fetch(`${SUPABASE_URL}/rest/v1/rag_documents?id=eq.${documentId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'failed' }),
      }).catch(() => {});
    }
  })();

  return res.status(200).json({
    success: true,
    document_id: documentId,
    filename,
    file_type: fileType,
    file_size_bytes: fileSizeBytes,
    message: 'File uploaded and processing started',
  });
}
