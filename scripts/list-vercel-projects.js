const fetch = require('node-fetch');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

async function main() {
  const url = `https://api.vercel.com/v9/projects`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`
    }
  });
  if (!res.ok) {
    console.error('Failed to fetch projects:', res.status, await res.text());
    return;
  }
  const data = await res.json();
  console.log('Projects:');
  for (const p of data.projects || []) {
    console.log(`- Name: ${p.name}, ID: ${p.id}`);
  }
}

main().catch(console.error);
