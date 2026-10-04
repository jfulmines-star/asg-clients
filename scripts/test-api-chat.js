const fetch = require('node-fetch');

async function main() {
  const payload = {
    agent: 'rex',
    message: 'Generate a pipeline brief document for Norfolk and Puget Sound depots as a docx file.',
    slug: 'andrew',
    teamMember: 'Andy',
    history: []
  };

  console.log('Sending mock request to https://clients.axiomstreamgroup.com/api/chat...');
  const res = await fetch('https://clients.axiomstreamgroup.com/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  console.log('Status:', res.status);
  console.log('Headers:', Object.fromEntries(res.headers.entries()));
  
  const text = await res.text();
  console.log('Body:', text);
}

main().catch(console.error);
