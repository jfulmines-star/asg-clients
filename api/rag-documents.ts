import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  const tenantId = (req.query.tenantId as string) || 'default';

  // GET — list documents for tenant
  if (req.method === 'GET') {
    try {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/rag_documents?tenant_id=eq.${encodeURIComponent(tenantId)}&order=created_at.desc&limit=50`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!r.ok) {
        const err = await r.text();
        return res.status(500).json({ error: `Database error: ${err.slice(0, 200)}` });
      }
      const docs = await r.json();
      return res.status(200).json(Array.isArray(docs) ? docs : []);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to load documents' });
    }
  }

  // DELETE — remove a document and its chunks
  if (req.method === 'DELETE') {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: 'Missing id' });

    try {
      // Delete chunks first
      await fetch(
        `${SUPABASE_URL}/rest/v1/rag_chunks?document_id=eq.${encodeURIComponent(id)}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
        }
      );
      // Delete document record
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/rag_documents?id=eq.${encodeURIComponent(id)}&tenant_id=eq.${encodeURIComponent(tenantId)}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
        }
      );
      if (!r.ok) {
        const err = await r.text();
        return res.status(500).json({ error: `Delete failed: ${err.slice(0, 200)}` });
      }
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Delete failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
