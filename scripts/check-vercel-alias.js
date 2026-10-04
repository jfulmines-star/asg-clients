const fetch = require('node-fetch');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_NAME = 'asg-clients';

async function main() {
  const url = `https://api.vercel.com/v4/aliases?projectId=${PROJECT_NAME}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`
    }
  });
  if (!res.ok) {
    console.error('Failed to fetch aliases without teamId:', res.status, await res.text());
    return;
  }
  const data = await res.json();
  console.log('Aliases:');
  for (const alias of data.aliases || []) {
    console.log(`- Domain: ${alias.alias}, Deployment ID: ${alias.deploymentId}, Created: ${new Date(alias.created).toLocaleString()}`);
  }
}

main().catch(console.error);
