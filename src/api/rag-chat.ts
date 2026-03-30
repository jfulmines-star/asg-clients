Zimport type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { api: { bodyParser: true } };

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

async function createEmbedding(text: string): Promise<number[]> {
  const r = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text.slice(0, 8000) }),
  });
  const d = await r.json();
  if (!d.data?.[0]?.embedding) throw new Error('Embedding failed: ' + JSON.stringify(d));
  return d.data[0].embedding;
}

async function getDocumentNames(tenantId: string): Promise<Map<string, string>> {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/rag_documents?tenant_id=eq.${tenantId}&status=eq.ready&select=id,filename`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );
  const docs = await r.json();
  const map = new Map<string, string>();
  if (Array.isArray(docs)) docs.forEach((d: any) => map.set(d.id, d.filename));
  return map;
}

async function retrieveChunks(tenantId: string, queryEmbedding: number[], topK = 8): Promise<Array<{content: string; documentId: string}>> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/match_rag_chunks`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query_embedding: queryEmbedding,
      match_tenant_id: tenantId,
      match_count: topK,
    }),
  });
  const chunks = await r.json();
  if (!Array.isArray(chunks)) return [];
  return chunks
    .filter((c: any) => c.content)
    .map((c: any) => ({ content: c.content, documentId: c.document_id }));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, tenantId, systemPrompt } = req.body;
  if (!messages?.length || !tenantId) return res.status(400).json({ error: 'messages and tenantId required' });

  try {
    // Get the last user message for retrieval
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user')?.content || '';

    // Embed the query and retrieve relevant chunks + document names
    const [queryEmbedding, docNames] = await Promise.all([
      createEmbedding(lastUserMsg),
      getDocumentNames(tenantId),
    ]);
    const chunks = await retrieveChunks(tenantId, queryEmbedding);

    // Build context with filenames so Claude knows which doc each chunk came from
    const docList = docNames.size > 0
      ? `Uploaded documents:\n${[...docNames.values()].map((n, i) => `  ${i + 1}. ${n}`).join('\n')}`
      : '';
    const ragContext = chunks.length > 0
      ? `${docList}\n\nRelevant excerpts:\n\n${chunks.map((c, i) => {
          const filename = docNames.get(c.documentId) || 'unknown document';
          return `[${i + 1}] From "${filename}":\n${c.content}`;
        }).join('\n\n')}`
      : docList;

    const baseSystem = systemPrompt || 'You are a helpful document assistant. Answer questions based on the uploaded documents.';
    const fullSystem = ragContext
      ? `${baseSystem}\n\n${ragContext}\n\nAnswer based on the excerpts above. If the excerpts don't contain the answer, say so clearly.`
      : `${baseSystem}\n\nNo relevant document content was found for this query. Let the user know they may need to upload a relevant document.`;

    // Stream response from Anthropic
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        stream: true,
        system: fullSystem,
        messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      return res.status(500).json({ error: 'Anthropic error', detail: err });
    }

    // Stream the response back
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = anthropicRes.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'content_block_delta' && data.delta?.text) {
              res.write(`data: ${JSON.stringify({ delta: { text: data.delta.text } })}\n\n`);
            }
          } catch { /* skip malformed */ }
        }
      }
    }
    res.end();
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'RAG chat failed' });
  }
}
