const fetch = require('node-fetch');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

async function main() {
  console.log('Testing direct Anthropic API call with claude-haiku-4-5-20251001...');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [{ role: 'user', content: 'test' }]
    })
  });
  console.log('Status:', res.status);
  console.log('Response:', await res.text());
}

main().catch(console.error);
