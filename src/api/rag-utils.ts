Zconst SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

export function chunkText(text: string, chunkSize = 600, overlap = 100): string[] {
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

export async function createEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text.slice(0, 8000) }),
  });
  if (!response.ok) throw new Error(`OpenAI embedding error: ${await response.text()}`);
  const data = await response.json();
  return data.data[0].embedding;
}

export async function retrieveRelevantChunks(
  query: string,
  tenantId: string,
  topK = 6
): Promise<Array<{ content: string; document_id: string; similarity: number }>> {
  try {
    const embedding = await createEmbedding(query);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/match_rag_chunks`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query_embedding: embedding,
        match_tenant_id: tenantId,
        match_count: topK,
      }),
    });
    if (!response.ok) return [];
    const chunks = await response.json();
    return (chunks || []).filter((c: any) => c.similarity > 0.3);
  } catch {
    return [];
  }
}
