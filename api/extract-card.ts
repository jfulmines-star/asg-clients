import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image, mimeType } = req.body as { image?: string; mimeType?: string };

  if (!image || !mimeType) {
    return res.status(400).json({ error: 'Missing image or mimeType' });
  }

  if (!mimeType.startsWith('image/')) {
    return res.status(400).json({ error: 'mimeType must be an image type' });
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: image,
              },
            },
            {
              type: 'text',
              text: 'You are extracting information from a business card photo. Return ONLY a JSON object with these fields (use null for missing fields): { name, title, company, email, phone, website, address }. No explanation, just the JSON.',
            },
          ],
        },
      ],
    });

    const rawText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Strip markdown code fences if present
    const jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

    let parsed: Record<string, string | null>;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return res.status(422).json({ error: 'Failed to parse card data', raw: rawText });
    }

    return res.status(200).json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[extract-card] error:', message);
    return res.status(500).json({ error: message });
  }
}
