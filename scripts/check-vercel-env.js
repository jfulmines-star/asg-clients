const fetch = require('node-fetch');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const TEAM_ID = 'team_ZvUbIDnGsVgF6fxxBxOoxR9h';
const PROJECT_NAME = 'asg-clients';

async function main() {
  const url = `https://api.vercel.com/v9/projects/${PROJECT_NAME}/env?teamId=${TEAM_ID}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`
    }
  });
  if (!res.ok) {
    console.error('Failed to fetch env:', res.status, await res.text());
    return;
  }
  const data = await res.json();
  console.log('Environment variables count:', data.envs?.length);
  for (const env of data.envs || []) {
    console.log(`- ${env.key} (${env.type}, id: ${env.id})`);
  }
}

main().catch(console.error);
